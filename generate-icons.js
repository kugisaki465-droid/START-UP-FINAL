const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'frontend/public');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const svgBus = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#f97316"/>
  <rect x="15" y="25" width="70" height="45" rx="8" fill="white"/>
  <rect x="20" y="30" width="25" height="18" rx="3" fill="#f97316"/>
  <rect x="55" y="30" width="25" height="18" rx="3" fill="#f97316"/>
  <rect x="15" y="55" width="70" height="10" rx="2" fill="#e5e7eb"/>
  <circle cx="28" cy="75" r="7" fill="#374151"/>
  <circle cx="28" cy="75" r="3" fill="#9ca3af"/>
  <circle cx="72" cy="75" r="7" fill="#374151"/>
  <circle cx="72" cy="75" r="3" fill="#9ca3af"/>
  <rect x="42" y="60" width="16" height="8" rx="2" fill="#f97316"/>
</svg>`;

const icon192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="38" fill="#f97316"/>
  <rect x="29" y="48" width="134" height="86" rx="15" fill="white"/>
  <rect x="38" y="57" width="48" height="34" rx="6" fill="#f97316"/>
  <rect x="106" y="57" width="48" height="34" rx="6" fill="#f97316"/>
  <rect x="29" y="105" width="134" height="20" rx="4" fill="#e5e7eb"/>
  <circle cx="54" cy="144" r="13" fill="#374151"/>
  <circle cx="54" cy="144" r="6" fill="#9ca3af"/>
  <circle cx="138" cy="144" r="13" fill="#374151"/>
  <circle cx="138" cy="144" r="6" fill="#9ca3af"/>
  <rect x="80" y="115" width="32" height="15" rx="4" fill="#f97316"/>
  <text x="96" y="185" font-size="14" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="bold">SakaySmart</text>
</svg>`;

const icon512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#f97316"/>
  <rect x="76" y="128" width="360" height="230" rx="40" fill="white"/>
  <rect x="100" y="152" width="128" height="90" rx="16" fill="#f97316"/>
  <rect x="284" y="152" width="128" height="90" rx="16" fill="#f97316"/>
  <rect x="76" y="280" width="360" height="54" rx="10" fill="#e5e7eb"/>
  <circle cx="144" cy="384" r="36" fill="#374151"/>
  <circle cx="144" cy="384" r="16" fill="#9ca3af"/>
  <circle cx="368" cy="384" r="36" fill="#374151"/>
  <circle cx="368" cy="384" r="16" fill="#9ca3af"/>
  <rect x="214" y="308" width="84" height="40" rx="10" fill="#f97316"/>
  <text x="256" y="490" font-size="38" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="bold">SakaySmart</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'bus-icon.svg'), svgBus);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192); // SVG content, PNG extension — browsers handle it
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), icon512);

console.log('Icons generated in frontend/public/');
