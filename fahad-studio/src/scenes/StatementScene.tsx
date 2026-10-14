// Manifesto / statement: lines rise through masks one after another.
// Headline lines are split on "\n"; Latin echo and body are optional.
import React from "react";
import { AbsoluteFill } from "remotion";
import { IndexLabel } from "../components/IndexLabel";
import { KineticTitle } from "../components/KineticTitle";
import { MaskReveal } from "../components/MaskReveal";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { scaled } from "../motion/easing";
import { pad2, type SceneProps } from "./types";

export const StatementScene: React.FC<SceneProps> = ({ scene, dur, index, total }) => {
  const b = useBrand();
  const L = useLayout();
  const s = (f: number) => scaled(f, b.speed);
  const lines = (scene.headline ?? "").split("\n");
  const size = (L.isPortrait ? 150 : L.aspect > 1.5 ? 150 : 128) * L.u;
  // In an RTL flex column, flex-start is the right edge.
  const align = scene.variant === "center" ? "center" : "flex-start";
  return (
    <AbsoluteFill style={{ background: b.colors.background }}>
      <div style={{ position: "absolute", top: L.safe.top, left: L.safe.left }}>
        <IndexLabel index={`${pad2(index + 1)}/${pad2(total)}`} label={scene.eyebrow ?? ""} start={s(4)} fontFamily={b.font.latin} fontSize={22 * L.u} color={b.colors.muted} accent={b.colors.accent} />
      </div>
      <AbsoluteFill style={{ justifyContent: "center", padding: `0 ${L.safe.right}px 0 ${L.safe.left}px` }}>
        <div dir="rtl" style={{ display: "flex", flexDirection: "column", alignItems: align, gap: 6 * L.u }}>
          {lines.map((line, i) => (
            <MaskReveal key={i} start={s(6) + i * s(8)} duration={s(26)} exitAt={dur - s(16) + i * 2} from="bottom">
              <div style={{ fontFamily: b.font.display, fontWeight: 900, fontSize: size, lineHeight: 1.32, color: i === lines.length - 1 ? b.colors.foreground : b.colors.foreground, padding: `0 ${4 * L.u}px` }}>
                {line}
              </div>
            </MaskReveal>
          ))}
          {scene.headlineLatin ? (
            <KineticTitle text={scene.headlineLatin} mode="words" start={s(18) + lines.length * s(6)} stagger={s(2)} duration={s(18)} exitAt={dur - s(14)} fontFamily={b.font.latin} fontSize={28 * L.u} fontWeight={500} color={b.colors.muted} letterSpacing="0.34em" style={{ marginTop: 28 * L.u }} />
          ) : null}
          {scene.body ? (
            <KineticTitle text={scene.body} start={s(24) + lines.length * s(6)} stagger={s(2)} duration={s(18)} exitAt={dur - s(14)} fontFamily={b.font.body} fontSize={34 * L.u} fontWeight={400} color={b.colors.muted} style={{ marginTop: 12 * L.u }} />
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
