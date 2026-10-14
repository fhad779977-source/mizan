// Concept 04 — Meridian: an ocean-conditions dashboard. Precise mono
// numerals, contour field and tide curve. All values are sample data.
import React from "react";
import { H, rng, W } from "./util";

const navy = "#07162B";
const line = "#2B4A73";
const text = "#D8E4F2";
const aqua = "#59E1C7";
const dim = "#7F96B3";

const series = (seed: number, n: number) => {
  const r = rng(seed);
  let v = 0.5;
  return Array.from({ length: n }, () => (v = Math.min(0.95, Math.max(0.08, v + (r() - 0.5) * 0.22))));
};

export const C04Meridian: React.FC = () => {
  const s = series(11, 56);
  const pts = s.map((v, i) => `${(i / (s.length - 1)) * 820},${200 - v * 180}`).join(" ");
  const tide = Array.from({ length: 121 }, (_, i) => `${(i / 120) * 380},${70 - Math.sin((i / 120) * Math.PI * 4) * 46}`).join(" ");
  return (
    <div style={{ width: W, height: H, background: navy, color: text, fontFamily: "Instrument Sans", position: "relative", overflow: "hidden" }}>
      <svg width="760" height="760" viewBox="0 0 760 760" style={{ position: "absolute", right: -160, top: -120, opacity: 0.55 }} aria-hidden>
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse key={i} cx={380 + Math.sin(i) * 18} cy={380 + Math.cos(i * 0.7) * 14} rx={30 + i * 22} ry={22 + i * 19} fill="none" stroke={i === 9 ? aqua : line} strokeWidth={i === 9 ? 1.5 : 1} transform={`rotate(${i * 4} 380 380)`} />
        ))}
      </svg>
      <header style={{ position: "absolute", left: 56, right: 56, top: 36, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>Meridian</span>
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: dim }}>STATION 07 · NORTH SHELF · SAMPLE DATA</span>
        </div>
        <div style={{ display: "flex", gap: 8, fontFamily: "JetBrains Mono", fontSize: 12 }}>
          {["24H", "7D", "30D"].map((t, i) => (
            <span key={t} style={{ padding: "8px 12px", border: `1px solid ${i === 1 ? aqua : line}`, color: i === 1 ? aqua : dim, borderRadius: 4 }}>{t}</span>
          ))}
        </div>
      </header>
      <div style={{ position: "absolute", left: 56, top: 128 }}>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: aqua, letterSpacing: 2 }}>SEA SURFACE</div>
        <div style={{ fontSize: 200, fontWeight: 400, letterSpacing: "-0.06em", lineHeight: 0.9, marginTop: 6 }}>
          14.2<span style={{ color: dim, fontSize: 120 }}>°</span>
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 18, fontFamily: "JetBrains Mono", fontSize: 14, color: dim }}>
          <span>SWELL 2.4 M</span>
          <span>PERIOD 11 S</span>
          <span>WIND NW 14 KN</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 56, bottom: 56, width: 860, height: 250, border: `1px solid ${line}`, borderRadius: 8, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: dim }}>
          <span>Wave height — 7 days</span>
          <span style={{ fontFamily: "JetBrains Mono" }}>M</span>
        </div>
        <svg viewBox="0 0 820 200" width="820" height="200" aria-hidden>
          {[40, 80, 120, 160].map((y) => (
            <line key={y} x1="0" x2="820" y1={y} y2={y} stroke={line} strokeDasharray="2 6" />
          ))}
          <polygon points={`0,200 ${pts} 820,200`} fill="rgba(89,225,199,.12)" />
          <polyline points={pts} fill="none" stroke={aqua} strokeWidth="2" />
          <circle cx={(40 / 55) * 820} cy={200 - s[40] * 180} r="6" fill={navy} stroke={aqua} strokeWidth="2" />
        </svg>
      </div>
      <div style={{ position: "absolute", right: 56, bottom: 56, width: 440, height: 250, display: "grid", gridTemplateRows: "1fr 1fr", gap: 16 }}>
        <div style={{ border: `1px solid ${line}`, borderRadius: 8, padding: 18 }}>
          <div style={{ fontSize: 13, color: dim }}>Tide</div>
          <svg viewBox="0 0 380 120" width="380" height="70" aria-hidden>
            <polyline points={tide} fill="none" stroke={text} strokeWidth="1.5" />
          </svg>
        </div>
        <div style={{ border: `1px solid ${line}`, borderRadius: 8, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 13, color: dim }}>Visibility</div>
            <div style={{ fontSize: 44, letterSpacing: "-0.03em" }}>Good</div>
          </div>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: aqua }}>UPDATED 06:00</div>
        </div>
      </div>
    </div>
  );
};
