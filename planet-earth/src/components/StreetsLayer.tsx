import { useEffect, useMemo, useRef, useState } from 'react';

/** public/cities/<id>.streets.json — see scripts/build-city-streets.py. */
interface StreetsFile {
  v: 1;
  o: [number, number];
  n: string[][];
  w: number[][];
}

interface Label {
  cls: number;
  x: number;
  y: number;
  angle: number;
  len: number;
  text: string;
}

interface Prepared {
  /** paths[cls] → cell key → Path2D (world metres). */
  paths: Map<string, Path2D>[];
  cellSize: number;
  labels: Label[];
}

interface StreetsLayerProps {
  cityId: string;
  /** Map projection origin [lat, lon] — must match the SVG layer. */
  center: [number, number];
  view: { k: number; x: number; y: number };
  /** View scale at which the whole city fits; detail is revealed relative to it. */
  fitK: number;
  width: number;
  height: number;
}

const CELL = 1500; // metres
const cache = new Map<string, Promise<StreetsFile | null>>();

function load(id: string) {
  let p = cache.get(id);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}cities/${id}.streets.json`)
      .then((r) => (r.ok ? (r.json() as Promise<StreetsFile>) : null))
      .catch(() => null);
    cache.set(id, p);
  }
  return p;
}

function prepare(file: StreetsFile, center: [number, number]): Prepared {
  const [lat0, lon0] = center;
  const kx = Math.cos((lat0 * Math.PI) / 180) * 111320;
  const ky = 110540;
  const [olat, olon] = file.o;
  const paths: Map<string, Path2D>[] = [new Map(), new Map(), new Map()];
  const labels: Label[] = [];
  // Several OSM ways often share one street name; label each name once per cell.
  const labelled = new Set<string>();

  for (const way of file.w) {
    const cls = way[0];
    const nameIdx = way[1];
    let qx = way[2];
    let qy = way[3];
    const pts: number[] = [];
    for (let i = 2; i < way.length; i += 2) {
      if (i > 2) {
        qx += way[i];
        qy += way[i + 1];
      }
      const lon = olon + qx * 1e-5;
      const lat = olat + qy * 1e-5;
      pts.push((lon - lon0) * kx, -(lat - lat0) * ky);
    }
    const key = `${Math.floor(pts[0] / CELL)},${Math.floor(pts[1] / CELL)}`;
    let path = paths[cls].get(key);
    if (!path) paths[cls].set(key, (path = new Path2D()));
    path.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) path.lineTo(pts[i], pts[i + 1]);

    if (nameIdx >= 0) {
      // Label on the longest segment of the way.
      let best = 0;
      let bi = 0;
      for (let i = 2; i < pts.length; i += 2) {
        const len = Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
        if (len > best) {
          best = len;
          bi = i;
        }
      }
      if (best < 60) continue;
      const [en, local] = file.n[nameIdx];
      const text = local ? `${en} · ${local}` : en;
      const cellKey = `${text}|${key}`;
      if (labelled.has(cellKey)) continue;
      labelled.add(cellKey);
      let angle = Math.atan2(pts[bi + 1] - pts[bi - 1], pts[bi] - pts[bi - 2]);
      if (angle > Math.PI / 2) angle -= Math.PI;
      if (angle < -Math.PI / 2) angle += Math.PI;
      labels.push({ cls, x: (pts[bi] + pts[bi - 2]) / 2, y: (pts[bi + 1] + pts[bi - 1]) / 2, angle, len: best, text });
    }
  }
  labels.sort((a, b) => a.cls - b.cls || b.len - a.len);
  return { paths, cellSize: CELL, labels };
}

/** Level of detail: how visible each class is at a given zoom (relative to the fitted view). */
function classAlpha(cls: number, zoomRatio: number) {
  if (cls === 0) return 1;
  if (cls === 1) return Math.min(1, Math.max(0.35, (zoomRatio - 0.6) / 1.2));
  return Math.min(1, Math.max(0, (zoomRatio - 1.3) / 1.4));
}

const STYLE = [
  { color: 'rgba(160, 200, 245, 0.55)', width: 1.4 },
  { color: 'rgba(150, 190, 235, 0.38)', width: 1.05 },
  { color: 'rgba(140, 175, 220, 0.24)', width: 0.8 },
];

export function StreetsLayer({ cityId, center, view, fitK, width, height }: StreetsLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<StreetsFile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFile(null);
    setReady(false);
    void load(cityId).then((f) => !cancelled && setFile(f));
    return () => {
      cancelled = true;
    };
  }, [cityId]);

  const prepared = useMemo(() => (file ? prepare(file, center) : null), [file, center]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !prepared) return;
    const frame = requestAnimationFrame(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { k, x, y } = view;
      const zoomRatio = k / fitK;
      // Visible world rectangle, padded by one cell so long ways starting off-screen still draw.
      const pad = prepared.cellSize;
      const wx0 = -x / k - pad;
      const wy0 = -y / k - pad;
      const wx1 = (width - x) / k + pad;
      const wy1 = (height - y) / k + pad;
      const cx0 = Math.floor(wx0 / prepared.cellSize);
      const cy0 = Math.floor(wy0 / prepared.cellSize);
      const cx1 = Math.floor(wx1 / prepared.cellSize);
      const cy1 = Math.floor(wy1 / prepared.cellSize);

      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * x, dpr * y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let cls = 2; cls >= 0; cls--) {
        const alpha = classAlpha(cls, zoomRatio);
        if (alpha <= 0.01) continue;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = STYLE[cls].color;
        ctx.lineWidth = (STYLE[cls].width * (cls === 0 ? 1 + Math.min(zoomRatio, 6) * 0.12 : 1)) / k;
        for (const [key, path] of prepared.paths[cls]) {
          const [cx, cy] = key.split(',').map(Number);
          if (cx < cx0 || cx > cx1 || cy < cy0 || cy > cy1) continue;
          ctx.stroke(path);
        }
      }
      ctx.globalAlpha = 1;

      // Street names, placed greedily without overlaps.
      if (zoomRatio > 1.8) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = '500 10px Inter, ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        const boxes: number[] = [];
        let placed = 0;
        const maxLabels = width < 700 ? 45 : 110;
        for (const label of prepared.labels) {
          if (placed >= maxLabels) break;
          if (label.cls === 2 && zoomRatio < 3.2) continue;
          const sx = label.x * k + x;
          const sy = label.y * k + y;
          if (sx < 20 || sy < 20 || sx > width - 20 || sy > height - 20) continue;
          const tw = ctx.measureText(label.text).width;
          if (label.len * k < tw + 16) continue;
          const half = tw / 2 + 4;
          const bx0 = sx - half;
          const bx1 = sx + half;
          const by0 = sy - half * Math.abs(Math.sin(label.angle)) - 7;
          const by1 = sy + half * Math.abs(Math.sin(label.angle)) + 7;
          let clear = true;
          for (let i = 0; i < boxes.length && clear; i += 4) {
            clear = bx1 < boxes[i] || bx0 > boxes[i + 1] || by1 < boxes[i + 2] || by0 > boxes[i + 3];
          }
          if (!clear) continue;
          boxes.push(bx0, bx1, by0, by1);
          placed++;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(label.angle);
          ctx.strokeStyle = 'rgba(7, 11, 20, 0.9)';
          ctx.lineWidth = 3;
          ctx.strokeText(label.text, 0, 0);
          ctx.fillStyle = label.cls === 2 ? 'rgba(200, 220, 245, 0.7)' : 'rgba(220, 235, 255, 0.86)';
          ctx.fillText(label.text, 0, 0);
          ctx.restore();
        }
      }
      if (!ready) setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [prepared, view, fitK, width, height, ready]);

  return (
    <canvas
      ref={canvasRef}
      className={`citymap__streets ${ready ? 'is-ready' : ''}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
