// Seamless background loop for websites (web/ section): a dark planet horizon
// rim-lit from behind, with a meridian grid. Everything is a whole number of
// periods per loop (grid rotation, light sweep, breathing), so frame N == frame 0.
// Motion must read on a phone at a glance: a still-looking loop reads as broken.
// Rendered to web/assets-src/video/horizon.mp4, then encoded for the web by
// web/scripts/prepare-assets.mjs.
import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";

const MERIDIANS = 24;

const useGridTexture = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 1024;
    const g = c.getContext("2d")!;
    g.fillStyle = "#04060b";
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "rgba(140,165,255,0.9)";
    g.lineWidth = 2;
    for (let i = 0; i < MERIDIANS; i++) {
      const x = (i / MERIDIANS) * c.width;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, c.height);
      g.stroke();
    }
    g.strokeStyle = "rgba(140,165,255,0.4)";
    for (let j = 1; j < 12; j++) {
      const y = (j / 12) * c.height;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(c.width, y);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);

const atmosphere = {
  vertexShader: `varying vec3 vN; varying vec3 vV;
    void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
  // Rendered on the back faces of a slightly larger shell: brightest just
  // above the planet's limb (d ≈ -uEdge) and fading to zero at the shell's
  // own silhouette (d = 0), so the glow dissolves into space without a band.
  // uSweep moves a brighter "sunrise" lobe along the limb (view-space x).
  fragmentShader: `uniform vec3 uColor; uniform float uEdge; uniform float uStrength; uniform float uSweep; varying vec3 vN; varying vec3 vV;
    void main(){ float d = dot(vN, vV); float f = clamp(-d / uEdge, 0.0, 1.0); f = f * f * f;
      float lobe = exp(-pow((vN.x - uSweep) / 0.22, 2.0));
      gl_FragColor = vec4(uColor * f * uStrength * (0.75 + 1.6 * lobe), 1.0); }`,
};

export const HorizonLoop: React.FC<{ glow?: string }> = ({ glow = "#6f8cff" }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const map = useGridTexture();
  const t = frame / durationInFrames; // 0..1 over the loop
  const spin = t * 3 * ((Math.PI * 2) / MERIDIANS); // three grid periods per loop
  const shell = 1.08;
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(glow) }, uEdge: { value: Math.sqrt(1 - 1 / (shell * shell)) }, uStrength: { value: 0.9 }, uSweep: { value: 0 } }),
    [glow],
  );
  uniforms.uSweep.value = 0.55 * Math.sin(t * Math.PI * 2);
  uniforms.uStrength.value = 0.9 + 0.18 * Math.sin(t * Math.PI * 4);
  return (
    <AbsoluteFill style={{ background: "#020205" }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0.25, 9], fov: 32 }} gl={{ antialias: true }}>
        <color attach="background" args={["#020205"]} />
        <ambientLight intensity={0.03} />
        {/* Low grazing light from above the camera: makes the grid readable near the limb. */}
        <directionalLight position={[0, 6, 4]} intensity={0.55} color="#9fb2ff" />
        <directionalLight position={[0, 2.2, -10]} intensity={5} color="#c4d0ff" />
        <directionalLight position={[3, 4, 6]} intensity={0.15} color="#ffffff" />
        <group position={[0, -9.25, 0]} rotation={[0.18, 0, 0.05]}>
          <mesh rotation={[0, spin, 0]}>
            <sphereGeometry args={[8.6, 128, 96]} />
            <meshStandardMaterial map={map} roughness={0.85} metalness={0.1} />
          </mesh>
          <mesh scale={shell}>
            <sphereGeometry args={[8.6, 128, 96]} />
            <shaderMaterial args={[atmosphere]} uniforms={uniforms} side={THREE.BackSide} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
