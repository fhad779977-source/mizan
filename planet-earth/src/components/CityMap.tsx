import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { CATEGORY_META, CATEGORY_ORDER, type CityMapData, type CityPoi, type PoiCategory } from '../data/cityMap';

interface CityMapProps {
  data: CityMapData;
  /** Place to fly to (from the guide list); `n` changes on every request. */
  focus: { name: string; n: number } | null;
  onClose: () => void;
}

interface View {
  k: number;
  x: number;
  y: number;
}

/** Glyphs drawn in a 24×24 box. */
const ICONS: Record<PoiCategory, string> = {
  heritage: 'M4 20h16M6 20V10l-2-2V5h3v2h2V5h2v2h2V5h2v2h2V5h3v3l-2 2v10M10 20v-4a2 2 0 0 1 4 0v4',
  landmark: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z',
  cafe: 'M5 10h11v3.5A4.5 4.5 0 0 1 11.5 18h-2A4.5 4.5 0 0 1 5 13.5zM16 11h1.5a2 2 0 0 1 0 4H16M8 4.5c0 1 1 1 1 2M11.5 4.5c0 1 1 1 1 2M4 21h13',
  restaurant: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1-3 4-3 7h3',
  hotel: 'M3 18V7M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6M7 11.5a1.5 1.5 0 1 0 0-.01',
  tower: 'M9 21V7l3-4 3 4v14M7 21h10M12 9v2M12 13v2M12 17v2',
  office: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
  mall: 'M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0',
};

const MIN_ZOOM_FACTOR = 0.5;
const MAX_ZOOM_FACTOR = 14;

export function CityMap({ data, focus, onClose }: CityMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [view, setView] = useState<View>({ k: 0.01, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const fitK = useRef(0.01);
  const [enabled, setEnabled] = useState<Set<PoiCategory>>(() => new Set(CATEGORY_ORDER));
  const [selected, setSelected] = useState<CityPoi | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  /* --------------------------- Projection --------------------------- */
  const project = useMemo(() => {
    const [lat0, lon0] = data.center;
    const kx = Math.cos((lat0 * Math.PI) / 180) * 111320;
    const ky = 110540;
    return (lon: number, lat: number): [number, number] => [(lon - lon0) * kx, -(lat - lat0) * ky];
  }, [data]);

  const roads = useMemo(
    () =>
      data.roads.map((road, ri) => {
        const lines = road.lines.map((line) => line.map(([lon, lat]) => project(lon, lat)));
        const d = lines.map((pts) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')).join('');
        // Label along the longest piece, oriented left-to-right so it never reads upside down.
        let best = lines[0];
        let bestLen = 0;
        for (const pts of lines) {
          let len = 0;
          for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          if (len > bestLen) {
            bestLen = len;
            best = pts;
          }
        }
        const oriented = best[0][0] > best[best.length - 1][0] ? [...best].reverse() : best;
        const labelPath = 'M' + oriented.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L');
        return { id: `road-${data.id}-${ri}`, name: road.name, local: road.local, d, labelPath, labelLen: bestLen };
      }),
    [data, project],
  );

  const pois = useMemo(
    () => data.pois.map((p) => ({ ...p, xy: project(p.lon, p.lat) })).sort((a, b) => b.xy[1] - a.xy[1]),
    [data, project],
  );
  const districts = useMemo(() => data.districts.map((d) => ({ ...d, xy: project(d.lon, d.lat) })), [data, project]);

  const counts = useMemo(() => {
    const c = new Map<PoiCategory, number>();
    for (const p of data.pois) c.set(p.cat, (c.get(p.cat) ?? 0) + 1);
    return c;
  }, [data]);

  /* ----------------------------- Layout ----------------------------- */
  /** Screen area not covered by the Explore panel. */
  const freeRect = useCallback(() => {
    const { w, h } = { w: window.innerWidth, h: window.innerHeight };
    const panel = document.querySelector('.explore__panel')?.getBoundingClientRect();
    const top = 110;
    if (!panel) return { l: 24, t: top, r: w - 24, b: h - 40 };
    if (w <= 820) return { l: 16, t: top, r: w - 16, b: Math.max(top + 160, panel.top - 16) };
    return { l: panel.right + 32, t: top, r: w - 40, b: h - 48 };
  }, []);

  const animateTo = useCallback((target: View, duration = 1.2) => {
    const from = { ...viewRef.current };
    const proxy = { t: 0 };
    gsap.killTweensOf(proxy);
    return gsap.to(proxy, {
      t: 1,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        // Interpolate zoom geometrically so the motion feels even.
        const k = from.k * Math.pow(target.k / from.k, proxy.t);
        setView({ k, x: from.x + (target.x - from.x) * proxy.t, y: from.y + (target.y - from.y) * proxy.t });
      },
    });
  }, []);

  const fit = useCallback(
    (animate: boolean) => {
      const all = pois.map((p) => p.xy);
      if (!all.length) all.push([0, 0]);
      // Frame the dense core (closest 75% to the median), not far-flung outliers like an airport hotel.
      const median = (v: number[]) => [...v].sort((p, q) => p - q)[Math.floor(v.length / 2)];
      const mx = median(all.map((p) => p[0]));
      const my = median(all.map((p) => p[1]));
      const pts = [...all]
        .sort((p, q) => Math.hypot(p[0] - mx, p[1] - my) - Math.hypot(q[0] - mx, q[1] - my))
        .slice(0, Math.max(4, Math.ceil(all.length * 0.75)));
      let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];
      for (const [x, y] of pts) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      const r = freeRect();
      const k = Math.min((r.r - r.l) / Math.max(maxX - minX, 1500), (r.b - r.t) / Math.max(maxY - minY, 1500)) * 0.86;
      fitK.current = k;
      const target = { k, x: (r.l + r.r) / 2 - ((minX + maxX) / 2) * k, y: (r.t + r.b) / 2 - ((minY + maxY) / 2) * k };
      if (animate) animateTo(target, 1.4);
      else setView(target);
    },
    [pois, freeRect, animateTo],
  );

  useLayoutEffect(() => {
    // Start slightly zoomed out, then settle in — a short continuation of the globe's dive.
    fit(false);
    setView((v) => {
      const s = 0.55;
      const cx = size.w / 2;
      const cy = size.h / 2;
      return { k: v.k * s, x: cx - (cx - v.x) * s, y: cy - (cy - v.y) * s };
    });
    const id = requestAnimationFrame(() => {
      setShown(true);
      fit(true);
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ---------------------------- Focusing ---------------------------- */
  const flyTo = useCallback(
    (poi: CityPoi & { xy: [number, number] }) => {
      const r = freeRect();
      const k = Math.max(viewRef.current.k, fitK.current * 4);
      animateTo({ k, x: (r.l + r.r) / 2 - poi.xy[0] * k, y: (r.t + r.b) / 2 - poi.xy[1] * k });
    },
    [freeRect, animateTo],
  );

  useEffect(() => {
    if (!focus) return;
    const poi = pois.find((p) => p.name === focus.name);
    if (!poi) return;
    setEnabled((s) => (s.has(poi.cat) ? s : new Set([...s, poi.cat])));
    setSelected(poi);
    flyTo(poi);
  }, [focus, pois, flyTo]);

  /* --------------------------- Interaction -------------------------- */
  const zoomAt = useCallback((factor: number, sx: number, sy: number) => {
    setView((v) => {
      const k = Math.min(Math.max(v.k * factor, fitK.current * MIN_ZOOM_FACTOR), fitK.current * MAX_ZOOM_FACTOR);
      const f = k / v.k;
      return { k, x: sx - (sx - v.x) * f, y: sy - (sy - v.y) * f };
    });
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(Math.exp(-e.deltaY * 0.0016), e.clientX, e.clientY);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const pts = [...pointers.current.entries()];
    if (pts.length === 2) {
      const other = pts.find(([id]) => id !== e.pointerId)![1];
      const before = Math.hypot(prev.x - other.x, prev.y - other.y);
      const after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
      if (before > 0) zoomAt(after / before, (e.clientX + other.x) / 2, (e.clientY + other.y) / 2);
    } else {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      if (!moved.current && Math.abs(dx) + Math.abs(dy) < 3) return;
      if (!moved.current) {
        // Capture only once a drag starts, so plain taps still reach the markers.
        moved.current = true;
        svgRef.current?.setPointerCapture(e.pointerId);
      }
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
  };

  const toggleCategory = (cat: PoiCategory) =>
    setEnabled((s) => {
      const next = new Set(s);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  /* ----------------------------- Render ----------------------------- */
  const { k, x, y } = view;
  const zoomRatio = k / fitK.current;
  const showAllLabels = zoomRatio > 2.2;
  const visiblePois = pois.filter((p) => enabled.has(p.cat));

  return (
    <div className={`citymap ${shown ? 'is-shown' : ''}`} role="region" aria-label={`Map of ${data.name}`}>
      <svg
        ref={svgRef}
        className="citymap__svg"
        width={size.w}
        height={size.h}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          if (!moved.current) setSelected(null);
        }}
      >
        <defs>
          <pattern id="citymap-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="var(--map-grid)" strokeWidth="1" />
          </pattern>
          <radialGradient id="citymap-vignette" cx="50%" cy="50%" r="75%">
            <stop offset="55%" stopColor="var(--space-0)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--space-0)" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="var(--map-bg)" />
        <rect width="100%" height="100%" fill="url(#citymap-grid)" />

        <g transform={`translate(${x} ${y}) scale(${k})`}>
          <g className="citymap__roads">
            {roads.map((r) => (
              <g key={r.id}>
                <path d={r.d} className="citymap__road-glow" vectorEffect="non-scaling-stroke" />
                <path d={r.d} className="citymap__road" vectorEffect="non-scaling-stroke" />
                <path id={r.id} d={r.labelPath} fill="none" stroke="none" />
              </g>
            ))}
          </g>
          <g className="citymap__road-labels">
            {roads.map((r) =>
              r.labelLen * k > r.name.length * 7 + 40 ? (
                <text key={r.id} style={{ fontSize: 10.5 / k }} dy={-4 / k}>
                  <textPath href={`#${r.id}`} startOffset="50%" textAnchor="middle">
                    {r.name}
                    {r.local ? ` · ${r.local}` : ''}
                  </textPath>
                </text>
              ) : null,
            )}
          </g>
          <g className="citymap__districts">
            {districts.map((d) => (
              <text key={d.name} x={d.xy[0]} y={d.xy[1]} style={{ fontSize: 11 / k, letterSpacing: 3 / k }} textAnchor="middle">
                {d.name.toUpperCase()}
              </text>
            ))}
          </g>
        </g>

        <rect width="100%" height="100%" fill="url(#citymap-vignette)" pointerEvents="none" />

        <g className="citymap__pois">
          {visiblePois.map((p) => {
            const sx = p.xy[0] * k + x;
            const sy = p.xy[1] * k + y;
            if (sx < -60 || sy < -60 || sx > size.w + 60 || sy > size.h + 60) return null;
            const isSel = selected?.osm === p.osm;
            const labelled = isSel || hovered === p.osm || showAllLabels || p.cat === 'heritage' || p.cat === 'tower';
            return (
              <g
                key={p.osm}
                className={`poi poi--${p.cat} ${isSel ? 'is-selected' : ''}`}
                transform={`translate(${sx.toFixed(1)} ${sy.toFixed(1)})`}
                onPointerEnter={() => setHovered(p.osm)}
                onPointerLeave={() => setHovered((h) => (h === p.osm ? null : h))}
                onClick={(e) => {
                  e.stopPropagation();
                  if (moved.current) return;
                  setSelected(p);
                  flyTo(p);
                }}
                role="button"
                tabIndex={0}
                aria-label={`${p.name}, ${CATEGORY_META[p.cat].label}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(p);
                    flyTo(p);
                  }
                }}
              >
                <circle className="poi__halo" r={isSel ? 22 : 16} />
                {p.cat === 'heritage' ? (
                  <rect className="poi__badge" x={-13} y={-13} width={26} height={26} rx={5} transform="rotate(45)" />
                ) : (
                  <circle className="poi__badge" r={13} />
                )}
                <path className="poi__icon" d={ICONS[p.cat]} transform="translate(-8.4 -8.4) scale(0.7)" />
                {labelled && (
                  <text className="poi__label" x={20} y={4}>
                    {p.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="citymap__top">
        <button type="button" className="citymap__back" onClick={onClose}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Back to globe
        </button>
        <div className="citymap__filters" role="group" aria-label="Show on map">
          {CATEGORY_ORDER.filter((c) => counts.get(c)).map((c) => (
            <button
              key={c}
              type="button"
              className={`chip chip--${c} ${enabled.has(c) ? 'is-on' : ''}`}
              aria-pressed={enabled.has(c)}
              onClick={() => toggleCategory(c)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={ICONS[c]} />
              </svg>
              {CATEGORY_META[c].plural}
              <sup>{counts.get(c)}</sup>
            </button>
          ))}
        </div>
      </div>

      <div className="citymap__zoom">
        <button type="button" aria-label="Zoom in" onClick={() => zoomAt(1.6, size.w / 2, size.h / 2)}>
          +
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => zoomAt(1 / 1.6, size.w / 2, size.h / 2)}>
          −
        </button>
        <button type="button" aria-label="Show whole city" onClick={() => fit(true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        </button>
      </div>

      {selected && (
        <article className="citymap__card" key={selected.osm}>
          <header>
            <span className={`citymap__cat citymap__cat--${selected.cat}`}>{CATEGORY_META[selected.cat].label}</span>
            <button type="button" className="place-card__close" onClick={() => setSelected(null)} aria-label="Close">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>
          <h3>{selected.name}</h3>
          {selected.local && (
            <p className="citymap__local" dir="auto">
              {selected.local}
            </p>
          )}
          {selected.note && <p className="citymap__note">{selected.note}</p>}
          <p className="citymap__coords">
            {selected.area ? `${selected.area} · ` : ''}
            {selected.lat.toFixed(4)}°, {selected.lon.toFixed(4)}°
          </p>
          <a
            className="spot__map"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.name}, ${data.name}`)}`}
            target="_blank"
            rel="noreferrer"
          >
            Ratings &amp; directions
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 16L16 8M9 8h7v7" />
            </svg>
          </a>
        </article>
      )}

      <p className="citymap__credit">
        Map data {data.attribution} ·{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          ODbL
        </a>
      </p>
    </div>
  );
}
