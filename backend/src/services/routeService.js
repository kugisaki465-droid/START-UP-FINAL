/**
 * Route Service
 * Handles route directory, fare estimation, and step-by-step instructions.
 */

const { getDb } = require('../database/db');
const { computeBestPaths } = require('../algorithms/dijkstra');
const { resolveLandmark } = require('./landmarkService');

// ─── Route Directory ──────────────────────────────────────────────────────────

function getAllRoutes() {
  const db = getDb();
  return db.prepare(`
    SELECT r.*, f.base_fare, f.per_km_rate
    FROM routes r
    LEFT JOIN fares f ON f.route_id = r.id
    WHERE r.is_active = 1
    ORDER BY r.type, r.code
  `).all();
}

function getRouteDetails(routeId) {
  const db = getDb();

  const route = db.prepare(`
    SELECT r.*, f.base_fare, f.per_km_rate, f.student_disc, f.senior_disc, f.pwd_disc
    FROM routes r
    LEFT JOIN fares f ON f.route_id = r.id
    WHERE r.id = ?
  `).get(routeId);

  if (!route) return null;
  const stops = db.prepare(`
    SELECT rs.stop_order, l.id, l.name, l.latitude, l.longitude, l.type, l.barangay
    FROM route_stops rs
    JOIN landmarks l ON l.id = rs.landmark_id
    WHERE rs.route_id = ?
    ORDER BY rs.stop_order
  `).all(routeId);

  return { ...route, stops };
}

// ─── Fare Estimation ──────────────────────────────────────────────────────────

/**
 * estimateFare(segments, passengerType)
 * passengerType: 'regular' | 'student' | 'senior' | 'pwd'
 */
function estimateFare(segments, passengerType = 'regular') {
  const db = getDb();
  let total = 0;

  for (const seg of segments) {
    const fareRow = db.prepare('SELECT * FROM fares WHERE route_id = ?').get(seg.routeId);
    if (!fareRow) {
      total += seg.fare || 13;
      continue;
    }

    let rideFare = seg.fare; // already computed in dijkstra (base + distance)

    // Apply discount
    let discount = 0;
    if (passengerType === 'student') discount = fareRow.student_disc || 0.20;
    else if (passengerType === 'senior') discount = fareRow.senior_disc || 0.20;
    else if (passengerType === 'pwd')    discount = fareRow.pwd_disc    || 0.20;

    rideFare = rideFare * (1 - discount);
    total += rideFare;
  }

  return Math.round(total * 100) / 100;
}

// ─── Step-by-Step Instructions ────────────────────────────────────────────────

/**
 * generateInstructions(route)
 * Returns an array of human-readable instruction strings.
 */
function generateInstructions(route) {
  const { segments } = route;
  if (!segments || segments.length === 0) return ['You are already at your destination.'];

  const steps = [];
  let stepNum = 1;

  steps.push(`🚶 Walk to ${segments[0].from.name} to board your first ride.`);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const vehicleEmoji = seg.routeType === 'jeepney' ? '🚌' : '🛺';
    const fareStr = `₱${seg.fare.toFixed(2)}`;
    const timeStr = `~${Math.round(seg.timeMin)} min`;

    steps.push(
      `${stepNum++}. ${vehicleEmoji} Board ${seg.routeType} [${seg.routeCode}] "${seg.routeName}" ` +
      `at ${seg.from.name}.`
    );

    if (seg.stops.length > 2) {
      const intermediate = seg.stops.slice(1, -1).map(s => s.name).join(' → ');
      steps.push(`   Passing through: ${intermediate}`);
    }

    steps.push(
      `   Ride to ${seg.to.name}. (${timeStr}, ${fareStr})`
    );

    if (i < segments.length - 1) {
      steps.push(`   🔄 Transfer at ${seg.to.name} to the next vehicle.`);
    }
  }

  const lastSeg = segments[segments.length - 1];
  steps.push(`🏁 Arrive at ${lastSeg.to.name} — your destination.`);

  return steps;
}

// ─── Main findRoute ───────────────────────────────────────────────────────────

/**
 * findRoute(originInput, destinationInput, passengerType)
 *
 * Accepts landmark names/aliases, resolves them, runs Dijkstra,
 * and returns enriched route options.
 */
function findRoute(originInput, destinationInput, passengerType = 'regular') {
  // 1. Resolve landmarks
  const originLm = resolveLandmark(originInput);
  const destLm   = resolveLandmark(destinationInput);

  if (!originLm) {
    return { error: `Could not find landmark matching "${originInput}". Try a different name.` };
  }
  if (!destLm) {
    return { error: `Could not find landmark matching "${destinationInput}". Try a different name.` };
  }
  if (originLm.id === destLm.id) {
    return { error: 'Origin and destination are the same location.' };
  }

  // 2. Compute best paths
  const paths = computeBestPaths(originLm.id, destLm.id);

  if (!paths || paths.length === 0) {
    return {
      error: 'No route found between these locations. Try nearby landmarks.',
      origin: originLm,
      destination: destLm,
    };
  }

  // 3. Enrich each path
  const enriched = paths.map((path, idx) => {
    const adjustedFare = estimateFare(path.segments, passengerType);
    const instructions = generateInstructions(path);

    return {
      rank:          idx + 1,
      optimizedFor:  path.optimizedFor,
      origin:        originLm,
      destination:   destLm,
      segments:      path.segments,
      totalFare:     adjustedFare,
      totalDistKm:   path.totalDistKm,
      totalTimeMin:  path.totalTimeMin,
      transfers:     path.transfers,
      instructions,
      summary: buildSummary(path, adjustedFare),
    };
  });

  return {
    origin:      originLm,
    destination: destLm,
    routes:      enriched,
  };
}

function buildSummary(path, fare) {
  const routeNames = path.segments.map(s => `[${s.routeCode}] ${s.routeName}`).join(' → ');
  return `${routeNames} | ₱${fare.toFixed(2)} | ~${path.totalTimeMin} min | ${path.transfers} transfer(s)`;
}

module.exports = { findRoute, getAllRoutes, getRouteDetails, estimateFare, generateInstructions };
