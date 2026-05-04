/**
 * Feedback Service
 */

const { getDb } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

function submitFeedback({ userId, routeId, message, rating }) {
  const db = getDb();
  const id = uuidv4();

  const result = db.prepare(`
    INSERT INTO feedback (user_id, route_id, message, rating)
    VALUES (?, ?, ?, ?)
  `).run(userId || id, routeId || null, message, rating || null);

  return { id: result.lastInsertRowid, message: 'Feedback submitted. Thank you!' };
}

function getFeedback({ status, routeId, limit = 50 } = {}) {
  const db = getDb();
  let query = `
    SELECT f.*, r.name AS route_name, r.code AS route_code
    FROM feedback f
    LEFT JOIN routes r ON r.id = f.route_id
    WHERE 1=1
  `;
  const params = [];

  if (status) { query += ' AND f.status = ?'; params.push(status); }
  if (routeId) { query += ' AND f.route_id = ?'; params.push(routeId); }

  query += ' ORDER BY f.created_at DESC LIMIT ?';
  params.push(limit);

  return db.prepare(query).all(...params);
}

function updateFeedbackStatus(id, status) {
  const db = getDb();
  const valid = ['pending', 'reviewed', 'resolved'];
  if (!valid.includes(status)) throw new Error('Invalid status');
  db.prepare('UPDATE feedback SET status = ? WHERE id = ?').run(status, id);
  return { success: true };
}

module.exports = { submitFeedback, getFeedback, updateFeedbackStatus };
