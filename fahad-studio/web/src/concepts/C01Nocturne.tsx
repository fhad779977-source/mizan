// Concept 01 — Nocturne: a late-night listening room. Condensed drama of a
// huge serif title against a record pulled from its sleeve.
import React from "react";
import { H, rng, W } from "./util";

const ink = "#0B0A09";
const warm = "#EDE6DA";
const dim = "#7D766C";
const accent = "#FF6A2B";

const Vinyl: React.FC = () => (
  <svg viewBox="0 0 400 400" width={520} height={520} aria-hidden>
    <circle cx="200" cy="200" r="198" fill="#111" />
    {Array.from({ length: 34 }, (_, i) => (
      <circle key={i} cx="200" cy="200" r={190 - i * 4} fill="none" stroke={i % 5 === 0 ? "#2a2724" : "#1b1917"} strokeWidth="1.2" />
    ))}
    <path d="M200 10 A190 190 0 0 1 380 140" stroke="rgba(255,255,255,.08)" strokeWidth="26" fill="none" />
    <circle cx="200" cy="200" r="62" fill={accent} />
    <circle cx="200" cy="200" r="5" fill={ink} />
    <text x="200" y="182" textAnchor="middle" fontFamily="Instrument Sans" fontSize="11" letterSpacing="3" fill={ink}>NOCTURNE</text>
    <text x="200" y="232" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={ink}>SIDE A · 33⅓</text>
  </svg>
);

export const C01Nocturne: React.FC = () => {
  const r = rng(7);
  const bars = Array.from({ length: 120 }, () => 0.15 + r() * 0.85);
  return (
    <div style={{ width: W, height: H, background: ink, color: warm, fontFamily: "Instrument Sans", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 70% at 78% 40%, #2a1a10 0%, transparent 70%)` }} />
      <aside style={{ position: "absolute", left: 48, top: 44, bottom: 44, width: 180, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 38 }}>Nocturne</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 15, color: dim }}>
          <span style={{ color: warm }}>Listen</span>
          <span>Sessions</span>
          <span>Archive</span>
          <span>Late shows</span>
        </nav>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: dim, lineHeight: 1.7 }}>
          NOW SPINNING
          <br />
          SESSION 04 — LOW HOURS
        </div>
      </aside>
      <div style={{ position: "absolute", left: 300, top: 70, fontFamily: "JetBrains Mono", fontSize: 12, letterSpacing: 2, color: accent }}>SESSION 04 · 6 TRACKS · 41 MIN</div>
      <h1 style={{ position: "absolute", left: 290, top: 96, margin: 0, fontFamily: "Instrument Serif", fontWeight: 400, fontSize: 200, lineHeight: 0.86, letterSpacing: "-0.03em" }}>
        Low
        <br />
        <em style={{ color: accent }}>Hours</em>
      </h1>
      <div style={{ position: "absolute", right: 0, top: 96 }}>
        <div style={{ transform: "translateX(120px)", filter: "drop-shadow(0 30px 40px rgba(0,0,0,.6))" }}>
          <Vinyl />
        </div>
      </div>
      <div style={{ position: "absolute", right: 250, top: 120, width: 400, height: 400, background: "linear-gradient(160deg,#3a2414,#120c08)", boxShadow: "0 40px 90px rgba(0,0,0,.6)" }}>
        <div style={{ position: "absolute", inset: 28, border: "1px solid rgba(237,230,218,.18)" }} />
        <div style={{ position: "absolute", left: 40, bottom: 36, fontFamily: "Instrument Serif", fontSize: 44, fontStyle: "italic" }}>Low Hours</div>
        <div style={{ position: "absolute", right: 40, top: 40, width: 120, height: 120, borderRadius: "50%", border: `1px solid ${accent}` }} />
      </div>
      <div style={{ position: "absolute", left: 300, right: 70, bottom: 150, display: "flex", alignItems: "flex-end", gap: 3, height: 70 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, height: `${b * 100}%`, background: i < 46 ? accent : "rgba(237,230,218,.22)", borderRadius: 2 }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 300, right: 70, bottom: 44, display: "grid", gridTemplateColumns: "56px 1fr 1fr 1fr 1fr 80px", alignItems: "center", gap: 24, fontSize: 15 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: warm, display: "grid", placeItems: "center" }}>
          <div style={{ width: 0, height: 0, borderLeft: `14px solid ${ink}`, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", marginLeft: 4 }} />
        </div>
        {["01 Low Hours", "02 Amber Room", "03 Night Bus", "04 After Rain"].map((t, i) => (
          <div key={t} style={{ color: i === 0 ? warm : dim, borderTop: `1px solid ${i === 0 ? accent : "rgba(237,230,218,.15)"}`, paddingTop: 12 }}>{t}</div>
        ))}
        <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: dim, textAlign: "right" }}>02:41 / 06:12</div>
      </div>
    </div>
  );
};
