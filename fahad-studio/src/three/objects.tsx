import React, { useMemo } from "react";
import { createMonogramGeometry, createVesselGeometry } from "./geometry";
import { useEnvMap } from "./StudioStage";

export const Monogram: React.FC<{ color: string; roughness?: number; position?: [number, number, number]; rotationY?: number }> = ({
  color,
  roughness = 0.3,
  position = [0, 0, 0],
  rotationY = 0,
}) => {
  const geo = useMemo(() => createMonogramGeometry(), []);
  const env = useEnvMap();
  return (
    <mesh geometry={geo} position={position} rotation={[0, rotationY, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial color={color} metalness={1} roughness={roughness} clearcoat={0.4} clearcoatRoughness={0.2} envMap={env} envMapIntensity={0.6} />
    </mesh>
  );
};

export const Plinth: React.FC<{ color: string; edge: string }> = ({ color, edge }) => (
  <group>
    <mesh position={[0, 0.07, 0]} receiveShadow castShadow>
      <boxGeometry args={[2.5, 0.14, 1.1]} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
    </mesh>
    <mesh position={[0, 0.14, 0.551]}>
      <boxGeometry args={[2.5, 0.006, 0.004]} />
      <meshStandardMaterial color={edge} emissive={edge} emissiveIntensity={0.6} />
    </mesh>
  </group>
);

export const Vessel: React.FC<{ body: string; cap: string; rotationY?: number; position?: [number, number, number] }> = ({
  body,
  cap,
  rotationY = 0,
  position = [0, 0, 0],
}) => {
  const geo = useMemo(() => createVesselGeometry(), []);
  const envMap = useEnvMap();
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color={body} roughness={0.38} metalness={0} clearcoat={0.6} clearcoatRoughness={0.25} sheen={0.3} envMap={envMap} envMapIntensity={0.6} />
      </mesh>
      <mesh position={[0, 2.3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.26, 64]} />
        <meshPhysicalMaterial color={cap} metalness={1} roughness={0.22} envMap={envMap} envMapIntensity={1} />
      </mesh>
    </group>
  );
};
