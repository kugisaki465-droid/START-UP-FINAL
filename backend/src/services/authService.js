/**
 * Authentication Service
 * Handles signup, login, and token management
 */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { getDb } = require('../database/db');

const JWT_SECRET     = process.env.JWT_SECRET || 'sakaysmart-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS    = 12;

// ─── Sign Up ──────────────────────────────────────────────────────────────────
async function signUp({ fullName, email, password }) {
  const db = getDb();

  // Check duplicate email
  const existing = db.prepare(
    'SELECT id FROM users WHERE email = ? COLLATE NOCASE'
  ).get(email.trim());

  if (existing) {
    return { error: 'An account with this email already exists.' };
  }

  // Hash password
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user
  const result = db.prepare(`
    INSERT INTO users (full_name, email, password)
    VALUES (?, ?, ?)
  `).run(fullName.trim(), email.trim().toLowerCase(), hashed);

  const user = db.prepare(
    'SELECT id, full_name, email, role, created_at FROM users WHERE id = ?'
  ).get(result.lastInsertRowid);

  const token = generateToken(user);
  return { user, token };
}

// ─── Login ────────────────────────────────────────────────────────────────────
async function login({ email, password }) {
  const db = getDb();

  const user = db.prepare(
    'SELECT * FROM users WHERE email = ? COLLATE NOCASE AND is_active = 1'
  ).get(email.trim().toLowerCase());

  if (!user) {
    return { error: 'Invalid email or password.' };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { error: 'Invalid email or password.' };
  }

  // Update last login
  db.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').run(user.id);

  const safeUser = {
    id:         user.id,
    full_name:  user.full_name,
    email:      user.email,
    role:       user.role,
    created_at: user.created_at,
  };

  const token = generateToken(safeUser);
  return { user: safeUser, token };
}

// ─── Get profile ──────────────────────────────────────────────────────────────
function getProfile(userId) {
  const db = getDb();
  return db.prepare(
    'SELECT id, full_name, email, role, created_at, last_login FROM users WHERE id = ?'
  ).get(userId) ?? null;
}

// ─── Token helpers ────────────────────────────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { signUp, login, getProfile, verifyToken };
