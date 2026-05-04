/**
 * Authenticated API client
 * Gets a fresh Firebase ID token on every request
 */
import axios from 'axios';
import { auth } from '../firebase.js';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
client.interceptors.request.use(async config => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect to login
client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export async function findRoute(origin, destination, passengerType = 'regular') {
  const { data } = await client.post('/find-route', { origin, destination, passengerType });
  return data;
}

export async function getRoutes() {
  const { data } = await client.get('/routes');
  return data;
}

export async function getRouteDetails(id) {
  const { data } = await client.get(`/routes/${id}`);
  return data;
}

export async function searchLandmarks(q) {
  const { data } = await client.get('/landmarks', { params: { q, limit: 6 } });
  return data;
}

export async function getAnnouncements() {
  const { data } = await client.get('/announcements');
  return data;
}

export async function submitFeedback(payload) {
  const { data } = await client.post('/feedback', payload);
  return data;
}
