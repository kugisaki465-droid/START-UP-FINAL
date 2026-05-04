/**
 * Dijkstra's Algorithm for SakaySmart Butuan
 *
 * Graph: landmarks = nodes, route_graph_edges = weighted edges
 * Weight options: 'fare' | 'distance' | 'time' | 'transfers'
 *
 * Returns the optimal path with full segment details.
 */

const { getDb } = require('../database/db');

// ─── Priority Queue (min-heap) ────────────────────────────────────────────────
class MinHeap {
  constructor() { this.heap = []; }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  get size() { return this.heap.length; }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].cost <= this.heap[i].cost) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].cost < this.heap[smallest].cost) smallest = l;
      if (r < n && this.heap[r].cost < this.heap[smallest].cost) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Load graph from DB ───────────────────────────────────────────────────────
function buildGraph() {
  const db = getDb();

  const edges = db.prepare(`
    SELECT e.from_landmark, e.to_landmark, e.route_id, e.distance_km,
           e.travel_time_min, e.fare,
           r.name AS route_name, r.type AS route_type, r.code AS route_code, r.color
    FROM route_graph_edges e
    JOIN routes r ON r.id = e.route_id
    WHERE r.is_active = 1
  `).all();

  const landmarks = db.prepare(`SELECT id, name, latitude, longitude FROM landmarks`).all();

  // adjacency list: { landmarkId -> [ { to, routeId, routeName, routeType, routeCode, color, distKm, timeMin, fare } ] }
  const graph = {};
  for (const lm of landmarks) graph[lm.id] = [];

  for (const e of edges) {
    graph[e.from_landmark] = graph[e.from_landmark] || [];
    graph[e.from_landmark].push({
      to:          e.to_landmark,
      routeId:     e.route_id,
      routeName:   e.route_name,
      routeType:   e.route_type,
      routeCode:   e.route_code,
      color:       e.color,
      distKm:      e.distance_km,
      timeMin:     e.travel_time_min,
      fare:        e.fare,
    });
  }

  const landmarkMap = {};
  for (const lm of landmarks) landmarkMap[lm.id] = lm;

  return { graph, landmarkMap };
}

// ─── Dijkstra ─────────────────────────────────────────────────────────────────
/**
 * @param {number} originId
 * @param {number} destId
 * @param {'fare'|'distance'|'time'|'transfers'} optimizeFor
 * @returns {{ segments, totalFare, totalDistKm, totalTimeMin, transfers } | null}
 */
function dijkstra(originId, destId, optimizeFor = 'fare') {
  const { graph, landmarkMap } = buildGraph();

  if (!graph[originId] || !graph[destId]) return null;
  if (originId === destId) return { segments: [], totalFare: 0, totalDistKm: 0, totalTimeMin: 0, transfers: 0 };

  const TRANSFER_PENALTY = optimizeFor === 'transfers' ? 1000 : 5; // cost units

  // dist[node] = best cost so far
  const dist = {};
  const prev = {}; // prev[node] = { from, edge }
  for (const id of Object.keys(graph)) {
    dist[id] = Infinity;
    prev[id] = null;
  }
  dist[originId] = 0;

  const pq = new MinHeap();
  pq.push({ cost: 0, node: originId, currentRoute: null });

  while (pq.size > 0) {
    const { cost, node, currentRoute } = pq.pop();

    if (cost > dist[node]) continue; // stale entry
    if (node === destId) break;

    for (const edge of (graph[node] || [])) {
      let edgeCost;
      switch (optimizeFor) {
        case 'distance':  edgeCost = edge.distKm;  break;
        case 'time':      edgeCost = edge.timeMin; break;
        case 'transfers': edgeCost = 1;            break;
        default:          edgeCost = edge.fare;    break; // 'fare'
      }

      // Add transfer penalty when switching routes
      const isTransfer = currentRoute !== null && currentRoute !== edge.routeId;
      if (isTransfer) edgeCost += TRANSFER_PENALTY;

      const newCost = cost + edgeCost;
      if (newCost < dist[edge.to]) {
        dist[edge.to] = newCost;
        prev[edge.to] = { from: node, edge, isTransfer };
        pq.push({ cost: newCost, node: edge.to, currentRoute: edge.routeId });
      }
    }
  }

  if (dist[destId] === Infinity) return null; // no path found

  // ─── Reconstruct path ───────────────────────────────────────────────────────
  const rawPath = [];
  let cur = destId;
  while (prev[cur]) {
    rawPath.unshift(prev[cur]);
    cur = prev[cur].from;
  }

  // ─── Merge consecutive stops on the same route into segments ────────────────
  const segments = [];
  let currentSegment = null;

  for (const step of rawPath) {
    const fromLm = landmarkMap[step.from];
    const toLm   = landmarkMap[step.edge.to];

    if (!currentSegment || currentSegment.routeId !== step.edge.routeId) {
      if (currentSegment) segments.push(currentSegment);
      currentSegment = {
        routeId:   step.edge.routeId,
        routeName: step.edge.routeName,
        routeType: step.edge.routeType,
        routeCode: step.edge.routeCode,
        color:     step.edge.color,
        from:      fromLm,
        to:        toLm,
        stops:     [fromLm, toLm],
        distKm:    step.edge.distKm,
        timeMin:   step.edge.timeMin,
        fare:      step.edge.fare,
      };
    } else {
      currentSegment.to = toLm;
      currentSegment.stops.push(toLm);
      currentSegment.distKm += step.edge.distKm;
      currentSegment.timeMin += step.edge.timeMin;
      currentSegment.fare = Math.max(currentSegment.fare, step.edge.fare); // fare is per-ride, not per-stop
    }
  }
  if (currentSegment) segments.push(currentSegment);

  // ─── Totals ─────────────────────────────────────────────────────────────────
  const totalFare    = segments.reduce((s, seg) => s + seg.fare, 0);
  const totalDistKm  = segments.reduce((s, seg) => s + seg.distKm, 0);
  const totalTimeMin = segments.reduce((s, seg) => s + seg.timeMin, 0);
  const transfers    = Math.max(0, segments.length - 1);

  return {
    segments,
    totalFare:    Math.round(totalFare * 100) / 100,
    totalDistKm:  Math.round(totalDistKm * 100) / 100,
    totalTimeMin: Math.round(totalTimeMin),
    transfers,
  };
}

// ─── Multi-criteria: return top-3 routes ─────────────────────────────────────
/**
 * Runs Dijkstra with multiple optimization criteria and returns
 * deduplicated, ranked results.
 */
function computeBestPaths(originId, destId) {
  const criteria = ['fare', 'distance', 'time', 'transfers'];
  const results = [];
  const seen = new Set();

  for (const criterion of criteria) {
    const result = dijkstra(originId, destId, criterion);
    if (!result) continue;

    // Deduplicate by segment route sequence
    const key = result.segments.map(s => s.routeId).join('-');
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({ ...result, optimizedFor: criterion });
  }

  // Sort: fewest transfers first, then lowest fare
  results.sort((a, b) => a.transfers - b.transfers || a.totalFare - b.totalFare);

  return results.slice(0, 3);
}

module.exports = { dijkstra, computeBestPaths, haversineKm };
