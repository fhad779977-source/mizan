// A reusable 3D stage: frame-driven camera, three-point lighting with an
// animated key light, procedural environment reflections and a fog-faded
// floor. Everything moves only through props derived from useCurrentFrame().
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Vec3 = [number, number, number];

const FrameCamera: React.FC<{ position: Vec3; target: Vec3; fov: number }> = ({ position, target, fov }) => {
  const set = useThree((s) => s.set);
  const size = useThree((s) => s.size);
  const ref = useRef<THREE.PerspectiveCamera>(null);
  useLayoutEffect(() => {
    if (ref.current) set({ camera: ref.current });
  }, [set]);
  // Runs on every Remotion frame before ThreeCanvas advances the renderer.
  useLayoutEffect(() => {
    const cam = ref.current;
    if (!cam) return;
    cam.position.set(...position);
    cam.fov = fov;
    cam.aspect = size.width / size.height;
    cam.lookAt(...target);
    cam.updateProjectionMatrix();
  });
  return <perspectiveCamera ref={ref} near={0.1} far={60} />;
};

// Procedural studio environment (no HDR download). Exposed through context so
// each material decides how much reflection it takes: chrome reads the room,
// matte floors and plinths stay dark.
const EnvContext = React.createContext<THREE.Texture | null>(null);
export const useEnvMap = () => React.useContext(EnvContext);

const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return tex;
  }, [gl]);
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
};

const Floor: React.FC<{ color: string }> = ({ color }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[60, 60]} />
    <meshStandardMaterial color={color} roughness={0.92} metalness={0} />
  </mesh>
);

export type StageProps = {
  width: number;
  height: number;
  background: string;
  camera: { position: Vec3; target: Vec3; fov: number };
  keyLight: { position: Vec3; intensity: number; color?: string };
  rimColor: string;
  accentColor: string;
  accentIntensity?: number;
  floor?: boolean;
  children: React.ReactNode;
};

export const StudioStage: React.FC<StageProps> = ({
  width,
  height,
  background,
  camera,
  keyLight,
  rimColor,
  accentColor,
  accentIntensity = 0.8,
  floor = true,
  children,
}) => {
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} style={{ background }}>
      <FrameCamera {...camera} />
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[background, 9, 22]} />
      <ambientLight intensity={0.06} />
      <spotLight
        position={keyLight.position}
        intensity={keyLight.intensity}
        color={keyLight.color ?? "#ffffff"}
        angle={0.36}
        penumbra={0.85}
        decay={0}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[3.5, 4, -6]} intensity={2.2} color={rimColor} />
      <pointLight position={[-2.2, 0.4, -1.6]} intensity={accentIntensity} color={accentColor} decay={0} distance={6} />
      <EnvironmentProvider>
        {floor ? <Floor color={background} /> : null}
        {children}
      </EnvironmentProvider>
    </ThreeCanvas>
  );
};
