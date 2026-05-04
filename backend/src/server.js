/**
 * SakaySmart Butuan — Express API Server
 * Serves both the REST API and the built React frontend from one process.
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

const app  = express();
const PORT = process.env.PORT || 3001;

// Path to the built React app
const FRONTEND_DIST = path.join(__dirname, '../../frontend/dist');
const hasFrontend   = fs.existsSync(path.join(FRONTEND_DIST, 'index.html'));

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // allow Leaflet CDN tiles
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:   'ok',
    service:  'SakaySmart Butuan API',
    version:  '1.0.0',
    frontend: hasFrontend ? 'served' : 'not built',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', routeRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', announcementRoutes);

// ─── Serve React frontend (production build) ──────────────────────────────────
if (hasFrontend) {
  // Serve static assets (JS, CSS, images)
  app.use(express.static(FRONTEND_DIST));

  // SPA fallback — all non-API routes return index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });

  console.log(`\n✅ Frontend build found — will be served from http://localhost:${PORT}`);
} else {
  // No build yet — helpful 404 for browser
  app.get('/', (req, res) => {
    res.status(200).send(`
      <html><body style="font-family:sans-serif;padding:2rem">
        <h2>🚌 SakaySmart Butuan API</h2>
        <p>Backend is running. Frontend build not found.</p>
        <p>Run <code>npm run build</code> inside the <code>frontend/</code> folder, then restart.</p>
        <p><a href="/health">Health check</a> | <a href="/api/routes">Routes API</a></p>
      </body></html>
    `);
  });

  // 404 for everything else
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });
}

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚌 SakaySmart Butuan running on http://localhost:${PORT}`);
    console.log(`   Health : http://localhost:${PORT}/health`);
    console.log(`   API    : http://localhost:${PORT}/api/routes`);
    if (hasFrontend) {
      console.log(`   App    : http://localhost:${PORT}  ← open this in your browser\n`);
    }
  });
}

module.exports = app;
