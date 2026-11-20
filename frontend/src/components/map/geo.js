export const MAP_CENTER = [53.2152, -4.2025];

export const LANDMARKS = {
  station: { name: 'Llanfairpwll Station', lat: 53.22087, lng: -4.20936 },
  column: { name: "Marquess of Anglesey's Column", lat: 53.22086, lng: -4.19675 },
  stMarys: { name: "St Mary's Church", lat: 53.21772, lng: -4.19261 },
  britannia: { name: 'Britannia Bridge', lat: 53.21651, lng: -4.18638 },
};

// Approximate Anglesey shoreline of the Menai Strait, SW -> NE.
export const SHORE = [
  [53.1962, -4.248], [53.1995, -4.232], [53.2025, -4.2185], [53.2058, -4.2095], [53.2098, -4.2008],
  [53.2135, -4.1935], [53.2163, -4.1872], [53.2192, -4.1802], [53.2218, -4.1752], [53.2236, -4.1688],
  [53.2258, -4.1642], [53.2282, -4.1598],
];

export const ROADS = {
  A5: [[53.2236, -4.248], [53.2222, -4.2295], [53.2214, -4.2155], [53.2212, -4.2075], [53.2209, -4.2005], [53.2192, -4.1945], [53.2172, -4.1895], [53.2163, -4.1866]],
  A4080: [[53.2212, -4.2098], [53.2172, -4.2128], [53.2118, -4.2165], [53.2062, -4.2215], [53.2018, -4.2312], [53.1985, -4.248]],
  RAIL: [[53.2248, -4.248], [53.2228, -4.2275], [53.2209, -4.2094], [53.2199, -4.1995], [53.2183, -4.1925], [53.2165, -4.1862]],
};

export const SIGHTING_LABEL_TIME = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const metres = (a, b) => {
  const dLat = (a.lat - b.lat) * 111320;
  const dLng = (a.lng - b.lng) * 111320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
};

export function nearestHotspot(point, hotspots) {
  let best = null;
  for (const h of hotspots) {
    const d = metres(point, h);
    if (!best || d < best.d) best = { spot: h, d };
  }
  return best;
}

// Fans sightings out around the haunt they belong to so markers never stack.
export function sightingOffsets(sightings, hotspots) {
  const counts = {};
  return sightings
    .filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number')
    .map((s) => {
      const near = nearestHotspot(s, hotspots);
      const key = near && near.d < 400 ? near.spot.id : s.id;
      const i = (counts[key] = (counts[key] ?? -1) + 1);
      const angle = (-50 + i * 42) * (Math.PI / 180);
      const r = near && near.d < 400 ? 34 + Math.floor(i / 6) * 18 : 0;
      return { sighting: s, dx: Math.round(Math.cos(angle) * r), dy: Math.round(Math.sin(angle) * r) };
    });
}
