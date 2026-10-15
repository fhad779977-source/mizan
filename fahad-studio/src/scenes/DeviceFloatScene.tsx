// 3D UI showcase: phones carrying real screen stills float in a soft studio,
// arranged as a fan (centre phone forward). The camera pulls back from the
// centre screen and drifts around the group. Screens come from scene.media
// ("a.png|b.png|c.png", centre = first). Optional real 3D product beside
// the phones: variant "ceramic:<piece>:<glaze>".
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { EASE, prog } from "../motion/easing";
import { Ceramic, type CeramicPiece, type Glaze } from "../three/ceramics";
import { StudioStage, useEnvMap } from "../three/StudioStage";
import type { SceneProps } from "./types";

const PHONE = { w: 0.78, h: 1.69, d: 0.085, r: 0.11 };

const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 24);
  // Map UVs to 0..1 over the rectangle so the screen image fills it.
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  return g;
};

const useImageTexture = (src: string) => {
  const gl = useThree((s) => s.gl);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender(`screen texture ${src}`));
  useEffect(() => {
    new THREE.TextureLoader().load(
      staticFile(src),
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = gl.capabilities.getMaxAnisotropy();
        setTex(t);
      },
      undefined,
      () => continueRender(handle),
    );
  }, [src, gl, handle]);
  // Release the frame only after the textured material has been committed.
  // ThreeCanvas only draws on frame changes, so draw once more with the
  // texture before letting Remotion capture the frame.
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    if (!tex) return;
    advance(performance.now());
    continueRender(handle);
  }, [tex, handle, advance]);
  return tex;
};

const Phone: React.FC<{ screen: string; position: [number, number, number]; rotation: [number, number, number]; frame: string }> = ({ screen, position, rotation, frame }) => {
  const body = useMemo(() => new RoundedBoxGeometry(PHONE.w, PHONE.h, PHONE.d, 6, PHONE.r), []);
  const glass = useMemo(() => roundedRect(PHONE.w - 0.05, PHONE.h - 0.05, PHONE.r - 0.025), []);
  const island = useMemo(() => roundedRect(0.17, 0.045, 0.0225), []);
  const tex = useImageTexture(screen);
  const env = useEnvMap();
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial color={frame} metalness={0.85} roughness={0.28} clearcoat={0.6} envMap={env} envMapIntensity={0.9} />
      </mesh>
      {/* Keyed on the texture: a material compiled without a map never picks one up later. */}
      <mesh key={tex?.uuid ?? "empty"} geometry={glass} position={[0, 0, PHONE.d / 2 + 0.001]}>
        {tex ? <meshBasicMaterial map={tex} toneMapped={false} /> : <meshBasicMaterial color="#111" />}
      </mesh>
      {/* Dynamic island */}
      <mesh geometry={island} position={[0, PHONE.h / 2 - 0.06, PHONE.d / 2 + 0.002]}>
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
};

export const DeviceFloatScene: React.FC<SceneProps> = ({ scene, dur }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const screens = (scene.media ?? "").split("|").filter(Boolean);
  const t = frame / Math.max(1, dur);
  const pull = prog(frame, 0, Math.round(dur * 0.55), EASE.inOut);
  const fadeIn = prog(frame, 0, 12);
  const [, piece, glaze] = (scene.variant ?? "").split(":");
  const hasCeramic = (scene.variant ?? "").startsWith("ceramic:");

  // Portrait frames need the camera further back to fit the fan's width.
  const back = L.isPortrait ? 1.3 : 0.95;
  const camZ = (2.3 + pull * 2.8) * back;
  const orbit = -0.32 + pull * 0.38 + t * 0.12;
  const camera = {
    position: [Math.sin(orbit) * camZ, 1.0 + pull * 0.55, Math.cos(orbit) * camZ] as [number, number, number],
    target: [0, 1.0 - pull * 0.12, 0] as [number, number, number],
    fov: 30,
  };
  const bob = (i: number) => Math.sin((frame / 30) * 1.1 + i * 2.1) * 0.035;
  // Fan opens as the camera pulls back.
  const spread = 0.35 + pull * 0.65;
  const layout: Array<{ p: [number, number, number]; r: [number, number, number] }> = [
    { p: [0, 1.0 + bob(0), 0.35], r: [-0.04, 0, 0] },
    { p: [0.95 * spread, 0.92 + bob(1), -0.35], r: [-0.02, -0.38 * spread, 0.03] },
    { p: [-0.95 * spread, 0.92 + bob(2), -0.35], r: [-0.02, 0.38 * spread, -0.03] },
  ];

  return (
    <AbsoluteFill style={{ background: b.colors.background, opacity: fadeIn }}>
      <StudioStage
        width={width}
        height={height}
        background={b.colors.background}
        camera={camera}
        keyLight={{ position: [-3.5, 6.5, 5], intensity: 3, color: "#fff1e0" }}
        rimColor="#fff6ea"
        accentColor={b.colors.accent}
        accentIntensity={0.2}
      >
        <hemisphereLight args={["#ffffff", "#d8d0c4", 1.4]} />
        {screens.slice(0, 3).map((s, i) => (
          <Phone key={s} screen={s} position={layout[i].p} rotation={layout[i].r} frame={i === 0 ? "#2a2724" : "#3a3631"} />
        ))}
        {hasCeramic ? <Ceramic piece={(piece || "moon") as CeramicPiece} glaze={(glaze || "bone") as Glaze} position={[0.5, 0, 0.95]} scale={0.36} rotationY={t * 0.6} /> : null}
      </StudioStage>
    </AbsoluteFill>
  );
};
