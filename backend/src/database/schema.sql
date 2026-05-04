-- ============================================================
-- SakaySmart Butuan - Database Schema
-- ============================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ------------------------------------------------------------
-- LANDMARKS
-- Represents known stops, terminals, and points of interest
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS landmarks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  alias       TEXT,                        -- alternate names, comma-separated
  latitude    REAL    NOT NULL,
  longitude   REAL    NOT NULL,
  type        TEXT    DEFAULT 'stop',      -- stop | terminal | landmark | market
  barangay    TEXT,
  created_at  TEXT    DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_landmarks_name ON landmarks(name);

-- ------------------------------------------------------------
-- ROUTES
-- Jeepney and tricycle routes operating in Butuan City
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  code        TEXT    UNIQUE,              -- e.g. "J01", "T05"
  type        TEXT    NOT NULL CHECK(type IN ('jeepney','tricycle','bus')),
  description TEXT,
  color       TEXT    DEFAULT '#F59E0B',   -- display color for map
  is_active   INTEGER DEFAULT 1,
  created_at  TEXT    DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- ROUTE_STOPS
-- Ordered stops along each route (bidirectional)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS route_stops (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id    INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  landmark_id INTEGER NOT NULL REFERENCES landmarks(id) ON DELETE CASCADE,
  stop_order  INTEGER NOT NULL,
  UNIQUE(route_id, stop_order)
);

CREATE INDEX IF NOT EXISTS idx_route_stops_route ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_landmark ON route_stops(landmark_id);

-- ------------------------------------------------------------
-- FARES
-- Base fare per route; distance-based surcharge optional
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fares (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id        INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  base_fare       REAL    NOT NULL DEFAULT 13.00,  -- PHP, LTFRB minimum
  per_km_rate     REAL    DEFAULT 1.80,
  student_disc    REAL    DEFAULT 0.20,            -- 20% discount
  senior_disc     REAL    DEFAULT 0.20,
  pwd_disc        REAL    DEFAULT 0.20,
  UNIQUE(route_id)
);

-- ------------------------------------------------------------
-- ANNOUNCEMENTS
-- Traffic alerts, road closures, service disruptions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  body        TEXT    NOT NULL,
  type        TEXT    DEFAULT 'info' CHECK(type IN ('info','warning','alert')),
  route_id    INTEGER REFERENCES routes(id) ON DELETE SET NULL,
  is_active   INTEGER DEFAULT 1,
  expires_at  TEXT,
  created_at  TEXT    DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- FEEDBACK
-- User-submitted route corrections and comments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT,
  route_id    INTEGER REFERENCES routes(id) ON DELETE SET NULL,
  message     TEXT    NOT NULL,
  rating      INTEGER CHECK(rating BETWEEN 1 AND 5),
  status      TEXT    DEFAULT 'pending' CHECK(status IN ('pending','reviewed','resolved')),
  created_at  TEXT    DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- ROUTE_GRAPH_EDGES (pre-computed for fast pathfinding)
-- Each row = direct connection between two landmarks via a route
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS route_graph_edges (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  from_landmark   INTEGER NOT NULL REFERENCES landmarks(id),
  to_landmark     INTEGER NOT NULL REFERENCES landmarks(id),
  route_id        INTEGER NOT NULL REFERENCES routes(id),
  distance_km     REAL    DEFAULT 0,
  travel_time_min REAL    DEFAULT 5,
  fare            REAL    DEFAULT 13.00
);

CREATE INDEX IF NOT EXISTS idx_edges_from ON route_graph_edges(from_landmark);
CREATE INDEX IF NOT EXISTS idx_edges_to   ON route_graph_edges(to_landmark);

-- ------------------------------------------------------------
-- USERS
-- Registered accounts with hashed passwords
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name    TEXT    NOT NULL,
  email        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password     TEXT    NOT NULL,           -- bcrypt hash
  role         TEXT    DEFAULT 'user' CHECK(role IN ('user','admin')),
  is_active    INTEGER DEFAULT 1,
  created_at   TEXT    DEFAULT (datetime('now')),
  last_login   TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
