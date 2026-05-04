# 🚌 SakaySmart Butuan

**Smart commuting platform for Butuan City, Philippines.**

Helps commuters find the best jeepney and tricycle routes, get step-by-step instructions, and estimate fares — even in low-connectivity environments.

---

## Project Structure

```
sakaysmart-butuan/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── algorithms/
│   │   │   └── dijkstra.js   # Graph-based pathfinding (Dijkstra)
│   │   ├── database/
│   │   │   ├── db.js         # SQLite connection (node:sqlite built-in)
│   │   │   ├── schema.sql    # Database schema
│   │   │   └── seed.js       # Butuan City route data
│   │   ├── routes/           # Express route handlers
│   │   ├── services/         # Business logic
│   │   │   ├── routeService.js
│   │   │   ├── landmarkService.js
│   │   │   ├── feedbackService.js
│   │   │   └── announcementService.js
│   │   └── server.js
│   ├── data/                 # SQLite database file (auto-created)
│   └── package.json
│
└── frontend/                 # React + Vite + Tailwind CSS
    ├── src/
    │   ├── api/client.js     # Axios API client
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── RouteFinder.jsx        # Origin/destination form
    │   │   ├── RouteResults.jsx       # Route options + instructions
    │   │   ├── RouteMap.jsx           # Leaflet map
    │   │   ├── RouteDirectory.jsx     # All routes browser
    │   │   ├── LandmarkAutocomplete.jsx
    │   │   ├── AnnouncementBanner.jsx
    │   │   ├── FeedbackModal.jsx
    │   │   └── OfflineBanner.jsx
    │   └── App.jsx
    └── package.json
```

---

## Quick Start

### Requirements
- **Node.js 22+** (uses built-in `node:sqlite`)
- npm 9+

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
node src/database/seed.js   # populate database
npm start                   # starts on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Health check |
| `POST` | `/api/find-route` | Find best routes |
| `GET`  | `/api/routes` | List all routes |
| `GET`  | `/api/routes/:id` | Route details + stops |
| `GET`  | `/api/landmarks?q=` | Search landmarks |
| `GET`  | `/api/announcements` | Active announcements |
| `POST` | `/api/feedback` | Submit feedback |
| `GET`  | `/api/feedback` | List feedback |

### POST /api/find-route

**Request:**
```json
{
  "origin": "Gaisano",
  "destination": "City Hall",
  "passengerType": "student"
}
```

`passengerType`: `regular` | `student` | `senior` | `pwd`

**Response:**
```json
{
  "origin": { "id": 2, "name": "Gaisano Mall Butuan", ... },
  "destination": { "id": 3, "name": "Butuan City Hall", ... },
  "routes": [
    {
      "rank": 1,
      "optimizedFor": "fare",
      "segments": [...],
      "totalFare": 20.80,
      "totalDistKm": 1.1,
      "totalTimeMin": 2,
      "transfers": 1,
      "instructions": [
        "🚶 Walk to Gaisano Mall Butuan to board your first ride.",
        "1. 🚌 Board jeepney [J05] ...",
        "🏁 Arrive at Butuan City Hall — your destination."
      ],
      "summary": "[J05] ... → [J02] ... | ₱20.80 | ~2 min | 1 transfer(s)"
    }
  ]
}
```

---

## Route Algorithm

The system uses **Dijkstra's Algorithm** on a weighted directed graph:

- **Nodes** = landmarks (stops, terminals, markets)
- **Edges** = route connections between consecutive stops
- **Edge weights** = fare / distance / travel time (selectable)
- **Transfer penalty** = added cost when switching routes

The algorithm runs 4 times with different optimization criteria:
1. Cheapest fare
2. Shortest distance
3. Fastest time
4. Fewest transfers

Results are deduplicated and the top 3 unique paths are returned.

### Fare Calculation
```
fare = base_fare + max(0, distance_km - 4) × per_km_rate
```
- Jeepney base fare: ₱13.00 (LTFRB minimum)
- Tricycle base fare: ₱10.00
- Discounts: 20% for students, seniors, and PWDs

---

## Butuan City Routes (Seed Data)

| Code | Type | Route |
|------|------|-------|
| J01 | Jeepney | Robinsons – Agora – City Hall |
| J02 | Jeepney | BCIT – Langihan – Agora |
| J03 | Jeepney | Ampayon – Maharlika – Agora |
| J04 | Jeepney | Baan – Doongan – City Hall |
| J05 | Jeepney | Masao – Tiniwisan – Agora |
| J06 | Jeepney | Bancasi – Airport – Agora |
| J07 | Jeepney | Robinsons – Ampayon – BCIT |
| T01 | Tricycle | Agora – Gaisano Area |
| T02 | Tricycle | City Hall – BMC – CRH |
| T03 | Tricycle | Baan – Tungao |

---

## Database Schema

```sql
landmarks      -- stops, terminals, landmarks with GPS coordinates
routes         -- jeepney/tricycle routes with color coding
route_stops    -- ordered stops per route
fares          -- base fare + per-km rate per route
announcements  -- traffic alerts, service disruptions
feedback       -- user-submitted corrections
route_graph_edges -- pre-computed graph for fast pathfinding
```

---

## Deployment

### Option A: Single Server (Recommended for MVP)

```bash
# Build frontend
cd frontend && npm run build

# Serve static files from backend
# Add to backend/src/server.js:
# app.use(express.static(path.join(__dirname, '../../frontend/dist')));
```

### Option B: Separate Deployment

- **Backend**: Deploy to Railway, Render, or any Node.js host
- **Frontend**: Deploy to Vercel, Netlify, or Cloudflare Pages
- Set `VITE_API_URL=https://your-backend.com/api` in frontend `.env`

### Option C: Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ .
RUN node src/database/seed.js
EXPOSE 3001
CMD ["node", "src/server.js"]
```

---

## Low-Connectivity Features

- SQLite database — no external DB server required
- All route data stored locally — works offline after first load
- Offline banner shown when network is unavailable
- Minimal bundle size — Leaflet map loaded lazily

---

## Future Enhancements (Structure Ready)

- `liveTracking(vehicle_id)` — real-time vehicle positions via WebSocket
- `pushNotifications(user_id)` — service disruption alerts
- `trafficIntegration()` — dynamic travel time from traffic APIs
- Admin panel for route management
- PWA support for installable mobile app
