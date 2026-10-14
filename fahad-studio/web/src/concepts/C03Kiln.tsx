// Concept 03 — Kiln: a ceramics shop in fired-clay colour. Big grotesk
// headline, editions instead of prices. Product image: the studio's own
// abstract vessel render (public/concepts/vessel-study.png).
import React from "react";
import { H, W } from "./util";

const clay = "#B65A35";
const cream = "#F3E9DC";
const dark = "#2A140C";

const Product: React.FC<{ name: string; meta: string; tint: string; shift: number; big?: boolean }> = ({ name, meta, tint, shift, big }) => (
  <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ background: tint, height: big ? 410 : 300, overflow: "hidden", position: "relative", borderRadius: 4 }}>
      <img src="/concepts/vessel-study.png" alt="" style={{ position: "absolute", width: "120%", left: "-10%", top: shift, filter: "sepia(.25) saturate(.9)" }} />
    </div>
    <figcaption style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: cream }}>
      <span>{name}</span>
      <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, opacity: 0.8 }}>{meta}</span>
    </figcaption>
  </figure>
);

export const C03Kiln: React.FC = () => (
  <div style={{ width: W, height: H, background: clay, color: cream, fontFamily: "Instrument Sans", position: "relative", overflow: "hidden" }}>
    <header style={{ position: "absolute", left: 56, right: 56, top: 32, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 15 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 600, fontSize: 22 }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${cream}`, display: "grid", placeItems: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: cream }} />
        </div>
        Kiln
      </div>
      <nav style={{ display: "flex", gap: 36 }}>
        <span>Shop</span>
        <span>The studio</span>
        <span>Firing notes</span>
      </nav>
      <span style={{ border: `1px solid ${cream}`, borderRadius: 99, padding: "8px 16px" }}>Bag (0)</span>
    </header>
    <h1 style={{ position: "absolute", left: 52, top: 104, margin: 0, fontWeight: 600, fontSize: 140, lineHeight: 0.88, letterSpacing: "-0.055em", color: dark, width: 900 }}>
      Made slowly,
      <br />
      fired once.
    </h1>
    <p style={{ position: "absolute", left: 56, top: 400, width: 330, fontSize: 18, lineHeight: 1.55 }}>Stoneware vessels thrown in small editions. Each piece carries the marks of the hand and the kiln.</p>
    <div style={{ position: "absolute", left: 56, top: 520, display: "flex", gap: 14 }}>
      <span style={{ background: dark, color: cream, padding: "16px 26px", borderRadius: 99, fontWeight: 500 }}>Shop the edition →</span>
      <span style={{ border: `1px solid ${cream}`, padding: "16px 26px", borderRadius: 99 }}>How we fire</span>
    </div>
    <div style={{ position: "absolute", left: 56, bottom: 40, fontFamily: "JetBrains Mono", fontSize: 12, letterSpacing: 2, opacity: 0.85 }}>EDITION 07 · STONEWARE · ASH GLAZE</div>
    <div style={{ position: "absolute", right: 56, top: 372, width: 820, display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr", gap: 18, alignItems: "end" }}>
      <Product name="Vessel I" meta="ED. OF 40" tint="#E9D9C4" shift={-40} big />
      <Product name="Vessel II" meta="ED. OF 25" tint="#8E3F22" shift={-10} />
      <Product name="Vessel III" meta="ED. OF 12" tint="#D7C3A8" shift={-24} />
    </div>
  </div>
);
