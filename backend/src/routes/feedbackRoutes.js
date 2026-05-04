const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { submitFeedback, getFeedback } = require('../services/feedbackService');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// POST /feedback
router.post(
  '/feedback',
  [
    body('message').isString().trim().isLength({ min: 5, max: 1000 }).withMessage('Message must be 5–1000 characters'),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('routeId').optional().isInt({ min: 1 }),
    body('userId').optional().isString().trim(),
  ],
  validate,
  (req, res) => {
    const result = submitFeedback(req.body);
    res.status(201).json(result);
  }
);

// GET /feedback
router.get('/feedback', (req, res) => {
  const { status, routeId, limit } = req.query;
  res.json(getFeedback({ status, routeId: routeId ? Number(routeId) : undefined, limit: Number(limit) || 50 }));
});

module.exports = router;
