const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { findRoute, getAllRoutes, getRouteDetails } = require('../services/routeService');
const { searchLandmarks, getAllLandmarks } = require('../services/landmarkService');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// POST /find-route
router.post(
  '/find-route',
  [
    body('origin').isString().trim().notEmpty().withMessage('origin is required'),
    body('destination').isString().trim().notEmpty().withMessage('destination is required'),
    body('passengerType').optional().isIn(['regular', 'student', 'senior', 'pwd']),
  ],
  validate,
  (req, res) => {
    const { origin, destination, passengerType = 'regular' } = req.body;
    const result = findRoute(origin, destination, passengerType);
    if (result.error) return res.status(404).json(result);
    res.json(result);
  }
);

// GET /routes
router.get('/routes', (req, res) => {
  res.json(getAllRoutes());
});

// GET /routes/:id
router.get(
  '/routes/:id',
  [param('id').isInt({ min: 1 })],
  validate,
  (req, res) => {
    const route = getRouteDetails(Number(req.params.id));
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  }
);

// GET /landmarks?q=...
router.get('/landmarks', (req, res) => {
  const { q, limit } = req.query;
  const results = q
    ? searchLandmarks(q, Number(limit) || 8)
    : getAllLandmarks();
  res.json(results);
});

module.exports = router;
