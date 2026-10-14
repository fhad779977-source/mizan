// An original concept website for FAHAD STUDIO, used as the "digital
// interface" in showcases. It is a real responsive layout (mobile < 700px,
// desktop otherwise) rendered at its logical viewport size, plus a wireframe
// state for before/after reveals. No client names, metrics or contact data.
import React from "react";

export type SiteTokens = {
  bg: string;
  surface: string;
  fg: string;
  muted: string;
  silver: string;
  accent: string;
  display: string;
  body: string;
  latin: string;
};

type Props = {
  viewportWidth: number;
  viewportHeight: number;
  scroll: number;
  wireframe?: boolean;
  t: SiteTokens;
};

const Skeleton: React.FC<{ w: string | number; h: number; c: string; r?: number; style?: React.CSSProperties }> = ({ w, h, c, r = 6, style }) => (
  <div style={{ width: w, height: h, background: c, borderRadius: r, ...style }} />
);

const ConceptVisual: React.FC<{ kind: number; t: SiteTokens; wire: boolean }> = ({ kind, t, wire }) => {
  if (wire) {
    return (
      <div style={{ position: "absolute", inset: 0, border: `2px dashed ${t.muted}55`, borderRadius: 14 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <line x1="0" y1="0" x2="100" y2="100" stroke={`${t.muted}55`} vectorEffect="non-scaling-stroke" />
          <line x1="100" y1="0" x2="0" y2="100" stroke={`${t.muted}55`} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    );
  }
  const visuals = [
    // Concentric silver arcs
    <div key="a" style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 70% 120%, ${t.silver}55 0 22%, transparent 22.4% 30%, ${t.silver}33 30.4% 38%, transparent 38.4% 46%, ${t.silver}22 46.4% 54%, transparent 54.4%), ${t.surface}` }} />,
    // Accent slab on dark field
    <div key="b" style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${t.bg} 0 48%, ${t.accent} 48% 62%, ${t.surface} 62%)` }} />,
    // Tonal grid
    <div key="c" style={{ position: "absolute", inset: 0, backgroundColor: t.fg, backgroundImage: `linear-gradient(${t.bg}22 1px, transparent 1px), linear-gradient(90deg, ${t.bg}22 1px, transparent 1px)`, backgroundSize: "24px 24px" }}>
      <div style={{ position: "absolute", left: "18%", top: "22%", width: "40%", height: "56%", background: t.bg, borderRadius: 999 }} />
    </div>,
  ];
  return <div style={{ position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden" }}>{visuals[kind % visuals.length]}</div>;
};

export const SITE_CONTENT = {
  nav: ["الأعمال", "المنهج", "الاستوديو"],
  eyebrow: "DIGITAL CRAFT STUDIO",
  hero: "نصنع حضورًا رقميًا\nيُرى ويُتذكّر",
  sub: "مواقع، هويات متحركة، وتجارب ثلاثية الأبعاد تُبنى بعناية.",
  cta: "استكشف الأعمال",
  concepts: [
    { title: "واجهة متجر", latin: "Concept 01 — Commerce" },
    { title: "هوية متحركة", latin: "Concept 02 — Identity" },
    { title: "تجربة تفاعلية", latin: "Concept 03 — Interactive" },
  ],
  process: [
    { n: "01", ar: "اكتشاف", en: "Discover" },
    { n: "02", ar: "تصميم", en: "Design" },
    { n: "03", ar: "حركة", en: "Motion" },
    { n: "04", ar: "تسليم", en: "Deliver" },
  ],
};

/** Total scrollable height of the page for a given viewport width. */
export const siteHeight = (viewportWidth: number) => (viewportWidth < 700 ? 2350 : 2050);

export const StudioSite: React.FC<Props> = ({ viewportWidth: vw, viewportHeight: vh, scroll, wireframe = false, t }) => {
  const mobile = vw < 700;
  const pad = mobile ? 24 : 72;
  const wire = wireframe;
  const ink = wire ? `${t.muted}66` : t.fg;
  const line = wire ? `${t.muted}44` : `${t.fg}1f`;
  const C = SITE_CONTENT;

  const txt = (content: string, style: React.CSSProperties, skeletonH: number, skeletonW: string | number = "70%") =>
    wire ? <Skeleton w={skeletonW} h={skeletonH} c={`${t.muted}40`} /> : <div style={style}>{content}</div>;

  return (
    <div style={{ width: vw, height: vh, overflow: "hidden", background: wire ? "#141417" : t.bg, position: "relative" }}>
      <div dir="rtl" style={{ translate: `0 ${-scroll}px`, fontFamily: t.body, color: t.fg }}>
        {/* NAV */}
        <div style={{ height: mobile ? 72 : 88, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${pad}px`, borderBottom: `1px solid ${line}` }}>
          {wire ? (
            <Skeleton w={110} h={22} c={`${t.muted}55`} />
          ) : (
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: t.latin, fontWeight: 800, letterSpacing: "0.08em", fontSize: 22 }}>FAHAD</span>
              <span style={{ fontFamily: t.display, fontWeight: 600, fontSize: 18, color: t.muted }}>فهد</span>
            </div>
          )}
          {mobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ width: 26, height: 2, background: ink }} />
              <div style={{ width: 18, height: 2, background: ink }} />
            </div>
          ) : (
            <div style={{ display: "flex", gap: 40, fontSize: 17 }}>
              {C.nav.map((n) => (wire ? <Skeleton key={n} w={64} h={14} c={`${t.muted}40`} /> : <span key={n} style={{ color: t.muted }}>{n}</span>))}
            </div>
          )}
        </div>

        {/* HERO */}
        <div style={{ padding: `${mobile ? 48 : 96}px ${pad}px ${mobile ? 40 : 72}px`, display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 36 : 64, alignItems: mobile ? "stretch" : "center" }}>
          <div style={{ flex: 1.15, display: "flex", flexDirection: "column", gap: mobile ? 18 : 26 }}>
            {txt(C.eyebrow, { fontFamily: t.latin, fontSize: 13, letterSpacing: "0.28em", color: t.accent, fontWeight: 600, direction: "ltr", textAlign: "right" }, 12, 160)}
            {wire ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Skeleton w="92%" h={mobile ? 40 : 60} c={`${t.muted}55`} />
                <Skeleton w="70%" h={mobile ? 40 : 60} c={`${t.muted}55`} />
              </div>
            ) : (
              <div style={{ fontFamily: t.display, fontWeight: 800, fontSize: mobile ? 36 : 66, lineHeight: 1.3, whiteSpace: "pre-line" }}>{C.hero}</div>
            )}
            {txt(C.sub, { fontSize: mobile ? 17 : 20, color: t.muted, lineHeight: 1.7, maxWidth: 520 }, 16, "80%")}
            <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
              <div style={{ padding: "14px 26px", borderRadius: 999, background: wire ? `${t.muted}44` : t.fg, color: t.bg, fontWeight: 600, fontSize: 16, minWidth: 150, height: 50, boxSizing: "border-box", textAlign: "center" }}>
                {wire ? null : C.cta}
              </div>
              <div style={{ width: 50, height: 50, borderRadius: 999, border: `1px solid ${wire ? `${t.muted}55` : `${t.fg}40`}`, display: "flex", alignItems: "center", justifyContent: "center", color: t.fg, fontFamily: t.latin }}>
                {wire ? null : "↙"}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", height: mobile ? 300 : 440, borderRadius: 14, overflow: "hidden", background: wire ? "transparent" : t.surface }}>
            {wire ? (
              <ConceptVisual kind={0} t={t} wire />
            ) : (
              <>
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 20% 0%, ${t.silver}26, transparent 60%)` }} />
                <div style={{ position: "absolute", right: "14%", bottom: "-18%", width: "64%", aspectRatio: "1", borderRadius: "50%", border: `1px solid ${t.silver}66` }} />
                <div style={{ position: "absolute", right: "24%", bottom: "-6%", width: "44%", aspectRatio: "1", borderRadius: "50%", border: `1px solid ${t.silver}40` }} />
                <div style={{ position: "absolute", left: "12%", top: "16%", width: 96, height: 96, background: t.accent, borderRadius: 8 }} />
                <div style={{ position: "absolute", left: 24, bottom: 20, fontFamily: t.latin, fontSize: 12, letterSpacing: "0.2em", color: t.muted, direction: "ltr" }}>FIG. 01 — FORM STUDY</div>
              </>
            )}
          </div>
        </div>

        {/* CONCEPTS */}
        <div style={{ padding: `${mobile ? 24 : 48}px ${pad}px`, borderTop: `1px solid ${line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
            {txt("مفاهيم مختارة", { fontFamily: t.display, fontWeight: 700, fontSize: mobile ? 26 : 34 }, 26, 200)}
            {txt("SELECTED CONCEPTS", { fontFamily: t.latin, fontSize: 12, letterSpacing: "0.24em", color: t.muted, direction: "ltr" }, 12, 140)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.3fr 1fr 1fr", gap: mobile ? 22 : 28 }}>
            {C.concepts.map((c, i) => (
              <div key={c.latin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ position: "relative", height: mobile ? 220 : 340, borderRadius: 14 }}>
                  <ConceptVisual kind={i} t={t} wire={wire} />
                </div>
                {txt(c.title, { fontFamily: t.display, fontWeight: 600, fontSize: 20 }, 18, "50%")}
                {txt(c.latin, { fontFamily: t.latin, fontSize: 13, color: t.muted, letterSpacing: "0.06em", direction: "ltr", textAlign: "right" }, 12, "40%")}
              </div>
            ))}
          </div>
        </div>

        {/* PROCESS */}
        <div style={{ padding: `${mobile ? 40 : 72}px ${pad}px`, display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: mobile ? 28 : 40, borderTop: `1px solid ${line}` }}>
          {C.process.map((p) => (
            <div key={p.n} style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: `2px solid ${wire ? `${t.muted}55` : t.fg}`, paddingTop: 18 }}>
              {txt(p.n, { fontFamily: t.latin, fontSize: 14, color: t.accent, fontWeight: 600 }, 12, 28)}
              {txt(p.ar, { fontFamily: t.display, fontSize: mobile ? 22 : 28, fontWeight: 700 }, 22, "60%")}
              {txt(p.en, { fontFamily: t.latin, fontSize: 13, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", direction: "ltr", textAlign: "right" }, 10, "40%")}
            </div>
          ))}
        </div>

        {/* FOOTER WORDMARK */}
        <div style={{ padding: `${mobile ? 24 : 40}px ${pad}px 64px`, borderTop: `1px solid ${line}` }}>
          {wire ? (
            <Skeleton w="100%" h={mobile ? 80 : 180} c={`${t.muted}33`} />
          ) : (
            <div dir="ltr" style={{ fontFamily: t.latin, fontWeight: 800, fontSize: mobile ? 92 : 260, letterSpacing: "-0.04em", lineHeight: 0.9, color: t.fg }}>FAHAD</div>
          )}
        </div>
      </div>
    </div>
  );
};
