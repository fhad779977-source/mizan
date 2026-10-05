"""
Fetches every street in a bounding box from an Overpass mirror, tile by tile,
caching each tile so an interrupted run resumes where it stopped.

  python3 scripts/fetch-overpass-tiles.py <cityId> <south> <west> <north> <east> [tileDeg]

Polite by design: one request at a time, backs off when the server is busy.
"""
import json, os, sys, time, urllib.parse, urllib.request

ENDPOINT = "https://overpass.kumi.systems/api/interpreter"
HIGHWAYS = "motorway|trunk|primary|secondary|tertiary|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link|unclassified|residential|living_street|pedestrian"

city, s, w, n, e = sys.argv[1], *map(float, sys.argv[2:6])
step = float(sys.argv[6]) if len(sys.argv) > 6 else 0.05
out_dir = os.path.join(os.path.dirname(__file__), ".cache", "overpass", city)
os.makedirs(out_dir, exist_ok=True)

tiles = []
lat = s
while lat < n - 1e-9:
    lon = w
    while lon < e - 1e-9:
        tiles.append((round(lat, 4), round(lon, 4), round(min(lat + step, n), 4), round(min(lon + step, e), 4)))
        lon += step
    lat += step

for i, (ts, tw, tn, te) in enumerate(tiles):
    path = os.path.join(out_dir, f"{ts}_{tw}_{tn}_{te}.json")
    if os.path.exists(path):
        continue
    query = f'[out:json][timeout:180];way["highway"~"^({HIGHWAYS})$"]({ts},{tw},{tn},{te});out tags geom qt;'
    for attempt in range(8):
        t0 = time.time()
        try:
            req = urllib.request.Request(
                ENDPOINT,
                data=urllib.parse.urlencode({"data": query}).encode(),
                headers={"User-Agent": "planet-earth-site/1.0 (static data build; low volume)"},
            )
            with urllib.request.urlopen(req, timeout=400) as res:
                body = res.read()
            data = json.loads(body)
            if "remark" in data and "runtime error" in data.get("remark", ""):
                raise RuntimeError(data["remark"][:120])
            with open(path, "wb") as f:
                f.write(body)
            print(f"[{i + 1}/{len(tiles)}] {ts},{tw} ok {len(data['elements'])} ways in {time.time() - t0:.0f}s", flush=True)
            break
        except Exception as err:  # busy server, timeout, 429/504
            wait = min(300, 30 * (attempt + 1))
            print(f"[{i + 1}/{len(tiles)}] {ts},{tw} retry {attempt + 1} after {time.time() - t0:.0f}s: {str(err)[:100]}; waiting {wait}s", flush=True)
            time.sleep(wait)
    else:
        print(f"[{i + 1}/{len(tiles)}] {ts},{tw} FAILED", flush=True)
print("ALL_DONE", flush=True)
