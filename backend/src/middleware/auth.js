/**
 * Firebase Token Verification Middleware
 * Verifies Firebase ID tokens sent from the frontend
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin once
if (!getApps().length) {
  // In production: use GOOGLE_APPLICATION_CREDENTIALS env var or service account JSON
  // In development: use FIREBASE_PROJECT_ID env var for basic verification
  const projectId = process.env.FIREBASE_PROJECT_ID || 'start-up-fb533';

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Production: full service account
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({ credential: cert(serviceAccount) });
    } else {
      // Development: project-only init (works for token verification via REST)
      initializeApp({ projectId });
    }
  } catch (e) {
    console.warn('Firebase Admin init warning:', e.message);
    initializeApp({ projectId });
  }
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Please log in.',
    });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    req.user = {
      uid:   decoded.uid,
      email: decoded.email,
      name:  decoded.name || decoded.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Session expired or invalid. Please log in again.',
    });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  const idToken = authHeader.split(' ')[1];
  getAuth().verifyIdToken(idToken)
    .then(decoded => {
      req.user = { uid: decoded.uid, email: decoded.email };
      next();
    })
    .catch(() => next());
}

module.exports = { requireAuth, optionalAuth };
