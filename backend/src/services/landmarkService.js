/**
 * Landmark Resolution Service
 * Uses Fuse.js fuzzy matching to resolve user text to known landmarks.
 */

const Fuse = require('fuse.js');
const { getDb } = require('../database/db');

let _fuse = null;
let _landmarks = null;

function getLandmarks() {
  if (_landmarks) return _landmarks;
  const db = getDb();
  _landmarks = db.prepare('SELECT * FROM landmarks').all();
  return _landmarks;
}

function getFuse() {
  if (_fuse) return _fuse;
  const landmarks = getLandmarks();

  // Build a flat search list that includes aliases
  const searchList = [];
  for (const lm of landmarks) {
    searchList.push({ id: lm.id, text: lm.name, landmark: lm });
    if (lm.alias) {
      for (const alias of lm.alias.split(',')) {
        searchList.push({ id: lm.id, text: alias.trim(), landmark: lm });
      }
    }
  }

  _fuse = new Fuse(searchList, {
    keys: ['text'],
    threshold: 0.4,       // 0 = exact, 1 = match anything
    includeScore: true,
    minMatchCharLength: 2,
  });

  return _fuse;
}

/**
 * Invalidate cache when landmarks are updated
 */
function invalidateCache() {
  _fuse = null;
  _landmarks = null;
}

/**
 * resolveLandmark(input) → best matching landmark or null
 */
function resolveLandmark(input) {
  if (!input || typeof input !== 'string') return null;

  const fuse = getFuse();
  const results = fuse.search(input.trim());

  if (results.length === 0) return null;

  // Return the landmark with the best (lowest) score
  const best = results[0];
  return best.item.landmark;
}

/**
 * searchLandmarks(query, limit) → array of matching landmarks
 */
function searchLandmarks(query, limit = 5) {
  if (!query) return getLandmarks().slice(0, limit);

  const fuse = getFuse();
  const results = fuse.search(query.trim(), { limit: limit * 2 });

  // Deduplicate by landmark id
  const seen = new Set();
  const unique = [];
  for (const r of results) {
    if (!seen.has(r.item.id)) {
      seen.add(r.item.id);
      unique.push({ ...r.item.landmark, score: r.score });
    }
    if (unique.length >= limit) break;
  }
  return unique;
}

/**
 * getLandmarkById(id) → landmark or null
 */
function getLandmarkById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM landmarks WHERE id = ?').get(id) ?? null;
}

/**
 * getAllLandmarks() → all landmarks
 */
function getAllLandmarks() {
  return getLandmarks();
}

module.exports = { resolveLandmark, searchLandmarks, getLandmarkById, getAllLandmarks, invalidateCache };
