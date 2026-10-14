// 3D: the FAHAD monogram in brushed metal on a plinth. The camera dollies in
// on an arc while the key light sweeps across the bevels — light reveals form.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { IndexLabel } from "../components/IndexLabel";
import { KineticTitle } from "../components/KineticTitle";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { EASE, prog, scaled } from "../motion/easing";
import { Monogram, Plinth } from "../three/objects";
import { StudioStage, type Vec3 } from "../three/StudioStage";
import { pad2, type SceneProps } from "./types";

export const ThreeObjectScene: React.FC<SceneProps> = ({ scene, dur, index, total }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const s = (f: number) => scaled(f, b.speed);
  const p = prog(frame, 0, dur, EASE.inOut);
  const sweep = prog(frame, s(6), dur - s(20), EASE.soft);
  const angle = (-34 + p * 46) * (Math.PI / 180);
  const radius = L.stacked ? 11.5 - p * 2.2 : 9.4 - p * 1.6;
  const height = 1.3 + p * 1.0;
  // Landscape: aim right of the object so it sits left of frame, text on the right.
  const offsetX = L.stacked ? 0 : 1.55;
  const camera = {
    position: [Math.sin(angle) * radius + offsetX * 0.6, height, Math.cos(angle) * radius] as Vec3,
    target: [offsetX, L.stacked ? 0.45 : 1.25, 0] as Vec3,
    fov: L.stacked ? 30 : 28,
  };
  const keyLight = { position: [-7 + sweep * 13, 6.5, 4.5] as Vec3, intensity: 5.2, color: "#fff6ea" };
  return (
    <AbsoluteFill style={{ background: b.colors.background }}>
      <StudioStage
        width={L.width}
        height={L.height}
        background={b.colors.background}
        camera={camera}
        keyLight={keyLight}
        rimColor={b.colors.silver}
        accentColor={b.colors.accent}
        accentIntensity={1.1}
      >
        <Plinth color="#0d0d10" edge={b.colors.silver} />
        <Monogram color={b.colors.silver} position={[0, 0.14, 0]} />
      </StudioStage>
      <div
        style={{
          position: "absolute",
          right: L.safe.right,
          bottom: L.stacked ? L.safe.bottom : undefined,
          top: L.stacked ? undefined : L.height * 0.38,
          left: L.stacked ? L.safe.left : L.width * 0.56,
          display: "flex",
          flexDirection: "column",
          alignItems: L.stacked ? "center" : "flex-end",
          gap: 16 * L.u,
        }}
      >
        <IndexLabel index={`${pad2(index + 1)}/${pad2(total)}`} label={scene.eyebrow ?? ""} start={s(14)} fontFamily={b.font.latin} fontSize={22 * L.u} color={b.colors.muted} accent={b.colors.accent} />
        <KineticTitle text={scene.headline ?? ""} start={s(18)} stagger={s(6)} duration={s(26)} exitAt={dur - s(18)} fontFamily={b.font.display} fontSize={(L.stacked ? 110 : 120) * L.u} fontWeight={900} color={b.colors.foreground} lineHeight={1.3} align={L.stacked ? "center" : "right"} />
        {scene.headlineLatin ? (
          <KineticTitle text={scene.headlineLatin} mode="words" start={s(28)} duration={s(18)} exitAt={dur - s(16)} fontFamily={b.font.latin} fontSize={24 * L.u} fontWeight={500} color={b.colors.silver} letterSpacing="0.34em" />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
