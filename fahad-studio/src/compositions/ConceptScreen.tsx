// Phone UI screens for the SALSAL concept (luxury ceramics app), rendered as
// stills and used as screen textures in 3D device scenes.
//   npx remotion still salsal-screen out.png --props='{"screen":"home"}'
// Authored at 390×844 and scaled ×3 to 1170×2532.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SALSAL as S } from "../concepts/salsal";
import { fontStack } from "../lib/fonts";

const C = S.colors;
const kufi = fontStack("kufi");
const plex = fontStack("plex-arabic");
const serif = fontStack("instrument-serif");
const inter = fontStack("inter");

const StatusBar: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div dir="ltr" style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 30px 0", fontFamily: inter, fontWeight: 600, fontSize: 15, color: dark ? C.paper : C.ink }}>
    <span>9:41</span>
    <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{ width: 17, height: 10, borderRadius: 2, background: "currentColor", opacity: 0.9 }} />
      <span style={{ width: 24, height: 11, borderRadius: 3, border: "1.5px solid currentColor", padding: 1.5 }}>
        <span style={{ display: "block", width: "80%", height: "100%", background: "currentColor", borderRadius: 1 }} />
      </span>
    </span>
  </div>
);

const TopBar: React.FC<{ title?: string; back?: boolean }> = ({ title, back }) => (
  <div dir="rtl" style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px" }}>
    <span style={{ width: 40, height: 40, borderRadius: 20, border: `1px solid ${C.line}`, display: "grid", placeItems: "center", fontFamily: inter, fontSize: 18, color: C.ink }}>{back ? "→" : "≡"}</span>
    <span style={{ fontFamily: kufi, fontWeight: 800, fontSize: title ? 17 : 21, color: C.ink, letterSpacing: 0 }}>{title ?? S.brand.ar}</span>
    <span style={{ width: 40, height: 40, borderRadius: 20, border: `1px solid ${C.line}`, display: "grid", placeItems: "center", position: "relative" }}>
      <span style={{ width: 14, height: 12, border: `1.6px solid ${C.ink}`, borderTop: "none", borderRadius: "0 0 4px 4px", marginTop: 4 }} />
      <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: 4, background: C.clay }} />
    </span>
  </div>
);

const TabBar: React.FC<{ active: number }> = ({ active }) => (
  <div dir="rtl" style={{ position: "absolute", left: 16, right: 16, bottom: 26, height: 66, borderRadius: 33, background: C.ink, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 10px" }}>
    {S.tabs.map((t, i) => (
      <span key={t} style={{ fontFamily: plex, fontWeight: i === active ? 600 : 400, fontSize: 13, color: i === active ? C.ink : `${C.paper}99`, background: i === active ? C.bone : "transparent", padding: "9px 14px", borderRadius: 22 }}>{t}</span>
    ))}
  </div>
);

const Home: React.FC = () => (
  <>
    <StatusBar />
    <TopBar />
    <div dir="rtl" style={{ padding: "18px 22px 0" }}>
      <div style={{ fontFamily: plex, fontSize: 12.5, color: C.clay, fontWeight: 600 }}>{S.home.eyebrow}</div>
      <div style={{ fontFamily: kufi, fontWeight: 800, fontSize: 38, lineHeight: 1.32, color: C.ink, marginTop: 10, whiteSpace: "pre-line" }}>{S.home.title}</div>
      <div style={{ fontFamily: plex, fontSize: 15, lineHeight: 1.7, color: C.muted, marginTop: 10, maxWidth: 300 }}>{S.home.body}</div>
    </div>
    <div style={{ position: "relative", margin: "22px 22px 0", height: 360, borderRadius: 28, overflow: "hidden", background: C.bone }}>
      <Img src={staticFile(S.home.hero)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 62%", scale: "1.25" }} />
      <div dir="rtl" style={{ position: "absolute", right: 16, bottom: 16, left: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: plex, fontWeight: 600, fontSize: 14, color: C.ink, background: `${C.paper}d9`, padding: "8px 14px", borderRadius: 18 }}>{S.home.heroName}</span>
        <span dir="ltr" style={{ fontFamily: serif, fontStyle: "italic", fontSize: 18, color: C.ink }}>No. 01</span>
      </div>
    </div>
    <div dir="rtl" style={{ margin: "18px 22px 0", height: 54, borderRadius: 27, background: C.clay, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", color: C.paper, fontFamily: plex, fontWeight: 600, fontSize: 16 }}>
      <span>{S.home.cta}</span>
      <span style={{ fontFamily: inter }}>←</span>
    </div>
    <TabBar active={0} />
  </>
);

const Product: React.FC = () => {
  const p = S.products.find((x) => x.id === S.product.id)!;
  return (
    <>
      <div style={{ position: "absolute", inset: "0 0 auto 0", height: 470, background: C.bone, overflow: "hidden" }}>
        <Img src={staticFile(p.image)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 60%", scale: "1.15" }} />
      </div>
      <div style={{ position: "relative" }}>
        <StatusBar />
        <TopBar back title=" " />
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 440, left: 0, right: 0, bottom: 0, background: C.paper, borderRadius: "30px 30px 0 0", padding: "26px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div dir="ltr" style={{ fontFamily: inter, fontSize: 11, letterSpacing: "0.22em", color: C.muted, textAlign: "right" }}>{p.latin}</div>
            <div style={{ fontFamily: kufi, fontWeight: 800, fontSize: 28, color: C.ink, marginTop: 4 }}>{p.name}</div>
          </div>
          <div style={{ fontFamily: plex, fontWeight: 600, fontSize: 20, color: C.ink }}>
            {p.price} <span style={{ fontSize: 13, color: C.muted }}>{S.product.currency}</span>
          </div>
        </div>
        <div style={{ fontFamily: plex, fontSize: 14.5, lineHeight: 1.75, color: C.muted, marginTop: 12 }}>{S.product.story}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          {S.product.specs.map((s) => (
            <div key={s.k} style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 16, padding: "10px 12px" }}>
              <div style={{ fontFamily: plex, fontSize: 11.5, color: C.muted }}>{s.k}</div>
              <div style={{ fontFamily: plex, fontWeight: 600, fontSize: 14, color: C.ink, marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18, alignItems: "center" }}>
          {S.product.swatches.map((c, i) => (
            <span key={c} style={{ width: 30, height: 30, borderRadius: 15, background: c, outline: i === 0 ? `1.5px solid ${C.ink}` : "none", outlineOffset: 3, border: `1px solid ${C.line}` }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 34, height: 58, borderRadius: 29, background: C.ink, color: C.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: plex, fontWeight: 600, fontSize: 16 }}>{S.product.cta}</div>
      </div>
    </>
  );
};

const Collection: React.FC = () => (
  <>
    <StatusBar />
    <TopBar title={S.collection.title} />
    <div dir="rtl" style={{ display: "flex", gap: 8, padding: "10px 22px 0" }}>
      {S.collection.chips.map((c, i) => (
        <span key={c} style={{ fontFamily: plex, fontSize: 13.5, fontWeight: i === 0 ? 600 : 400, padding: "8px 16px", borderRadius: 20, background: i === 0 ? C.ink : "transparent", color: i === 0 ? C.paper : C.ink, border: `1px solid ${i === 0 ? C.ink : C.line}` }}>{c}</span>
      ))}
    </div>
    <div dir="rtl" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "18px 22px 0" }}>
      {S.products.map((p, i) => (
        <div key={p.id}>
          <div style={{ height: i % 3 === 0 ? 236 : 196, borderRadius: 22, overflow: "hidden", background: C.bone }}>
            <Img src={staticFile(p.image)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 62%", scale: "1.35" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8, padding: "0 4px" }}>
            <span style={{ fontFamily: plex, fontWeight: 600, fontSize: 14, color: C.ink }}>{p.name}</span>
            <span style={{ fontFamily: plex, fontSize: 12.5, color: C.muted }}>{p.price}</span>
          </div>
        </div>
      ))}
    </div>
    <TabBar active={1} />
  </>
);

export const ConceptScreen: React.FC<{ screen?: "home" | "product" | "collection" }> = ({ screen = "home" }) => (
  <AbsoluteFill style={{ background: C.paper }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 390, height: 844, transform: "scale(3)", transformOrigin: "0 0", overflow: "hidden", background: C.paper }}>
      {screen === "home" ? <Home /> : screen === "product" ? <Product /> : <Collection />}
    </div>
  </AbsoluteFill>
);
