// Procedural ceramic pieces for product visuals: lathe profiles + a speckled
// stoneware glaze. Geometric studies (concept products), not scans of real ones.
import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { useEnvMap } from "./StudioStage";

export type CeramicPiece = "bottle" | "moon" | "bowl" | "cup";
export type Glaze = "bone" | "clay" | "ink" | "celadon";

const PROFILES: Record<CeramicPiece, Array<[number, number]>> = {
  // Tall bottle with a slender neck and a lipped mouth.
  bottle: [[0, 0], [0.42, 0], [0.47, 0.03], [0.6, 0.35], [0.66, 0.75], [0.6, 1.15], [0.38, 1.45], [0.16, 1.7], [0.13, 2.1], [0.17, 2.24], [0.15, 2.28], [0.11, 2.26], [0.1, 1.9], [0, 1.9]],
  // Moon jar: near-spherical body on a narrow foot, short collar.
  moon: [[0, 0], [0.34, 0], [0.37, 0.05], [0.55, 0.22], [0.78, 0.6], [0.84, 0.95], [0.76, 1.3], [0.5, 1.58], [0.36, 1.66], [0.37, 1.76], [0.33, 1.77], [0.3, 1.62], [0, 1.62]],
  // Wide, shallow bowl with a visible foot ring (double-walled for thickness).
  bowl: [[0, 0], [0.38, 0], [0.4, 0.08], [0.36, 0.1], [0.62, 0.28], [0.98, 0.55], [1.12, 0.72], [1.1, 0.75], [0.95, 0.62], [0.6, 0.38], [0, 0.26]],
  // Handleless cup, slightly flared.
  cup: [[0, 0], [0.3, 0], [0.33, 0.04], [0.38, 0.5], [0.44, 0.92], [0.42, 0.95], [0.37, 0.55], [0.33, 0.12], [0, 0.12]],
};

const GLAZES: Record<Glaze, { color: string; roughness: number; clearcoat: number; speckle: string; density: number }> = {
  bone: { color: "#EEE8DC", roughness: 0.32, clearcoat: 0.8, speckle: "#6B5A48", density: 0.0016 },
  clay: { color: "#B5643C", roughness: 0.82, clearcoat: 0, speckle: "#7A3E22", density: 0.003 },
  ink: { color: "#1C1A19", roughness: 0.18, clearcoat: 1, speckle: "#4A433D", density: 0.0008 },
  celadon: { color: "#A9B8A3", roughness: 0.22, clearcoat: 0.9, speckle: "#5E6A58", density: 0.0012 },
};

const speckleTexture = (g: Glaze) => {
  const { color, speckle, density } = GLAZES[g];
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const x = c.getContext("2d")!;
  x.fillStyle = color;
  x.fillRect(0, 0, 1024, 1024);
  // Soft glaze pooling: faint horizontal bands (lathe rings).
  for (let i = 0; i < 40; i++) {
    const y = random(`ring-${g}-${i}`) * 1024;
    x.fillStyle = `rgba(0,0,0,${0.012 + random(`ra-${g}-${i}`) * 0.02})`;
    x.fillRect(0, y, 1024, 2 + random(`rh-${g}-${i}`) * 6);
  }
  // Iron speckles typical of stoneware.
  const n = Math.round(1024 * 1024 * density);
  x.fillStyle = speckle;
  for (let i = 0; i < n; i++) {
    const r = 0.6 + random(`sr-${g}-${i}`) * 1.8;
    x.globalAlpha = 0.35 + random(`sa-${g}-${i}`) * 0.6;
    x.beginPath();
    x.arc(random(`sx-${g}-${i}`) * 1024, random(`sy-${g}-${i}`) * 1024, r, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

export const Ceramic: React.FC<{ piece: CeramicPiece; glaze: Glaze; position?: [number, number, number]; rotationY?: number; scale?: number }> = ({
  piece,
  glaze,
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
}) => {
  const geo = useMemo(() => {
    // Smooth the hand-placed profile into a thrown curve (no facets).
    const pts = new THREE.SplineCurve(PROFILES[piece].map(([a, b]) => new THREE.Vector2(a, b))).getSpacedPoints(160);
    pts[0].set(0, pts[0].y);
    const g = new THREE.LatheGeometry(pts, 160);
    g.computeVertexNormals();
    return g;
  }, [piece]);
  const map = useMemo(() => speckleTexture(glaze), [glaze]);
  const env = useEnvMap();
  const gz = GLAZES[glaze];
  return (
    <mesh geometry={geo} position={position} rotation={[0, rotationY, 0]} scale={scale} castShadow receiveShadow>
      <meshPhysicalMaterial map={map} roughness={gz.roughness} metalness={0} clearcoat={gz.clearcoat} clearcoatRoughness={0.12} envMap={env} envMapIntensity={glaze === "clay" ? 0.15 : 0.55} side={THREE.DoubleSide} />
    </mesh>
  );
};
