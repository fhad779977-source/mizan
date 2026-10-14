// Concept 02 — Herbarium: an editorial plant archive. Paper, ink and
// specimen plates drawn procedurally in SVG.
import React from "react";
import { H, rng, W } from "./util";

const paper = "#EEE7D8";
const ink = "#1F2A1E";
const rust = "#9C3B22";

const Specimen: React.FC<{ seed: number; color: string }> = ({ seed, color }) => {
  const r = rng(seed);
  const leaves = Array.from({ length: 9 }, (_, i) => ({ t: 0.12 + i * 0.095, side: i % 2 ? 1 : -1, len: 58 + r() * 34, rot: 28 + r() * 30 }));
  const curve = 18 + r() * 24;
  return (
    <svg viewBox="0 0 200 300" width="100%" height="100%" aria-hidden>
      <path d={`M100 290 C ${100 + curve} 200, ${100 - curve} 120, 104 18`} stroke={color} strokeWidth="1.6" fill="none" />
      {leaves.map((l, i) => {
        const y = 290 - l.t * 272;
        const x = 100 + Math.sin(l.t * 3) * curve * 0.4;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${l.side * l.rot - 90 * (l.side > 0 ? 0 : 0)})`}>
            <ellipse cx={l.side * l.len * 0.55} cy={-4} rx={l.len * 0.55} ry={l.len * 0.2} fill="none" stroke={color} strokeWidth="1.3" transform={`rotate(${-l.side * 20})`} />
            <line x1="0" y1="0" x2={l.side * l.len} y2={-8} stroke={color} strokeWidth="0.6" opacity="0.6" />
          </g>
        );
      })}
    </svg>
  );
};

const plates = [
  { n: "Pl. 041", name: "Folium tenue", note: "Collected after rain, north slope." },
  { n: "Pl. 042", name: "Viridis lenta", note: "Slow growth, pale underside." },
  { n: "Pl. 043", name: "Ramus quietus", note: "Single stem, alternating leaves." },
];

export const C02Herbarium: React.FC = () => (
  <div style={{ width: W, height: H, background: paper, color: ink, fontFamily: "Instrument Sans", position: "relative", overflow: "hidden" }}>
    <header style={{ position: "absolute", left: 64, right: 64, top: 36, display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `1px solid ${ink}`, paddingBottom: 18 }}>
      <div style={{ fontFamily: "Instrument Serif", fontSize: 30, letterSpacing: "0.32em" }}>HERBARIUM</div>
      <nav style={{ display: "flex", gap: 34, fontSize: 14 }}>
        <span>Plates</span>
        <span>Families</span>
        <span>Field notes</span>
        <span style={{ color: rust }}>No. 12 — Autumn</span>
      </nav>
    </header>
    <div style={{ position: "absolute", left: 64, top: 118, width: 380 }}>
      <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: rust, letterSpacing: 2 }}>AN ARCHIVE OF QUIET PLANTS</div>
      <h1 style={{ margin: "18px 0 0", fontFamily: "Instrument Serif", fontWeight: 400, fontSize: 92, lineHeight: 0.95 }}>
        Small leaves,
        <br />
        <em>long memory.</em>
      </h1>
      <p style={{ marginTop: 26, fontSize: 17, lineHeight: 1.6, maxWidth: 330, color: "#3f4a3d" }}>Pressed, catalogued and drawn by hand. Each plate keeps the place, the light and the season it was found in.</p>
      <div style={{ marginTop: 26, display: "flex", border: `1px solid ${ink}`, height: 48, alignItems: "center", padding: "0 16px", width: 330, justifyContent: "space-between", fontSize: 14, color: "#5d665b" }}>
        Search the plates <span style={{ fontFamily: "JetBrains Mono" }}>⌘K</span>
      </div>
    </div>
    <div style={{ position: "absolute", left: 500, right: 64, top: 118, bottom: 56, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
      {plates.map((p, i) => (
        <figure key={p.n} style={{ margin: 0, background: "#F7F2E7", border: "1px solid rgba(31,42,30,.18)", padding: 22, display: "flex", flexDirection: "column", transform: `translateY(${i === 1 ? 40 : 0}px)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono", fontSize: 11 }}>
            <span>{p.n}</span>
            <span style={{ color: rust }}>●</span>
          </div>
          <div style={{ flex: 1, padding: "14px 6px" }}>
            <Specimen seed={i * 31 + 5} color={i === 1 ? rust : ink} />
          </div>
          <figcaption style={{ borderTop: "1px solid rgba(31,42,30,.2)", paddingTop: 12 }}>
            <div style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 26 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: "#5d665b", marginTop: 4 }}>{p.note}</div>
          </figcaption>
        </figure>
      ))}
    </div>
  </div>
);
