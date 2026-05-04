const express = require('express');
const { getAnnouncements } = require('../services/announcementService');

const router = express.Router();

// GET /announcements
router.get('/announcements', (req, res) => {
  const { all } = req.query;
  res.json(getAnnouncements({ activeOnly: all !== 'true' }));
});

module.exports = router;
