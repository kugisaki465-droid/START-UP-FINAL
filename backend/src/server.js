/**
 * SakaySmart Butuan — Express API Server
 * Serves both the REST API and the built React frontend from one process.
 * Authentication required for all /api routes except /api/auth/*
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');
const fs      = require('fs');

const routeRoutes        = require('./routes/routeRoutes');
const feedbackRoutes     = require('./routes/feedbackRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const { requireAuth }    = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 3001;

// Path to the built React app
const FRONTEND_DIST = path.join(__dirname, '../../frontend/dist');
const hasFrontend   = fs.existsSync(path.join(FRONTEND_DIST, 'index.html'));

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health check (public) ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:   'ok',
    service:  'SakaySmart Butuan API',
    version:  '2.0.0',
    frontend: hasFrontend ? 'served' : 'not built',
    auth:     'JWT enabled',
  });
});

// ─── Auth Routes (public — no token needed) ───────────────────────────────────
// Firebase handles auth client-side — no server auth routes needed

// ─── Protected API Routes (token required) ────────────────────────────────────
app.use('/api', requireAuth, routeRoutes);
app.use('/api', requireAuth, feedbackRoutes);
app.use('/api', requireAuth, announcementRoutes);

// ─── Serve React frontend ─────────────────────────────────────────────────────
if (hasFrontend) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).send(`
      <html><body style="font-family:sans-serif;padding:2rem">
        <h2>🚌 SakaySmart Butuan API v2</h2>
        <p>Backend running with JWT authentication.</p>
        <p><a href="/health">Health</a> | POST /api/auth/signup | POST /api/auth/login</p>
      </body></html>
    `);
  });
  app.use((req, res) => res.status(404).json({ error: 'Not found' }));
}

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚌 SakaySmart Butuan v2 running on http://localhost:${PORT}`);
    console.log(`   Health : http://localhost:${PORT}/health`);
    console.log(`   Auth   : POST http://localhost:${PORT}/api/auth/signup`);
    console.log(`   Auth   : POST http://localhost:${PORT}/api/auth/login`);
    if (hasFrontend) {
      console.log(`   App    : http://localhost:${PORT}  ← open in browser\n`);
    }
  });
}

module.exports = app;
