/**
 * Builds public/cities/<id>.json from OpenStreetMap via Nominatim.
 *
 *   NODE_USE_ENV_PROXY=1 node --experimental-strip-types scripts/build-city-maps.mjs [cityId…]
 *
 * Respects the Nominatim usage policy: one request per second, an identifying
 * User-Agent, and an on-disk cache so re-runs never repeat a query.
 * Map data © OpenStreetMap contributors (ODbL).
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COUNTRIES } from '../src/data/countries.ts';
import { CITY_EXTRAS } from './city-maps.config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, 'scripts', '.cache');
const OUT = join(ROOT, 'public', 'cities');
const ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'planet-earth-site/1.0 (static data build; low volume)';

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

let lastRequest = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function nominatim(params) {
  const url = `${ENDPOINT}?${new URLSearchParams({ format: 'jsonv2', 'accept-language': 'en', namedetails: '1', ...params })}`;
  const file = join(CACHE, createHash('sha1').update(url).digest('hex') + '.json');
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  for (let attempt = 0; attempt < 4; attempt++) {
    const wait = lastRequest + 1100 - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequest = Date.now();
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      writeFileSync(file, JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn(`  retry ${attempt + 1} (${err.message})`);
      await sleep(2000 * (attempt + 1));
    }
  }
  throw new Error(`Nominatim failed: ${url}`);
}

const round = (n) => Math.round(n * 1e5) / 1e5;
const isLatin = (s) => /^[\p{Script=Latin}\p{N}\p{P}\p{Zs}\p{S}]+$/u.test(s);

function localName(details, display) {
  if (!details) return undefined;
  const candidates = [details['name:ar'], details.name].filter(Boolean);
  const local = candidates.find((n) => !isLatin(n) && n !== display);
  return local;
}

const HERITAGE_TYPES = new Set(['castle', 'fort', 'archaeological_site', 'ruins', 'monument', 'memorial', 'city_gate', 'palace', 'heritage', 'tomb', 'citadel']);

function classifyLandmark(hit, spot) {
  if (hit.category === 'historic' || HERITAGE_TYPES.has(hit.type)) return 'heritage';
  if (/UNESCO|historic|ancient|fort|palace|old town|heritage|\d{3,4}-year|century|Nabataean|Roman|Ottoman|mud-brick|medieval/i.test(spot.note)) return 'heritage';
  return 'landmark';
}

/** Tries the display name, then any aliases (often the Arabic or local OSM name). */
async function findPlace(names, viewbox, accept = () => true) {
  const [w, s, e, n] = viewbox;
  const inBox = (h) => +h.lon >= w && +h.lon <= e && +h.lat >= s && +h.lat <= n;
  for (const q of names) {
    const bounded = await nominatim({ q, viewbox: `${w},${n},${e},${s}`, bounded: '1', limit: '5' });
    const hit = bounded.find((h) => inBox(h) && accept(h));
    if (hit) return hit;
  }
  return null;
}

const norm = (t) =>
  t
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’'`\-]/g, ' ');

/** True when the hit's address mentions the district (ignoring "Al"/"The" and accents). */
function sameArea(hit, area) {
  const address = norm(hit.display_name ?? '');
  const words = norm(area)
    .split(/[\s,·]+/)
    .filter((w) => w.length > 2 && !['al', 'the', 'near', 'terrace', 'arr'].includes(w));
  return words.length === 0 || words.some((w) => address.includes(w));
}

async function buildCity(id) {
  const areaCache = new Map();
  /** Within 2.5 km of the district's centre — or, if the district cannot be located, named in the address. */
  const nearArea = async (hit, area) => {
    if (!areaCache.has(area)) areaCache.set(area, await findPlace([`${area}, ${region.name}`, area], viewbox));
    const centre = areaCache.get(area);
    if (!centre) return sameArea(hit, area);
    const km = Math.hypot((+hit.lat - +centre.lat) * 111, (+hit.lon - +centre.lon) * 111 * Math.cos((+hit.lat * Math.PI) / 180));
    return km <= 2.5;
  };
  const extras = CITY_EXTRAS[id];
  const country = COUNTRIES.find((c) => c.regions.some((r) => r.id === id));
  const region = country?.regions.find((r) => r.id === id);
  if (!region) throw new Error(`Unknown city ${id}`);

  const r = extras.radius ?? 0.2;
  const aliases = extras.aliases ?? {};
  const queries = (name) => [name, ...(aliases[name] ?? [])];
  const k = Math.cos((region.lat * Math.PI) / 180);
  const viewbox = [region.lon - r / k, region.lat - r, region.lon + r / k, region.lat + r];
  console.log(`\n▸ ${region.name}`);

  const missing = [];
  const pois = [];
  const seen = new Set();

  const addPoi = (hit, name, cat, note, area) => {
    // One marker per real-world feature, even if it is listed under several categories.
    const key = `${hit.osm_type}${hit.osm_id}`;
    if (seen.has(key)) return;
    seen.add(key);
    pois.push({
      name,
      local: localName(hit.namedetails, name),
      cat,
      lat: round(+hit.lat),
      lon: round(+hit.lon),
      ...(note ? { note } : {}),
      ...(area ? { area } : {}),
      osm: `${hit.osm_type}/${hit.osm_id}`,
    });
  };

  for (const cat of ['hotel', 'tower', 'office', 'mall']) {
    for (const name of extras[cat] ?? []) {
      const hit = await findPlace(queries(name), viewbox);
      if (!hit) {
        missing.push(`${cat}: ${name}`);
        continue;
      }
      addPoi(hit, name, cat);
    }
  }

  const guide = region.guide;
  const guideGroups = guide
    ? [
        ['landmarks', null],
        ['cafes', 'cafe'],
        ['restaurants', 'restaurant'],
      ]
    : [];
  for (const [group, cat] of guideGroups) {
    for (const spot of guide[group]) {
      // Prefer the branch in the named district (chains have many branches across a city).
      const specificArea = spot.area && spot.area !== region.name && !/citywide/i.test(spot.area) ? spot.area : null;
      let hit = specificArea ? await findPlace([`${spot.name}, ${specificArea}`], viewbox) : null;
      if (!hit) {
        hit = await findPlace(queries(spot.name), viewbox);
        // Cafés and restaurants are often chains: a name-only match must sit near the named
        // district, otherwise it is probably another branch.
        if (hit && specificArea && cat && !(await nearArea(hit, specificArea))) {
          missing.push(`${group}: ${spot.name} (only found outside ${specificArea})`);
          continue;
        }
      }
      if (!hit) {
        missing.push(`${group}: ${spot.name}`);
        continue;
      }
      addPoi(hit, spot.name, cat ?? classifyLandmark(hit, spot), spot.note, spot.area);
    }
  }

  const districts = [];
  for (const name of extras.districts ?? []) {
    const hit = await findPlace(queries(name), viewbox, (h) => h.category === 'place' || h.category === 'boundary');
    if (!hit) {
      missing.push(`district: ${name}`);
      continue;
    }
    districts.push({ name, local: localName(hit.namedetails, name), lat: round(+hit.lat), lon: round(+hit.lon) });
  }

  const roads = [];
  for (const name of extras.roads ?? []) {
    // Long roads are split into many OSM ways; query every known spelling and merge by way id.
    const ways = new Map();
    for (const q of queries(name)) {
      const hits = await nominatim({
        q,
        viewbox: `${viewbox[0]},${viewbox[3]},${viewbox[2]},${viewbox[1]}`,
        bounded: '1',
        limit: '50',
        dedupe: '0',
        polygon_geojson: '1',
        polygon_threshold: '0.00008',
      });
      for (const h of hits) if (h.category === 'highway' && h.geojson) ways.set(`${h.osm_type}${h.osm_id}`, h);
    }
    const lines = [];
    let local;
    for (const h of ways.values()) {
      local ??= localName(h.namedetails, name);
      const g = h.geojson;
      const parts = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
      for (const part of parts) if (part.length > 1) lines.push(part.map(([x, y]) => [round(x), round(y)]));
    }
    if (!lines.length) {
      missing.push(`road: ${name}`);
      continue;
    }
    roads.push({ name, local, lines });
  }

  const data = {
    id,
    name: region.name,
    country: country.name,
    center: [round(region.lat), round(region.lon)],
    bbox: viewbox.map(round),
    roads,
    districts,
    pois,
    attribution: '© OpenStreetMap contributors',
  };
  writeFileSync(join(OUT, `${id}.json`), JSON.stringify(data));
  console.log(`  ${pois.length} places · ${roads.length} roads · ${districts.length} districts`);
  if (missing.length) console.log(`  not found: ${missing.join(' | ')}`);
  return { id, missing };
}

const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CITY_EXTRAS);
for (const id of ids) await buildCity(id);

// Index of available maps, so the UI only offers a map where one exists.
const built = readdirSync(OUT)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .sort();
writeFileSync(
  join(ROOT, 'src', 'data', 'cityMaps.generated.ts'),
  `// Generated by scripts/build-city-maps.mjs — do not edit.\nexport const CITY_MAP_IDS: readonly string[] = ${JSON.stringify(built)};\n`,
);
