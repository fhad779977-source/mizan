// Before/after: `media` as "before.png|after.png" (paths in public/), or
// `variant: "site"` to compare the concept site's wireframe and final design.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BeforeAfter } from "../components/BeforeAfter";
import { IndexLabel } from "../components/IndexLabel";
import { KineticTitle } from "../components/KineticTitle";
import { MaskReveal } from "../components/MaskReveal";
import { StudioSite } from "../components/ui/StudioSite";
import { ScaledViewport } from "../components/DeviceFrame";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { scaled, settle } from "../motion/easing";
import { pad2, type SceneProps } from "./types";

export const BeforeAfterScene: React.FC<SceneProps> = ({ scene, dur, index, total }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (f: number) => scaled(f, b.speed);
  const vw = L.isPortrait ? 393 : 1440;
  const vh = L.isPortrait ? 700 : 900;
  const boxW = L.isPortrait ? L.content.w : L.width * 0.58;
  const scale = boxW / vw;
  const t = { bg: b.colors.background, surface: b.colors.surface, fg: b.colors.foreground, muted: b.colors.muted, silver: b.colors.silver, accent: b.colors.accent, display: b.font.display, body: b.font.body, latin: b.font.latin };
  const [beforeSrc, afterSrc] = (scene.media ?? "").split("|");
  const layer = (which: "before" | "after") =>
    scene.variant === "site" || !scene.media ? (
      <StudioSite viewportWidth={vw} viewportHeight={vh} scroll={0} wireframe={which === "before"} t={t} />
    ) : (
      <Img src={staticFile(which === "before" ? beforeSrc : afterSrc)} style={{ width: vw, height: vh, objectFit: "cover" }} />
    );
  const enter = settle(frame, fps, 0, 110);
  return (
    <AbsoluteFill style={{ background: b.colors.background }}>
      <AbsoluteFill style={{ flexDirection: L.isPortrait ? "column" : "row-reverse", justifyContent: "center", alignItems: "center", gap: 72 * L.u, padding: `${L.safe.top}px ${L.safe.right}px ${L.safe.bottom}px ${L.safe.left}px` }}>
        <MaskReveal start={0} duration={s(26)} from="center">
          <div style={{ borderRadius: 18 * L.u, overflow: "hidden", boxShadow: `0 0 0 1px ${b.colors.silver}33`, scale: String(0.96 + enter * 0.04) }}>
            <ScaledViewport logicalW={vw} logicalH={vh} scale={scale}>
              <BeforeAfter width={vw} height={vh} before={layer("before")} after={layer("after")} start={s(20)} duration={dur - s(50)} hold={0.5} labels={{ before: "BEFORE", after: "AFTER" }} lineColor={b.colors.foreground} accent={b.colors.accent} font={b.font.latin} />
            </ScaledViewport>
          </div>
        </MaskReveal>
        <div style={{ display: "flex", flexDirection: "column", alignItems: L.isPortrait ? "center" : "flex-end", gap: 14 * L.u, flex: L.isPortrait ? undefined : 1 }}>
          <IndexLabel index={`${pad2(index + 1)}/${pad2(total)}`} label={scene.eyebrow ?? ""} start={s(6)} fontFamily={b.font.latin} fontSize={22 * L.u} color={b.colors.muted} accent={b.colors.accent} />
          <KineticTitle text={scene.headline ?? ""} start={s(10)} stagger={s(5)} duration={s(22)} exitAt={dur - s(16)} fontFamily={b.font.display} fontSize={(L.isPortrait ? 80 : 84) * L.u} fontWeight={b.dw(800)} color={b.colors.foreground} lineHeight={1.3} align={L.isPortrait ? "center" : "right"} />
          {scene.headlineLatin ? <KineticTitle text={scene.headlineLatin} mode="words" start={s(18)} duration={s(18)} exitAt={dur - s(14)} fontFamily={b.font.latin} fontSize={22 * L.u} fontWeight={500} color={b.colors.silver} letterSpacing="0.3em" /> : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
