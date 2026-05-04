/**
 * Announcement Service
 */

const { getDb } = require('../database/db');

function getAnnouncements({ activeOnly = true } = {}) {
  const db = getDb();
  let query = `
    SELECT a.*, r.name AS route_name, r.code AS route_code
    FROM announcements a
    LEFT JOIN routes r ON r.id = a.route_id
    WHERE 1=1
  `;
  const params = [];

  if (activeOnly) {
    query += ` AND a.is_active = 1
               AND (a.expires_at IS NULL OR a.expires_at > datetime('now'))`;
  }

  query += ' ORDER BY a.created_at DESC';
  return db.prepare(query).all(...params);
}

function createAnnouncement({ title, body, type = 'info', routeId, expiresAt }) {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO announcements (title, body, type, route_id, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(title, body, type, routeId || null, expiresAt || null);
  return { id: result.lastInsertRowid };
}

function deactivateAnnouncement(id) {
  const db = getDb();
  db.prepare('UPDATE announcements SET is_active = 0 WHERE id = ?').run(id);
  return { success: true };
}

module.exports = { getAnnouncements, createAnnouncement, deactivateAnnouncement };
