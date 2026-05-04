/**
 * API client
 * - Dev mode  : Vite proxies /api → http://localhost:3001
 * - Production: served from same origin, /api resolves directly
 */
import axios from 'axios';

const client = axios.create({
  baseURL: '/api',   // always relative — works in both dev and prod
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Route Finder ─────────────────────────────────────────────────────────────
export async function findRoute(origin, destination, passengerType = 'regular') {
  const { data } = await client.post('/find-route', { origin, destination, passengerType });
  return data;
}

// ─── Routes ───────────────────────────────────────────────────────────────────
export async function getRoutes() {
  const { data } = await client.get('/routes');
  return data;
}

export async function getRouteDetails(id) {
  const { data } = await client.get(`/routes/${id}`);
  return data;
}

// ─── Landmarks ────────────────────────────────────────────────────────────────
export async function searchLandmarks(q) {
  const { data } = await client.get('/landmarks', { params: { q, limit: 6 } });
  return data;
}

// ─── Announcements ────────────────────────────────────────────────────────────
export async function getAnnouncements() {
  const { data } = await client.get('/announcements');
  return data;
}

// ─── Feedback ─────────────────────────────────────────────────────────────────
export async function submitFeedback(payload) {
  const { data } = await client.post('/feedback', payload);
  return data;
}
