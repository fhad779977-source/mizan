"""
Builds public/cities/<id>.streets.json — every drivable/walkable street around a
city's guide area — from an OpenStreetMap extract (.osm.pbf) or from Overpass
tiles fetched by fetch-overpass-tiles.py.

  python3 scripts/build-city-streets.py <cityId> pbf <path/to/City.osm.pbf>
  python3 scripts/build-city-streets.py <cityId> overpass

Output format (compact, loaded lazily by the city map):
  { "v": 1, "o": [lat0, lon0], "n": [[name, local], ...],
    "w": [[class, nameIndex, x0, y0, dx1, dy1, ...], ...] }
x/y are integer offsets from "o" in 1e-5 degrees, delta-encoded after the first
point. class: 0 major (motorway/trunk/primary), 1 secondary/tertiary, 2 local.
Map data © OpenStreetMap contributors (ODbL).
"""
import glob, json, math, os, re, statistics, sys

ROOT = os.path.join(os.path.dirname(__file__), "..")
CLASS = {
    **dict.fromkeys(["motorway", "trunk", "primary", "motorway_link", "trunk_link", "primary_link"], 0),
    **dict.fromkeys(["secondary", "tertiary", "secondary_link", "tertiary_link"], 1),
    **dict.fromkeys(["unclassified", "residential", "living_street", "pedestrian"], 2),
}
# Half-size of the street box, in degrees of latitude, around the guide's places.
RADIUS = {
    "riyadh": 0.125, "london": 0.07, "new-york": 0.08, "paris": 0.06, "istanbul": 0.08,
    "tokyo": 0.09, "cairo": 0.07, "barcelona": 0.05, "washington": 0.06, "los-angeles": 0.12,
    "san-francisco": 0.06, "edinburgh": 0.04, "jeddah": 0.09, "dubai": 0.1, "makkah": 0.04,
    "madinah": 0.04, "khobar": 0.04, "abu-dhabi": 0.05, "rome": 0.03, "alula": 0.035,
}
SIMPLIFY = 2.5e-5  # ≈ 2.5 m
LATIN = re.compile(r"^[\x00-ɏḀ-ỿ -⁯’]+$")


def simplify(pts, tol):
    """Douglas–Peucker on (lon, lat) tuples."""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]
        bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        norm = math.hypot(dx, dy) or 1e-12
        best, idx = 0.0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * (px - ax) - dx * (py - ay)) / norm
            if d > best:
                best, idx = d, i
        if best > tol and idx > 0:
            keep[idx] = True
            stack += [(a, idx), (idx, b)]
    return [p for p, k in zip(pts, keep) if k]


def names_for(tags):
    name = tags.get("name")
    en = tags.get("name:en")
    if not name and not en:
        return None
    display = en or name
    local = name if name and name != display and not LATIN.match(name) else None
    if not LATIN.match(display) and en is None:
        # No English name: show the local script only.
        return (display, None)
    return (display, local)


def main():
    city, source = sys.argv[1], sys.argv[2]
    meta = json.load(open(os.path.join(ROOT, "public", "cities", f"{city}.json")))
    lats = [p["lat"] for p in meta["pois"]] or [meta["center"][0]]
    lons = [p["lon"] for p in meta["pois"]] or [meta["center"][1]]
    lat0, lon0 = statistics.median(lats), statistics.median(lons)
    r = RADIUS.get(city, 0.06)
    k = math.cos(math.radians(lat0))
    s, n, w, e = lat0 - r, lat0 + r, lon0 - r / k, lon0 + r / k

    ways = []  # (class, (name, local) | None, [(lon, lat)])

    def consider(highway, tags, pts):
        cls = CLASS.get(highway)
        if cls is None or len(pts) < 2:
            return
        if not any(s <= la <= n and w <= lo <= e for lo, la in pts):
            return
        ways.append((cls, names_for(tags), pts))

    if source == "pbf":
        import osmium

        class Handler(osmium.SimpleHandler):
            def way(self, way):
                hw = way.tags.get("highway")
                if hw not in CLASS:
                    return
                try:
                    pts = [(nd.lon, nd.lat) for nd in way.nodes]
                except osmium.InvalidLocationError:
                    return
                consider(hw, {t.k: t.v for t in way.tags if t.k in ("name", "name:en")}, pts)

        Handler().apply_file(sys.argv[3], locations=True)
    else:
        seen = set()
        for path in glob.glob(os.path.join(os.path.dirname(__file__), ".cache", "overpass", city, "*.json")):
            for el in json.load(open(path)).get("elements", []):
                if el.get("type") != "way" or el["id"] in seen or "geometry" not in el:
                    continue
                seen.add(el["id"])
                tags = el.get("tags", {})
                consider(tags.get("highway"), tags, [(g["lon"], g["lat"]) for g in el["geometry"]])

    name_index, names, out = {}, [], []
    pts_total = 0
    for cls, nm, pts in ways:
        pts = simplify(pts, SIMPLIFY)
        q = [(round((lo - lon0) * 1e5), round((la - lat0) * 1e5)) for lo, la in pts]
        dedup = [q[0]] + [p for i, p in enumerate(q[1:], 1) if p != q[i - 1]]
        if len(dedup) < 2:
            continue
        idx = -1
        if nm:
            if nm not in name_index:
                name_index[nm] = len(names)
                names.append([nm[0], nm[1]] if nm[1] else [nm[0]])
            idx = name_index[nm]
        flat = [cls, idx, dedup[0][0], dedup[0][1]]
        for (ax, ay), (bx, by) in zip(dedup, dedup[1:]):
            flat += [bx - ax, by - ay]
        out.append(flat)
        pts_total += len(dedup)

    # Draw order: local streets first, majors on top.
    out.sort(key=lambda wy: -wy[0])
    data = {"v": 1, "o": [round(lat0, 6), round(lon0, 6)], "n": names, "w": out}
    dest = os.path.join(ROOT, "public", "cities", f"{city}.streets.json")
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    size = os.path.getsize(dest) / 1048576
    counts = [sum(1 for wy in out if wy[0] == c) for c in range(3)]
    print(f"{city}: {len(out)} streets (major {counts[0]}, secondary {counts[1]}, local {counts[2]}), {pts_total} points, {len(names)} names, {size:.2f} MB")


if __name__ == "__main__":
    main()
