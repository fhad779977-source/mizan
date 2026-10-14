// Identity system: brand colour bars that open like a fan, hex codes, and a
// type specimen for the display and Latin faces.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { IndexLabel } from "../components/IndexLabel";
import { KineticTitle } from "../components/KineticTitle";
import { MaskReveal } from "../components/MaskReveal";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { EASE, prog, scaled } from "../motion/easing";
import { pad2, type SceneProps } from "./types";

export const PaletteScene: React.FC<SceneProps> = ({ scene, dur, index, total }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const s = (f: number) => scaled(f, b.speed);
  const swatches: Array<[string, string]> = [
    ["BACKGROUND", b.colors.background],
    ["SURFACE", b.colors.surface],
    ["SILVER", b.colors.silver],
    ["FOREGROUND", b.colors.foreground],
    ["ACCENT", b.colors.accent],
  ];
  const exit = prog(frame, dur - s(14), s(14), EASE.in);
  const barsH = L.isPortrait ? L.height * 0.36 : L.height * 0.46;
  return (
    <AbsoluteFill style={{ background: b.colors.background, padding: `${L.safe.top}px ${L.safe.right}px ${L.safe.bottom}px ${L.safe.left}px`, justifyContent: "space-between" }}>
      <IndexLabel index={`${pad2(index + 1)}/${pad2(total)}`} label={scene.eyebrow ?? "IDENTITY SYSTEM"} start={s(4)} fontFamily={b.font.latin} fontSize={22 * L.u} color={b.colors.muted} accent={b.colors.accent} />
      <div style={{ display: "flex", height: barsH, gap: 0, opacity: 1 - exit, borderRadius: 20 * L.u, overflow: "hidden", boxShadow: `0 0 0 1px ${b.colors.silver}33` }}>
        {swatches.map(([name, color], i) => {
          const p = prog(frame, s(6) + i * s(5), s(28), EASE.out);
          return (
            <div key={name} style={{ flex: 1, background: color, clipPath: `inset(${(1 - p) * 100}% 0 0 0)`, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 18 * L.u, boxSizing: "border-box" }}>
              <div dir="ltr" style={{ fontFamily: b.font.latin, fontSize: 15 * L.u, letterSpacing: "0.12em", color: i < 2 ? b.colors.silver : b.colors.background, opacity: prog(frame, s(24) + i * s(5), s(12)) }}>
                {name}
                <br />
                {color.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", opacity: 1 - exit }}>
        <KineticTitle text="Aa" mode="letters" start={s(30)} duration={s(22)} fontFamily={b.font.latin} fontSize={(L.isPortrait ? 150 : 170) * L.u} fontWeight={800} color={b.colors.foreground} lineHeight={1} />
        <MaskReveal start={s(36)} duration={s(26)} from="bottom">
          <div dir="rtl" style={{ fontFamily: b.font.display, fontWeight: 900, fontSize: (L.isPortrait ? 150 : 170) * L.u, color: b.colors.foreground, lineHeight: 1.25 }}>
            {scene.headline ?? "أبجد"}
          </div>
        </MaskReveal>
      </div>
    </AbsoluteFill>
  );
};
