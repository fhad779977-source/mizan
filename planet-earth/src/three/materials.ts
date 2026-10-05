import * as THREE from 'three/webgpu';
import {
  abs,
  bumpMap,
  cameraPosition,
  clamp,
  color,
  dot,
  exp,
  float,
  floor,
  fract,
  length,
  max,
  mix,
  mx_fractal_noise_float,
  mx_noise_float,
  normalize,
  normalWorldGeometry,
  output,
  positionLocal,
  positionWorld,
  sin,
  smoothstep,
  step,
  texture,
  time,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';

type Node = THREE.Node<'float'>;
type Vec3Node = THREE.Node<'vec3'>;

/** Shared, tweenable shader inputs. Values are animated from EarthExperience. */
export function createEarthUniforms() {
  return {
    sunDirection: uniform(new THREE.Vector3(-0.62, 0.38, 0.69).normalize()),
    /** Element emphasis, 0..1 each. */
    land: uniform(0),
    ocean: uniform(0),
    atmosphere: uniform(0),
    /** Horizontal UV offset of the cloud layer relative to the surface (drift). */
    cloudOffset: uniform(0),
    /** Global brightness used by the intro fade. */
    exposure: uniform(1),
    atmosphereDay: uniform(color('#4da8ff')),
    atmosphereTwilight: uniform(color('#7a4a6a')),
  };
}

export type EarthUniforms = ReturnType<typeof createEarthUniforms>;

export interface EarthTextures {
  day: THREE.Texture;
  night: THREE.Texture;
  /** R: bump, G: roughness (≈ land mask), B: clouds. */
  brc: THREE.Texture;
}

function fresnelOf(normal: Vec3Node) {
  const viewDirection = positionWorld.sub(cameraPosition).normalize();
  return viewDirection.dot(normal).abs().oneMinus();
}

/* ------------------------------------------------------------------ */
/* Earth surface                                                       */
/* ------------------------------------------------------------------ */

export function createGlobeMaterial(tex: EarthTextures, u: EarthUniforms, bakeClouds: boolean) {
  const material = new THREE.MeshStandardNodeMaterial();

  const brc = texture(tex.brc, uv());
  const landMask = smoothstep(0.1, 0.3, brc.g);
  const oceanMask = landMask.oneMinus();

  const cloudUv = uv().sub(vec2(u.cloudOffset, 0));
  const cloudSample = texture(tex.brc, cloudUv).b;
  const clouds = smoothstep(0.2, 1, cloudSample).mul(u.atmosphere.mul(0.5).add(1)).toVar();

  const day = texture(tex.day, uv()).rgb;
  const luminance = dot(day, vec3(0.299, 0.587, 0.114));
  const gray = vec3(luminance);

  // Element emphasis — subtle grading, never cartoon colours.
  let base: Vec3Node = day;
  base = mix(base, base.mul(vec3(1.16, 1.1, 0.96)).pow(vec3(1.08)), u.land.mul(landMask));
  base = mix(base, gray.mul(0.32), u.land.mul(oceanMask).mul(0.75));
  const luminousOcean = mix(day, vec3(0.02, 0.24, 0.55), 0.45).mul(1.5);
  base = mix(base, luminousOcean, u.ocean.mul(oceanMask));
  base = mix(base, gray.mul(0.4), u.ocean.mul(landMask).mul(0.75));
  base = base.mul(u.atmosphere.mul(-0.22).add(1));

  if (bakeClouds) {
    base = mix(base, vec3(1), clamp(clouds.mul(1.5), 0, 0.9));
  } else {
    // Soft cloud shadows cast onto the surface by the separate cloud shell.
    base = base.mul(clouds.mul(-0.35).add(1));
  }
  material.colorNode = base;

  const roughnessSource = bakeClouds ? max(brc.g, step(0.01, clouds)) : brc.g;
  material.roughnessNode = mix(mix(0.32, 0.16, u.ocean), 0.6, roughnessSource);

  const bumpElevation = bakeClouds ? max(brc.r, clouds) : brc.r;
  material.normalNode = bumpMap(bumpElevation);

  // Day / night blend with city lights and atmospheric rim.
  const sunOrientation = normalWorldGeometry.dot(u.sunDirection).toVar();
  const fresnel = fresnelOf(normalWorldGeometry).toVar();
  const atmosphereColor = mix(u.atmosphereTwilight, u.atmosphereDay, smoothstep(-0.2, 0.3, sunOrientation));

  const night = texture(tex.night, uv()).rgb.mul(vec3(1.25, 1.0, 0.72)).mul(u.land.mul(0.6).add(1));
  const dayStrength = smoothstep(-0.25, 0.5, sunOrientation);
  const atmosphereMix = clamp(
    smoothstep(-0.1, 1, sunOrientation).mul(fresnel.pow(2.4)).mul(u.atmosphere.mul(0.6).add(1)),
    0,
    1,
  );

  let finalColor = mix(night, output.rgb, dayStrength);
  finalColor = mix(finalColor, atmosphereColor, atmosphereMix);
  material.outputNode = vec4(finalColor.mul(u.exposure), output.a);

  return material;
}

/* ------------------------------------------------------------------ */
/* Cloud shell (high tier)                                             */
/* ------------------------------------------------------------------ */

export function createCloudMaterial(tex: EarthTextures, u: EarthUniforms) {
  const material = new THREE.MeshStandardNodeMaterial({ transparent: true, depthWrite: false });
  const clouds = smoothstep(0.24, 0.92, texture(tex.brc, uv()).b);
  const strength = u.atmosphere.mul(0.5).add(0.68);
  material.colorNode = vec3(1);
  material.roughnessNode = float(0.9);
  material.opacityNode = clamp(clouds.mul(strength).mul(1.15), 0, 1).mul(u.exposure);
  material.normalNode = bumpMap(clouds.mul(0.6));
  return material;
}

/* ------------------------------------------------------------------ */
/* Atmosphere                                                          */
/* ------------------------------------------------------------------ */

export function createAtmosphereMaterial(u: EarthUniforms) {
  const material = new THREE.MeshBasicNodeMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const fresnel = fresnelOf(normalWorldGeometry);
  const sunOrientation = normalWorldGeometry.dot(u.sunDirection);
  const atmosphereColor = mix(u.atmosphereTwilight, u.atmosphereDay, smoothstep(-0.2, 0.3, sunOrientation));
  const alpha = fresnel
    .remap(0.73, 1, 1, 0)
    .clamp(0, 1)
    .pow(3)
    .mul(smoothstep(-0.3, 1, sunOrientation))
    .mul(u.atmosphere.mul(0.7).add(1))
    .mul(u.exposure);
  material.outputNode = vec4(atmosphereColor, alpha);
  return material;
}

/** Wide, faint additive halo that gives the planet its soft blue glow. */
export function createHaloMaterial(u: EarthUniforms, strength = 0.42) {
  const material = new THREE.MeshBasicNodeMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const viewDirection = positionWorld.sub(cameraPosition).normalize();
  const facing = abs(viewDirection.dot(normalWorldGeometry));
  const sunOrientation = normalWorldGeometry.dot(u.sunDirection);
  const glow = clamp(facing.mul(1.75), 0, 1).pow(3.2);
  const alpha = glow
    .mul(smoothstep(-0.7, 0.9, sunOrientation).mul(0.85).add(0.15))
    .mul(u.atmosphere.mul(0.8).add(1))
    .mul(strength)
    .mul(u.exposure);
  material.outputNode = vec4(u.atmosphereDay.mul(alpha), alpha);
  return material;
}

/* ------------------------------------------------------------------ */
/* Procedural star field + deep-space backdrop                         */
/* ------------------------------------------------------------------ */

function hash31(p: Vec3Node): Node {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))).mul(43758.5453));
}

function hash33(p: Vec3Node): Vec3Node {
  const q = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(q).mul(43758.5453));
}

function starLayer(dir: Vec3Node, scale: number, density: number, radius: number, twinkleSpeed: number) {
  const p = dir.mul(scale);
  const cell = floor(p);
  const local = fract(p);
  const rnd = hash33(cell);
  const center = rnd.mul(0.7).add(0.15);
  const d = length(local.sub(center));
  const present = step(1 - density, hash31(cell.add(17.3)));
  const twinkle = sin(time.mul(rnd.x.mul(twinkleSpeed).add(0.25)).add(rnd.y.mul(6.2831))).mul(0.3).add(0.7);
  const intensity = smoothstep(radius, 0, d).pow(1.6).mul(present).mul(twinkle).mul(rnd.z.mul(0.8).add(0.35));
  const tint = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.9, 0.78), rnd.x);
  return tint.mul(intensity);
}

export function createStarfieldMaterial(lowTier: boolean) {
  const material = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide, depthWrite: false });
  const dir = normalize(positionLocal);

  const deep = color('#05070D');
  const navy = color('#0B1220');
  let sky: Vec3Node = mix(deep, navy, smoothstep(-0.9, 0.9, dir.y.add(dir.x.mul(0.35))).mul(0.6));

  // Faint galactic band.
  const bandAxis = normalize(vec3(0.35, 1, -0.25));
  const band = exp(dot(dir, bandAxis).pow(2).mul(-14));
  const dust = mx_fractal_noise_float(dir.mul(3.2), 4, 2.0, 0.5).mul(0.5).add(0.5);
  sky = sky.add(vec3(0.03, 0.045, 0.09).mul(band).mul(dust).mul(0.4));
  const nebula = smoothstep(0.55, 0.95, mx_noise_float(dir.mul(1.4).add(4.0)).mul(0.5).add(0.5));
  sky = sky.add(vec3(0.008, 0.016, 0.04).mul(nebula));

  let stars: Vec3Node = starLayer(dir, 220, 0.3, 0.22, 1.4).mul(0.8);
  stars = stars.add(starLayer(dir, 90, 0.22, 0.14, 0.9).mul(1.6));
  if (!lowTier) {
    stars = stars.add(starLayer(dir, 420, 0.5, 0.26, 2.0).mul(0.5).mul(band.mul(1.5).add(0.6)));
  }

  material.outputNode = vec4(sky.add(stars), 1);
  return material;
}

/* ------------------------------------------------------------------ */
/* Neighbouring worlds                                                 */
/* ------------------------------------------------------------------ */

export function createGasGiantMaterial() {
  const material = new THREE.MeshStandardNodeMaterial();
  const p = positionLocal;
  const turbulence = mx_fractal_noise_float(p.mul(vec3(1.6, 7, 1.6)), 4, 2.0, 0.55);
  const lat = p.y.add(turbulence.mul(0.07));
  const bands = sin(lat.mul(23)).mul(0.5).add(0.5);
  const fine = sin(lat.mul(71).add(turbulence.mul(4))).mul(0.5).add(0.5);
  let col: Vec3Node = mix(color('#6f5340'), color('#d8bf98'), bands);
  col = mix(col, color('#a77a57'), fine.mul(0.35));
  col = mix(col, color('#efe2c6'), smoothstep(0.82, 1, bands).mul(0.4));
  material.colorNode = col.mul(0.9);
  material.roughnessNode = float(0.85);
  return material;
}

export function createRingMaterial() {
  const material = new THREE.MeshStandardNodeMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  });
  const r = length(positionLocal.xy);
  const grain = mx_noise_float(vec3(r.mul(60), 0, 0)).mul(0.5).add(0.5);
  const grooves = sin(r.mul(23)).mul(0.25).add(0.75).mul(grain.mul(0.5).add(0.5));
  const edges = smoothstep(1.32, 1.45, r).mul(smoothstep(2.3, 2.05, r));
  const gap = smoothstep(0.03, 0.0, abs(r.sub(1.82))).oneMinus();
  material.colorNode = mix(color('#8c7258'), color('#e3cfac'), grooves);
  material.opacityNode = edges.mul(gap).mul(grooves).mul(0.42);
  material.roughnessNode = float(1);
  return material;
}

export function createMoonMaterial(map: THREE.Texture) {
  const material = new THREE.MeshStandardNodeMaterial();
  const m = texture(map, uv()).rgb;
  material.colorNode = m.mul(0.95);
  material.roughnessNode = float(1);
  material.normalNode = bumpMap(dot(m, vec3(0.33)).mul(0.6));
  return material;
}
