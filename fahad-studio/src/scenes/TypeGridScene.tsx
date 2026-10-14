// Craft principles over a drawing construction grid. Words swap on the beat
// through vertical masks; a framed window previews the next scene's wireframe
// and becomes the match-frame for the following transition.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Hairline } from "../components/Hairline";
import { IndexLabel } from "../components/IndexLabel";
import { KineticTitle } from "../components/KineticTitle";
import { MaskReveal } from "../components/MaskReveal";
import { ScaledViewport } from "../components/DeviceFrame";
import { StudioSite } from "../components/ui/StudioSite";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { EASE, prog, scaled } from "../motion/easing";
import { parseMatchRect } from "../motion/transitions";
import { pad2, type SceneProps } from "./types";

export const TypeGridScene: React.FC<SceneProps> = ({ scene, dur, index, total }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const s = (f: number) => scaled(f, b.speed);
  const items = scene.items ?? [];
  const cols = L.isPortrait ? 4 : 8;
  const rect = parseMatchRect(scene.variant, L.isPortrait);
  const box = { x: rect.x * L.width, y: rect.y * L.height, w: rect.w * L.width, h: rect.h * L.height };
  const slot = items.length ? Math.floor((dur - s(40)) / items.length) : dur;
  const wordSize = (L.isPortrait ? 210 : 190) * L.u;
  const wordTop = L.isPortrait ? L.height * 0.22 : L.height * 0.2;
  const wordLeft = L.isPortrait ? L.safe.left : L.safe.left;
  const wordRight = L.isPortrait ? L.safe.right : L.width - box.x + 60 * L.u;
  return (
    <AbsoluteFill style={{ background: b.colors.background }}>
      <AbsoluteFill style={{ background: `radial-gradient(${L.isPortrait ? "90% 45% at 50% 30%" : "50% 70% at 30% 40%"}, ${b.colors.surface}, ${b.colors.background} 75%)` }} />
      {/* Construction grid */}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <Hairline
          key={`c${i}`}
          vertical
          start={i * 2}
          duration={s(24)}
          length={L.height}
          color={`${b.colors.silver}1c`}
          thickness={1}
          style={{ position: "absolute", top: 0, left: L.safe.left + (i * (L.width - L.safe.left - L.safe.right)) / cols }}
        />
      ))}
      {[0.2, 0.5, 0.8].map((y, i) => (
        <Hairline
          key={`r${i}`}
          start={6 + i * 3}
          duration={s(28)}
          length={L.width}
          color={`${b.colors.silver}14`}
          thickness={1}
          style={{ position: "absolute", left: 0, top: y * L.height }}
        />
      ))}
      <div style={{ position: "absolute", top: L.safe.top, left: L.safe.left }}>
        <IndexLabel index={`${pad2(index + 1)}/${pad2(total)}`} label={scene.eyebrow ?? ""} start={s(6)} fontFamily={b.font.latin} fontSize={22 * L.u} color={b.colors.muted} accent={b.colors.accent} />
      </div>
      {/* Principle words */}
      {items.map((it, i) => {
        const inAt = s(3) + i * slot;
        // The outgoing word clears its mask before the next one rises.
        const outAt = i < items.length - 1 ? inAt + slot - s(11) : undefined;
        if (frame < inAt - 2 || (outAt !== undefined && frame > outAt + s(24))) return null;
        return (
          <React.Fragment key={it.label}>
            <div style={{ position: "absolute", top: wordTop, left: wordLeft, right: wordRight, display: "flex", justifyContent: "flex-end" }}>
              <KineticTitle text={it.label} mode="line" start={inAt} duration={s(22)} exitAt={outAt} exitDuration={s(12)} fontFamily={b.font.display} fontSize={wordSize} fontWeight={b.dw(900)} color={b.colors.foreground} lineHeight={1.3} />
            </div>
            <div style={{ position: "absolute", top: wordTop + wordSize * 1.55, left: wordLeft, right: wordRight, display: "flex", justifyContent: "flex-end" }}>
              <KineticTitle text={`${it.value ?? pad2(i + 1)}  ${it.latin ?? ""}`} mode="line" start={inAt + 4} duration={s(18)} exitAt={outAt} exitDuration={s(10)} fontFamily={b.font.latin} fontSize={32 * L.u} fontWeight={600} color={b.colors.silver} letterSpacing="0.3em" />
            </div>
          </React.Fragment>
        );
      })}
      {/* Match-frame window */}
      <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: `${Math.max(1, 2 * L.u)}px solid ${b.colors.silver}`,
            borderRadius: 24,
            clipPath: `inset(0 ${(1 - prog(frame, s(12), s(30), EASE.inOut)) * 100}% 0 0)`,
          }}
        />
        <MaskReveal start={s(60)} duration={s(30)} from="bottom" style={{ position: "absolute", inset: 10 * L.u, borderRadius: 16, overflow: "hidden" }}>
          <ScaledViewport logicalW={L.isPortrait ? 393 : 1440} logicalH={L.isPortrait ? 393 * ((box.h - 20 * L.u) / (box.w - 20 * L.u)) : 1440 * ((box.h - 20 * L.u) / (box.w - 20 * L.u))} scale={(box.w - 20 * L.u) / (L.isPortrait ? 393 : 1440)}>
            <StudioSite
              viewportWidth={L.isPortrait ? 393 : 1440}
              viewportHeight={(L.isPortrait ? 393 : 1440) * ((box.h - 20 * L.u) / (box.w - 20 * L.u))}
              scroll={0}
              wireframe
              t={{ bg: b.colors.background, surface: b.colors.surface, fg: b.colors.foreground, muted: b.colors.muted, silver: b.colors.silver, accent: b.colors.accent, display: b.font.display, body: b.font.body, latin: b.font.latin }}
            />
          </ScaledViewport>
        </MaskReveal>
        <div style={{ position: "absolute", left: 0, top: -44 * L.u, opacity: prog(frame, s(40), s(16)) }}>
          <IndexLabel label="FIG. 02 — WIREFRAME" start={s(40)} fontFamily={b.font.latin} fontSize={18 * L.u} color={b.colors.muted} accent={b.colors.accent} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
