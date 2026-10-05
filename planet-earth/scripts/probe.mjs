// Dev helper: node scripts/probe.mjs <lat> <lon> <radius> "query" ["query"…]
const [lat, lon, r, ...qs] = process.argv.slice(2);
const k = Math.cos((+lat * Math.PI) / 180);
const vb = [+lon - r / k, +lat + +r, +lon + r / k, +lat - r].join(',');
for (const q of qs) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q, format: 'jsonv2', viewbox: vb, bounded: '1', limit: '3', namedetails: '1', 'accept-language': 'en' })}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'planet-earth-site/1.0 (static data build; low volume)' } });
  const d = await res.json();
  console.log(`\n${q} →`, d.length ? '' : 'none');
  for (const h of d) console.log(`  ${h.name} | ${h.category}/${h.type} | ${(+h.lat).toFixed(4)},${(+h.lon).toFixed(4)} | ${h.namedetails?.['name:ar'] ?? ''}`);
  await new Promise((r) => setTimeout(r, 1100));
}
