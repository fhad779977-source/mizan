import * as THREE from 'three/webgpu';

/**
 * One cinematic "shot" per page section. The scene progress value (0..4)
 * blends smoothly between consecutive shots.
 */
export interface Shot {
  /** Where the planet sits in world space. */
  earth: THREE.Vector3;
  /** Camera distance on +Z. */
  cameraZ: number;
  /** Vertical field of view in degrees. */
  fov: number;
  /** Neighbouring worlds visibility multiplier (0..1). */
  neighbours: number;
  /** Auto-rotation speed in rad/s. */
  spin: number;
}

const v = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);

function wideShots(): Shot[] {
  return [
    // 1. Hero — a vast horizon in the lower half of the frame.
    { earth: v(0, -1.42), cameraZ: 3.15, fov: 36, neighbours: 1, spin: 0.035 },
    // 2. Explore — close approach, planet to the right of the copy.
    { earth: v(0.78, -0.04), cameraZ: 3.35, fov: 38, neighbours: 0.25, spin: 0.012 },
    // 3. Elements — planet on the left, panels on the right.
    { earth: v(-0.82, 0), cameraZ: 3.6, fov: 38, neighbours: 0.35, spin: 0.03 },
    // 4. Statistics — pulled back, the planet becomes a distant jewel.
    { earth: v(1.35, 0.35, -1.2), cameraZ: 5.6, fov: 36, neighbours: 0.9, spin: 0.045 },
    // 5. Final — the whole planet, centred.
    { earth: v(0, 0.04), cameraZ: 5.1, fov: 36, neighbours: 0.6, spin: 0.04 },
  ];
}

function tallShots(): Shot[] {
  return [
    { earth: v(0, -1.3), cameraZ: 4.6, fov: 42, neighbours: 1, spin: 0.035 },
    { earth: v(0, 0.78), cameraZ: 4.9, fov: 44, neighbours: 0.2, spin: 0.012 },
    { earth: v(0, 0.95), cameraZ: 5.4, fov: 44, neighbours: 0.3, spin: 0.03 },
    { earth: v(0.45, 1.85, -2.5), cameraZ: 7.6, fov: 42, neighbours: 0.8, spin: 0.045 },
    { earth: v(0, 0.1), cameraZ: 6.2, fov: 42, neighbours: 0.6, spin: 0.04 },
  ];
}

export function shotsFor(aspect: number): Shot[] {
  return aspect < 0.85 ? tallShots() : wideShots();
}

const ease = (t: number) => t * t * (3 - 2 * t);

/** Blend shots at fractional progress p into `out`. */
export function sampleShots(shots: Shot[], p: number, out: Shot): Shot {
  const max = shots.length - 1;
  const clamped = Math.min(Math.max(p, 0), max);
  const i = Math.min(Math.floor(clamped), max - 1);
  const t = ease(clamped - i);
  const a = shots[i];
  const b = shots[i + 1];
  out.earth.lerpVectors(a.earth, b.earth, t);
  out.cameraZ = a.cameraZ + (b.cameraZ - a.cameraZ) * t;
  out.fov = a.fov + (b.fov - a.fov) * t;
  out.neighbours = a.neighbours + (b.neighbours - a.neighbours) * t;
  out.spin = a.spin + (b.spin - a.spin) * t;
  return out;
}
