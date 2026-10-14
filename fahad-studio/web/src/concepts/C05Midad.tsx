// Concept 05 — مِداد (Midad): an Arabic type foundry specimen. RTL layout,
// giant Kufi display, whole words only (letters shown in isolation only in
// the glyph table, as a specimen does).
import React from "react";
import { H, W } from "./util";

const paper = "#F4F1EA";
const ink = "#111111";
const red = "#D2321E";
const grey = "#8A857C";

export const C05Midad: React.FC = () => (
  <div dir="rtl" style={{ width: W, height: H, background: paper, color: ink, fontFamily: "'Plex Arabic', 'Instrument Sans', sans-serif", position: "relative", overflow: "hidden" }}>
    <header style={{ position: "absolute", right: 56, left: 56, top: 34, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 16 }}>
      <div style={{ fontFamily: "'Kufi Display'", fontWeight: 900, fontSize: 30 }}>مِداد</div>
      <nav style={{ display: "flex", gap: 34 }}>
        <span>الخطوط</span>
        <span>جرّب الخط</span>
        <span>المختبر</span>
        <span style={{ color: red }}>الإصدار ١٫٠</span>
      </nav>
      <span dir="ltr" style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: grey }}>MIDAD TYPE · CONCEPT 05</span>
    </header>
    <div style={{ position: "absolute", right: 48, top: 70, fontFamily: "'Kufi Display'", fontWeight: 900, fontSize: 330, lineHeight: 1.25, letterSpacing: 0 }}>مِداد</div>
    <div style={{ position: "absolute", right: 60, top: 520, width: 640 }}>
      <div style={{ fontFamily: "'Kufi Display'", fontWeight: 800, fontSize: 56, lineHeight: 1.5 }}>خطٌّ يُكتب ليبقى</div>
      <p style={{ fontSize: 20, lineHeight: 1.9, color: "#3b3833", margin: "10px 0 0" }}>عائلة عربية بقطع حادة وعدادات مفتوحة، صُممت للعناوين الكبيرة والشاشات الصغيرة معًا. تقرأ بوضوح في 12 نقطة، وتتحدث بثقة في 300.</p>
    </div>
    <div style={{ position: "absolute", left: 56, top: 120, width: 520, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${ink}` }}>
      {"ا ب ج د ه و ز ح ط ي ك ل".split(" ").map((g, i) => (
        <div key={g} style={{ height: 112, display: "grid", placeItems: "center", borderLeft: i % 4 === 3 ? "none" : `1px solid ${ink}`, borderBottom: i < 8 ? `1px solid ${ink}` : "none", background: i === 5 ? ink : "transparent", color: i === 5 ? paper : ink, fontFamily: "'Kufi Display'", fontWeight: 800, fontSize: 52, position: "relative" }}>
          {g}
          <span dir="ltr" style={{ position: "absolute", left: 8, bottom: 6, fontFamily: "JetBrains Mono", fontSize: 10, color: i === 5 ? paper : grey }}>{String(i + 1).padStart(2, "0")}</span>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 56, bottom: 52, width: 520, display: "flex", flexDirection: "column", gap: 10 }}>
      {[
        { label: "أسود — عرض", f: "'Kufi Display'", w: 900 },
        { label: "عريض — عرض", f: "'Kufi Display'", w: 800 },
        { label: "متوسط — نص", f: "'Plex Arabic'", w: 600 },
        { label: "عادي — نص", f: "'Plex Arabic'", w: 400 },
      ].map((s, i) => (
        <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `1px solid ${i === 0 ? red : "rgba(17,17,17,.2)"}`, paddingTop: 8 }}>
          <span style={{ fontFamily: s.f, fontWeight: s.w, fontSize: 28 }}>حبرٌ على ورق</span>
          <span style={{ fontSize: 13, color: grey }}>{s.label}</span>
        </div>
      ))}
    </div>
  </div>
);
