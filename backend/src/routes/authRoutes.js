/**
 * Auth Routes
 * POST /api/auth/signup
 * POST /api/auth/login
 * GET  /api/auth/me
 * POST /api/auth/logout
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { signUp, login, getProfile } = require('../services/authService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post(
  '/signup',
  [
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be 2–100 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/[A-Za-z]/)
      .withMessage('Password must contain at least one letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number'),
  ],
  validate,
  async (req, res) => {
    const { fullName, email, password } = req.body;
    const result = await signUp({ fullName, email, password });

    if (result.error) {
      return res.status(409).json({ error: result.error });
    }

    res.status(201).json({
      message: 'Account created successfully!',
      user:    result.user,
      token:   result.token,
    });
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res) => {
    const { email, password } = req.body;
    const result = await login({ email, password });

    if (result.error) {
      return res.status(401).json({ error: result.error });
    }

    res.json({
      message: 'Login successful!',
      user:    result.user,
      token:   result.token,
    });
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  const profile = getProfile(req.user.id);
  if (!profile) return res.status(404).json({ error: 'User not found' });
  res.json(profile);
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// JWT is stateless — logout is handled client-side by deleting the token
router.post('/logout', requireAuth, (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
