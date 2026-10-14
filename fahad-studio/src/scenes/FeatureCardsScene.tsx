// Features: with `media`, a product card (image + spec rows from items);
// without, a numbered grid of feature cards. Re-flows by orientation.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { IndexLabel } from "../components/IndexLabel";
import { KineticTitle } from "../components/KineticTitle";
import { MaskReveal } from "../components/MaskReveal";
import { ProductCard } from "../components/ProductCard";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { EASE, prog, scaled } from "../motion/easing";
import { pad2, type SceneProps } from "./types";

export const FeatureCardsScene: React.FC<SceneProps> = ({ scene, dur, index, total }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const s = (f: number) => scaled(f, b.speed);
  const items = scene.items ?? [];
  const exit = prog(frame, dur - s(14), s(14), EASE.in);
  const header = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: L.isPortrait ? "center" : "flex-end", gap: 12 * L.u }}>
      <IndexLabel index={`${pad2(index + 1)}/${pad2(total)}`} label={scene.eyebrow ?? ""} start={s(4)} fontFamily={b.font.latin} fontSize={22 * L.u} color={b.colors.muted} accent={b.colors.accent} />
      <KineticTitle text={scene.headline ?? ""} start={s(8)} stagger={s(5)} duration={s(22)} exitAt={dur - s(16)} fontFamily={b.font.display} fontSize={(L.isPortrait ? 84 : 80) * L.u} fontWeight={b.dw(800)} color={b.colors.foreground} lineHeight={1.3} align={L.isPortrait ? "center" : "right"} />
    </div>
  );
  if (scene.media) {
    const cardW = L.isPortrait ? 640 * L.u : 520 * L.u;
    return (
      <AbsoluteFill style={{ background: b.colors.background }}>
        <AbsoluteFill
          style={{
            flexDirection: L.isPortrait ? "column" : "row-reverse",
            justifyContent: "center",
            alignItems: "center",
            gap: (L.isPortrait ? 56 : 120) * L.u,
            padding: `${L.safe.top}px ${L.safe.right}px ${L.safe.bottom}px ${L.safe.left}px`,
            opacity: 1 - exit,
            translate: `0 ${-exit * 40 * L.u}px`,
          }}
        >
          {header}
          <ProductCard
            image={scene.media}
            title={scene.headlineLatin ?? ""}
            specs={items}
            start={s(12)}
            width={cardW}
            imageAspect={L.isPortrait ? 1 : 4 / 5}
            colors={{ surface: b.colors.surface, fg: b.colors.foreground, muted: b.colors.muted, line: `${b.colors.muted}44`, accent: b.colors.accent, imageBg: b.colors.background }}
            fonts={b.font}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  const cols = L.isPortrait ? 1 : Math.min(3, items.length);
  return (
    <AbsoluteFill style={{ background: b.colors.background, padding: `${L.safe.top + 60 * L.u}px ${L.safe.right}px ${L.safe.bottom}px ${L.safe.left}px`, gap: 56 * L.u }}>
      {header}
      <div dir="rtl" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 28 * L.u, opacity: 1 - exit }}>
        {items.map((it, i) => (
          <MaskReveal key={it.label} start={s(16) + i * s(6)} duration={s(26)} from="bottom">
            <div style={{ background: b.colors.surface, borderRadius: 24 * L.u, padding: 40 * L.u, display: "flex", flexDirection: "column", gap: 14 * L.u, minHeight: (L.isPortrait ? 200 : 300) * L.u }}>
              <div style={{ fontFamily: b.font.latin, fontSize: 24 * L.u, color: b.colors.accent, fontWeight: 600 }}>{it.value ?? pad2(i + 1)}</div>
              <div style={{ fontFamily: b.font.display, fontSize: 52 * L.u, fontWeight: b.dw(800), color: b.colors.foreground, lineHeight: 1.3 }}>{it.label}</div>
              {it.latin ? <div dir="ltr" style={{ fontFamily: b.font.latin, fontSize: 20 * L.u, letterSpacing: "0.2em", color: b.colors.muted, textAlign: "right" }}>{it.latin}</div> : null}
            </div>
          </MaskReveal>
        ))}
      </div>
    </AbsoluteFill>
  );
};
