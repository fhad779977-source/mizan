// Product hero: an object on a turntable (frame-driven rotation) under a
// soft key light, with the product name. Uses the abstract vessel study as
// a stand-in; replace with a real model in public/assets/models when available.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { IndexLabel } from "../components/IndexLabel";
import { KineticTitle } from "../components/KineticTitle";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { EASE, prog, scaled } from "../motion/easing";
import { Vessel } from "../three/objects";
import { StudioStage, type Vec3 } from "../three/StudioStage";
import { pad2, type SceneProps } from "./types";

export const ProductHeroScene: React.FC<SceneProps> = ({ scene, dur, index, total }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const s = (f: number) => scaled(f, b.speed);
  const p = prog(frame, 0, dur, EASE.soft);
  const offsetX = L.stacked ? 0 : 1.3;
  const radius = (L.stacked ? 12 : 8.4) - p * 1.4;
  return (
    <AbsoluteFill style={{ background: b.colors.background }}>
      <StudioStage
        width={L.width}
        height={L.height}
        background={b.colors.background}
        camera={{ position: [offsetX * 0.5 + 1.2, 1.6 + p * 0.5, radius] as Vec3, target: [offsetX, L.stacked ? 0.2 : 1.1, 0] as Vec3, fov: 28 }}
        keyLight={{ position: [-5 + p * 3, 7, 5] as Vec3, intensity: 3.2, color: "#fff4e6" }}
        rimColor="#ffffff"
        accentColor={b.colors.accent}
        accentIntensity={0.3}
      >
        <Vessel body={b.colors.surface} cap={b.colors.silver} rotationY={-0.6 + p * 1.4} />
      </StudioStage>
      <div
        style={{
          position: "absolute",
          right: L.safe.right,
          left: L.stacked ? L.safe.left : L.width * 0.55,
          bottom: L.stacked ? L.safe.bottom : undefined,
          top: L.stacked ? undefined : L.height * 0.36,
          display: "flex",
          flexDirection: "column",
          alignItems: L.stacked ? "center" : "flex-end",
          gap: 14 * L.u,
        }}
      >
        <IndexLabel index={`${pad2(index + 1)}/${pad2(total)}`} label={scene.eyebrow ?? ""} start={s(10)} fontFamily={b.font.latin} fontSize={22 * L.u} color={b.colors.muted} accent={b.colors.accent} />
        <KineticTitle text={scene.headline ?? ""} start={s(14)} stagger={s(5)} duration={s(24)} exitAt={dur - s(16)} fontFamily={b.font.display} fontSize={(L.stacked ? 120 : 110) * L.u} fontWeight={b.dw(900)} color={b.colors.foreground} lineHeight={1.3} align={L.stacked ? "center" : "right"} />
        {scene.headlineLatin ? (
          <KineticTitle text={scene.headlineLatin} mode="words" start={s(24)} duration={s(18)} exitAt={dur - s(14)} fontFamily={b.font.latin} fontSize={24 * L.u} fontWeight={600} color={b.colors.muted} letterSpacing="0.34em" />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
