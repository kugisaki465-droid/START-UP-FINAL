/**
 * Seed script — populates the database with real Butuan City
 * landmarks, jeepney routes, tricycle routes, fares, and graph edges.
 *
 * Run: node src/database/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getDb, closeDb } = require('./db');

// ─── LANDMARKS ────────────────────────────────────────────────────────────────
const LANDMARKS = [
  { id: 1,  name: 'Robinsons Place Butuan',          alias: 'Robinsons,Robinson',                   lat: 8.9490, lng: 125.5440, type: 'terminal',  barangay: 'Libertad' },
  { id: 2,  name: 'Gaisano Mall Butuan',              alias: 'Gaisano,Gaisano Capital',              lat: 8.9478, lng: 125.5398, type: 'terminal',  barangay: 'Libertad' },
  { id: 3,  name: 'Butuan City Hall',                 alias: 'City Hall,Munisipyo',                  lat: 8.9494, lng: 125.5302, type: 'landmark',  barangay: 'Libertad' },
  { id: 4,  name: 'Butuan City Integrated Terminal',  alias: 'BCIT,Bus Terminal,Integrated Terminal',lat: 8.9560, lng: 125.5270, type: 'terminal',  barangay: 'Langihan' },
  { id: 5,  name: 'Agora Market',                     alias: 'Agora,Public Market',                  lat: 8.9510, lng: 125.5350, type: 'market',    barangay: 'Agora' },
  { id: 6,  name: 'Butuan Cathedral',                 alias: 'Cathedral,San Nicolas',                lat: 8.9488, lng: 125.5310, type: 'landmark',  barangay: 'Libertad' },
  { id: 7,  name: 'Butuan Medical Center',            alias: 'BMC,Hospital',                         lat: 8.9455, lng: 125.5280, type: 'landmark',  barangay: 'Libertad' },
  { id: 8,  name: 'Caraga Regional Hospital',         alias: 'CRH,Regional Hospital',                lat: 8.9420, lng: 125.5260, type: 'landmark',  barangay: 'Libertad' },
  { id: 9,  name: 'Ampayon Junction',                 alias: 'Ampayon',                              lat: 8.9620, lng: 125.5450, type: 'stop',      barangay: 'Ampayon' },
  { id: 10, name: 'Langihan Road',                    alias: 'Langihan',                             lat: 8.9555, lng: 125.5300, type: 'stop',      barangay: 'Langihan' },
  { id: 11, name: 'Baan Junction',                    alias: 'Baan',                                 lat: 8.9380, lng: 125.5200, type: 'stop',      barangay: 'Baan' },
  { id: 12, name: 'Bancasi Airport',                  alias: 'Airport,Bancasi',                      lat: 8.9510, lng: 125.4790, type: 'landmark',  barangay: 'Bancasi' },
  { id: 13, name: 'Montilla Boulevard',               alias: 'Montilla,Boulevard',                   lat: 8.9500, lng: 125.5330, type: 'stop',      barangay: 'Libertad' },
  { id: 14, name: 'Villanueva Street',                alias: 'Villanueva',                           lat: 8.9470, lng: 125.5320, type: 'stop',      barangay: 'Libertad' },
  { id: 15, name: 'Guingona Park',                    alias: 'Guingona,Plaza',                       lat: 8.9485, lng: 125.5295, type: 'landmark',  barangay: 'Libertad' },
  { id: 16, name: 'Butuan National High School',      alias: 'BNHS,National High School',            lat: 8.9460, lng: 125.5340, type: 'landmark',  barangay: 'Libertad' },
  { id: 17, name: 'Agusan del Norte Capitol',         alias: 'Capitol',                              lat: 8.9530, lng: 125.5280, type: 'landmark',  barangay: 'Langihan' },
  { id: 18, name: 'Maharlika Highway',                alias: 'Maharlika',                            lat: 8.9600, lng: 125.5380, type: 'stop',      barangay: 'Ampayon' },
  { id: 19, name: 'Doongan',                          alias: 'Doongan Junction',                     lat: 8.9350, lng: 125.5150, type: 'stop',      barangay: 'Doongan' },
  { id: 20, name: 'Libertad Market',                  alias: 'Libertad',                             lat: 8.9475, lng: 125.5360, type: 'market',    barangay: 'Libertad' },
  { id: 21, name: 'Ong Yiu Street',                   alias: 'Ong Yiu',                              lat: 8.9465, lng: 125.5305, type: 'stop',      barangay: 'Libertad' },
  { id: 22, name: 'Butuan Doctors Hospital',          alias: 'Doctors Hospital',                     lat: 8.9440, lng: 125.5290, type: 'landmark',  barangay: 'Libertad' },
  { id: 23, name: 'Tiniwisan',                        alias: 'Tiniwisan Junction',                   lat: 8.9680, lng: 125.5500, type: 'stop',      barangay: 'Tiniwisan' },
  { id: 24, name: 'Masao',                            alias: 'Masao Port,Masao Wharf',               lat: 8.9750, lng: 125.5600, type: 'terminal',  barangay: 'Masao' },
  { id: 25, name: 'Buenavista Junction',              alias: 'Buenavista',                           lat: 8.9300, lng: 125.5100, type: 'stop',      barangay: 'Buenavista' },
  { id: 26, name: 'Imadejas',                         alias: 'Imadejas',                             lat: 8.9410, lng: 125.5230, type: 'stop',      barangay: 'Imadejas' },
  { id: 27, name: 'Antongalon',                       alias: 'Antongalon',                           lat: 8.9550, lng: 125.5420, type: 'stop',      barangay: 'Antongalon' },
  { id: 28, name: 'Silongan',                         alias: 'Silongan',                             lat: 8.9430, lng: 125.5270, type: 'stop',      barangay: 'Silongan' },
  { id: 29, name: 'Bancasi Junction',                 alias: 'Bancasi Junction',                     lat: 8.9480, lng: 125.4900, type: 'stop',      barangay: 'Bancasi' },
  { id: 30, name: 'Tungao',                           alias: 'Tungao',                               lat: 8.9200, lng: 125.5050, type: 'stop',      barangay: 'Tungao' },
];

const ROUTES = [
  { id: 1,  name: 'Robinsons – Agora – City Hall',   code: 'J01', type: 'jeepney',  color: '#EF4444', description: 'Main city loop via Agora Market' },
  { id: 2,  name: 'BCIT – Langihan – Agora',         code: 'J02', type: 'jeepney',  color: '#3B82F6', description: 'Terminal to downtown via Langihan' },
  { id: 3,  name: 'Ampayon – Maharlika – Agora',     code: 'J03', type: 'jeepney',  color: '#10B981', description: 'Ampayon corridor to city center' },
  { id: 4,  name: 'Baan – Doongan – City Hall',      code: 'J04', type: 'jeepney',  color: '#8B5CF6', description: 'Southern route via Baan and Doongan' },
  { id: 5,  name: 'Masao – Tiniwisan – Agora',       code: 'J05', type: 'jeepney',  color: '#F59E0B', description: 'Coastal route from Masao Port' },
  { id: 6,  name: 'Bancasi – Airport – Agora',       code: 'J06', type: 'jeepney',  color: '#EC4899', description: 'Airport route to city center' },
  { id: 7,  name: 'Tricycle: Agora – Gaisano Area',  code: 'T01', type: 'tricycle', color: '#06B6D4', description: 'Short-haul within downtown' },
  { id: 8,  name: 'Tricycle: City Hall – BMC – CRH', code: 'T02', type: 'tricycle', color: '#84CC16', description: 'Hospital corridor tricycle' },
  { id: 9,  name: 'Tricycle: Baan – Tungao',         code: 'T03', type: 'tricycle', color: '#F97316', description: 'Baan to Tungao short route' },
  { id: 10, name: 'Robinsons – Ampayon – BCIT',      code: 'J07', type: 'jeepney',  color: '#6366F1', description: 'Northern loop via Ampayon' },
];

const ROUTE_STOPS = {
  1:  [2, 20, 5, 13, 6, 3, 15, 21, 14, 16],
  2:  [4, 10, 17, 5, 13, 3],
  3:  [9, 18, 27, 5, 13, 3],
  4:  [11, 19, 25, 26, 28, 8, 7, 3],
  5:  [24, 23, 18, 5, 13, 2],
  6:  [12, 29, 11, 5, 13, 2],
  7:  [5, 20, 2, 1],
  8:  [3, 6, 21, 7, 8],
  9:  [11, 30],
  10: [2, 1, 27, 9, 18, 4],
};

const FARES = [
  { route_id: 1,  base_fare: 13.00, per_km_rate: 1.80 },
  { route_id: 2,  base_fare: 13.00, per_km_rate: 1.80 },
  { route_id: 3,  base_fare: 13.00, per_km_rate: 1.80 },
  { route_id: 4,  base_fare: 13.00, per_km_rate: 1.80 },
  { route_id: 5,  base_fare: 13.00, per_km_rate: 1.80 },
  { route_id: 6,  base_fare: 13.00, per_km_rate: 1.80 },
  { route_id: 7,  base_fare: 10.00, per_km_rate: 2.00 },
  { route_id: 8,  base_fare: 10.00, per_km_rate: 2.00 },
  { route_id: 9,  base_fare: 10.00, per_km_rate: 2.00 },
  { route_id: 10, base_fare: 13.00, per_km_rate: 1.80 },
];

const ANNOUNCEMENTS = [
  {
    title: 'Road Repair on Montilla Boulevard',
    body: 'Expect delays along Montilla Boulevard due to ongoing road repair works. Routes J01 and J03 may be affected.',
    type: 'warning',
    route_id: 1,
    is_active: 1,
  },
  {
    title: 'New Jeepney Fare Effective Immediately',
    body: 'LTFRB has approved a minimum fare of PHP 13.00 for jeepneys. All routes updated accordingly.',
    type: 'info',
    route_id: null,
    is_active: 1,
  },
  {
    title: 'BCIT Terminal Expansion',
    body: 'The Butuan City Integrated Terminal is undergoing expansion. Temporary loading zones are in effect.',
    type: 'info',
    route_id: 2,
    is_active: 1,
  },
];

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function seed() {
  const db = getDb();
  console.log('🌱 Seeding SakaySmart Butuan database...\n');

  db.exec(`
    DELETE FROM route_graph_edges;
    DELETE FROM feedback;
    DELETE FROM announcements;
    DELETE FROM fares;
    DELETE FROM route_stops;
    DELETE FROM routes;
    DELETE FROM landmarks;
  `);

  // Landmarks
  const insertLandmark = db.prepare(
    'INSERT INTO landmarks (id, name, alias, latitude, longitude, type, barangay) VALUES (?,?,?,?,?,?,?)'
  );
  for (const lm of LANDMARKS) {
    insertLandmark.run(lm.id, lm.name, lm.alias, lm.lat, lm.lng, lm.type, lm.barangay);
  }
  console.log(`✅ Inserted ${LANDMARKS.length} landmarks`);

  // Routes
  const insertRoute = db.prepare(
    'INSERT INTO routes (id, name, code, type, description, color) VALUES (?,?,?,?,?,?)'
  );
  for (const r of ROUTES) {
    insertRoute.run(r.id, r.name, r.code, r.type, r.description, r.color);
  }
  console.log(`✅ Inserted ${ROUTES.length} routes`);

  // Route stops
  const insertStop = db.prepare('INSERT INTO route_stops (route_id, landmark_id, stop_order) VALUES (?,?,?)');
  let stopCount = 0;
  for (const [routeId, stops] of Object.entries(ROUTE_STOPS)) {
    stops.forEach((landmarkId, idx) => {
      insertStop.run(Number(routeId), landmarkId, idx + 1);
      stopCount++;
    });
  }
  console.log(`✅ Inserted ${stopCount} route stops`);

  // Fares
  const insertFare = db.prepare('INSERT INTO fares (route_id, base_fare, per_km_rate) VALUES (?,?,?)');
  for (const f of FARES) insertFare.run(f.route_id, f.base_fare, f.per_km_rate);
  console.log(`✅ Inserted ${FARES.length} fares`);

  // Announcements
  const insertAnn = db.prepare(
    'INSERT INTO announcements (title, body, type, route_id, is_active) VALUES (?,?,?,?,?)'
  );
  for (const a of ANNOUNCEMENTS) insertAnn.run(a.title, a.body, a.type, a.route_id, a.is_active);
  console.log(`✅ Inserted ${ANNOUNCEMENTS.length} announcements`);

  // Build graph edges
  const landmarkMap = {};
  for (const lm of LANDMARKS) landmarkMap[lm.id] = lm;
  const fareMap = {};
  for (const f of FARES) fareMap[f.route_id] = f;

  const insertEdge = db.prepare(
    'INSERT INTO route_graph_edges (from_landmark, to_landmark, route_id, distance_km, travel_time_min, fare) VALUES (?,?,?,?,?,?)'
  );

  let edgeCount = 0;
  for (const [routeId, stops] of Object.entries(ROUTE_STOPS)) {
    const rid = Number(routeId);
    const fareInfo = fareMap[rid] || { base_fare: 13, per_km_rate: 1.80 };

    for (let i = 0; i < stops.length - 1; i++) {
      const fromId = stops[i];
      const toId   = stops[i + 1];
      const from   = landmarkMap[fromId];
      const to     = landmarkMap[toId];
      if (!from || !to) continue;

      const distKm   = haversineKm(from.lat, from.lng, to.lat, to.lng);
      const timeMin  = (distKm / 30) * 60;
      const fare     = fareInfo.base_fare + Math.max(0, distKm - 4) * fareInfo.per_km_rate;

      insertEdge.run(fromId, toId, rid, distKm, timeMin, fare);
      insertEdge.run(toId, fromId, rid, distKm, timeMin, fare);
      edgeCount += 2;
    }
  }
  console.log(`✅ Built ${edgeCount} graph edges`);
  console.log('\n🎉 Database seeded successfully!');
  closeDb();
}

seed();
