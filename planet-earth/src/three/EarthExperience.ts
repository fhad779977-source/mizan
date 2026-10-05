import * as THREE from 'three/webgpu';
import type { Place } from '../data/content';
import type { ElementId } from '../data/content';
import {
  createAtmosphereMaterial,
  createCloudMaterial,
  createEarthUniforms,
  createGasGiantMaterial,
  createGlobeMaterial,
  createHaloMaterial,
  createMoonMaterial,
  createRingMaterial,
  createStarfieldMaterial,
  type EarthTextures,
  type EarthUniforms,
} from './materials';
import { sampleShots, shotsFor, type Shot } from './keyframes';
import type { QualityProfile } from './quality';

export type RenderBackend = 'WebGPU' | 'WebGL 2';

/** Per-frame screen data for DOM hotspots: [x, y, opacity] per place, in CSS pixels. */
export type HotspotListener = (data: Float32Array) => void;

const BASE_AXIAL_TILT = 0.23;
const TAU = Math.PI * 2;

const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

/** Unit-sphere position matching THREE.SphereGeometry's equirectangular UVs. */
export function latLonToLocal(lat: number, lon: number, radius = 1): THREE.Vector3 {
  const phi = ((lon + 180) / 360) * TAU;
  const theta = ((90 - lat) / 180) * Math.PI;
  return new THREE.Vector3(
    -Math.cos(phi) * Math.sin(theta) * radius,
    Math.cos(theta) * radius,
    Math.sin(phi) * Math.sin(theta) * radius,
  );
}

export class EarthExperience {
  private readonly canvas: HTMLCanvasElement;
  private readonly profile: QualityProfile;
  private renderer!: THREE.WebGPURenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(36, 1, 0.05, 400);
  private readonly uniforms: EarthUniforms = createEarthUniforms();

  // Scene graph: earthGroup (position) → tiltGroup (axial tilt) → pivot (focus latitude) → spinner (rotation).
  private readonly earthGroup = new THREE.Group();
  private readonly tiltGroup = new THREE.Group();
  private readonly pivot = new THREE.Group();
  private readonly spinner = new THREE.Group();
  private clouds: THREE.Mesh | null = null;
  private atmosphere!: THREE.Mesh;
  private stars!: THREE.Mesh;
  private moon!: THREE.Mesh;
  private giant!: THREE.Group;

  private shots: Shot[] = shotsFor(16 / 9);
  private readonly shot: Shot = {
    earth: new THREE.Vector3(),
    cameraZ: 3,
    fov: 36,
    neighbours: 1,
    spin: 0.03,
  };

  // Animated state.
  private targetProgress = 0;
  private progress = 0;
  private pointer = new THREE.Vector2();
  private pointerSmoothed = new THREE.Vector2();
  private spinAngle = 2.4;
  private cloudAngle = 0;
  private focusSpin: number | null = null;
  private focusLat = 0;
  private elementTargets = { land: 0, ocean: 0, atmosphere: 0 };
  private intro = { zoom: 0, exposure: 1 };

  // Hotspots.
  private hotspotLocals: THREE.Vector3[] = [];
  private hotspotBuffer = new Float32Array(0);
  private hotspotListener: HotspotListener | null = null;

  // Frame governor.
  private lastTime = 0;
  private frameAccumulator = 0;
  private frameCount = 0;
  private dpr = 1;

  private readonly disposables: { dispose: () => void }[] = [];
  private readonly tmpA = new THREE.Vector3();
  private readonly tmpB = new THREE.Vector3();
  private readonly tmpC = new THREE.Vector3();
  private readonly tmpD = new THREE.Vector3();
  backend: RenderBackend = 'WebGL 2';

  private disposed = false;

  private readonly forceWebGL: boolean;

  /**
   * @param forceWebGL Skip WebGPU — used as an automatic retry when a WebGPU
   * implementation fails part-way through initialisation.
   */
  constructor(container: HTMLElement, profile: QualityProfile, forceWebGL = false) {
    this.forceWebGL = forceWebGL || new URLSearchParams(window.location.search).has('webgl');
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'scene';
    container.appendChild(this.canvas);
    this.profile = profile;
    if (!profile.reducedMotion) this.intro = { zoom: 1, exposure: 0 };
  }

  private assertAlive() {
    if (this.disposed) throw new Error('EarthExperience disposed during initialisation');
  }

  /* ---------------------------------------------------------------- */
  /* Lifecycle                                                          */
  /* ---------------------------------------------------------------- */

  async init(onProgress: (ratio: number) => void): Promise<RenderBackend> {
    this.renderer = new THREE.WebGPURenderer({
      canvas: this.canvas,
      antialias: this.profile.tier === 'high',
      alpha: false,
      powerPreference: 'high-performance',
      forceWebGL: this.forceWebGL,
    });
    await this.renderer.init();
    this.assertAlive();
    this.backend = (this.renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? 'WebGPU' : 'WebGL 2';
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x05070d, 1);
    this.dpr = Math.min(window.devicePixelRatio || 1, this.profile.maxDpr);
    this.renderer.setPixelRatio(this.dpr);
    this.resize();
    onProgress(0.08);

    const textures = await this.loadTextures((r) => onProgress(0.08 + r * 0.72));
    this.assertAlive();
    this.buildScene(textures);
    onProgress(0.86);

    // Compile every pipeline up-front so the first scroll never stutters.
    this.updateFrame(0);
    await this.renderer.compileAsync(this.scene, this.camera);
    this.assertAlive();
    onProgress(1);

    this.lastTime = performance.now();
    this.renderer.setAnimationLoop(this.tick);
    return this.backend;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.hotspotListener = null;
    this.renderer?.setAnimationLoop(null);
    this.disposables.forEach((d) => d.dispose());
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => m.dispose());
      }
    });
    this.renderer?.dispose();
    this.canvas.remove();
  }

  resize() {
    if (!this.renderer || this.disposed) return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.shots = shotsFor(this.camera.aspect);
    this.placeNeighbours();
    this.camera.updateProjectionMatrix();
  }

  /* ---------------------------------------------------------------- */
  /* Public controls                                                    */
  /* ---------------------------------------------------------------- */

  /** Fractional section index, 0 (hero) … 4 (final). */
  setProgress(value: number) {
    this.targetProgress = value;
  }

  /** Normalised pointer, -1..1 on each axis. */
  setPointer(x: number, y: number) {
    if (this.profile.reducedMotion) return;
    this.pointer.set(x, y);
  }

  setElement(id: ElementId | null) {
    this.elementTargets.land = id === 'land' ? 1 : 0;
    this.elementTargets.ocean = id === 'ocean' ? 1 : 0;
    this.elementTargets.atmosphere = id === 'atmosphere' ? 1 : 0;
  }

  setPlaces(places: Place[]) {
    this.hotspotLocals = places.map((p) => latLonToLocal(p.lat, p.lon, 1.01));
    this.hotspotBuffer = new Float32Array(places.length * 3);
  }

  onHotspots(listener: HotspotListener | null) {
    this.hotspotListener = listener;
  }

  /** Rotate the globe so that a place faces the camera; null resumes the slow drift. */
  focusPlace(place: Place | null) {
    if (!place) {
      this.focusSpin = null;
      this.focusLat = 0;
      return;
    }
    const local = latLonToLocal(place.lat, place.lon);
    const target = Math.atan2(-local.x, local.z);
    this.focusSpin = target + TAU * Math.round((this.spinAngle - target) / TAU);
    this.focusLat = THREE.MathUtils.degToRad(place.lat) * 0.8;
  }

  /** Cinematic arrival after loading: fade in and glide toward the planet. */
  playIntro(duration = 3.2) {
    if (this.profile.reducedMotion) return;
    this.intro.zoom = 1;
    this.intro.exposure = 0;
    const start = performance.now();
    const step = () => {
      const t = Math.min((performance.now() - start) / (duration * 1000), 1);
      const e = 1 - Math.pow(1 - t, 3);
      this.intro.zoom = 1 - e;
      this.intro.exposure = Math.min(1, t * 1.6);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------------- */
  /* Construction                                                       */
  /* ---------------------------------------------------------------- */

  private async loadTextures(onProgress: (ratio: number) => void): Promise<EarthTextures & { moon: THREE.Texture }> {
    const manager = new THREE.LoadingManager();
    manager.onProgress = (_url, loaded, total) => onProgress(loaded / total);
    const loader = new THREE.TextureLoader(manager);
    const base = `${import.meta.env.BASE_URL}textures/${this.profile.textureSet}/`;
    const [day, night, brc, moon] = await Promise.all([
      loader.loadAsync(`${base}earth_day.jpg`),
      loader.loadAsync(`${base}earth_night.jpg`),
      loader.loadAsync(`${base}earth_brc.jpg`),
      loader.loadAsync(`${import.meta.env.BASE_URL}textures/moon.jpg`),
    ]);
    for (const t of [day, night, moon]) t.colorSpace = THREE.SRGBColorSpace;
    for (const t of [day, night, brc, moon]) {
      t.anisotropy = this.profile.anisotropy;
      this.disposables.push(t);
    }
    return { day, night, brc, moon };
  }

  private buildScene(tex: EarthTextures & { moon: THREE.Texture }) {
    const { sphereSegments: seg, cloudShell } = this.profile;
    const sunDir = this.uniforms.sunDirection.value as THREE.Vector3;

    const sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.copy(sunDir).multiplyScalar(20);
    this.scene.add(sun, new THREE.AmbientLight(0x8aa4ff, 0.05));

    // Backdrop.
    this.stars = new THREE.Mesh(
      new THREE.SphereGeometry(150, 48, 32),
      createStarfieldMaterial(this.profile.tier === 'low'),
    );
    this.stars.frustumCulled = false;
    this.stars.renderOrder = -10;
    this.scene.add(this.stars);

    // Earth.
    const sphere = new THREE.SphereGeometry(1, seg, Math.round(seg / 2));
    const globe = new THREE.Mesh(sphere, createGlobeMaterial(tex, this.uniforms, !cloudShell));
    this.spinner.add(globe);

    if (cloudShell) {
      this.clouds = new THREE.Mesh(sphere.clone(), createCloudMaterial(tex, this.uniforms));
      this.clouds.scale.setScalar(1.008);
      this.clouds.renderOrder = 1;
      this.spinner.add(this.clouds);
    }

    this.atmosphere = new THREE.Mesh(sphere.clone(), createAtmosphereMaterial(this.uniforms));
    this.atmosphere.scale.setScalar(1.04);
    this.atmosphere.renderOrder = 2;

    const halo = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), createHaloMaterial(this.uniforms));
    halo.scale.setScalar(1.22);
    halo.renderOrder = 3;

    this.pivot.add(this.spinner);
    this.tiltGroup.add(this.pivot);
    this.tiltGroup.rotation.z = BASE_AXIAL_TILT;
    this.earthGroup.add(this.tiltGroup, this.atmosphere, halo);
    this.scene.add(this.earthGroup);

    // Neighbours — fragments of other worlds at the edges of the frame.
    this.moon = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), createMoonMaterial(tex.moon));
    this.moon.scale.setScalar(0.24);
    this.scene.add(this.moon);

    this.giant = new THREE.Group();
    const giantBody = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 48), createGasGiantMaterial());
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.3, 2.35, 160, 1), createRingMaterial());
    ring.rotation.x = Math.PI / 2 - 0.32;
    ring.renderOrder = 4;
    this.giant.add(giantBody, ring);
    this.giant.rotation.z = -0.38;
    this.giant.scale.setScalar(2.3);
    this.scene.add(this.giant);

    this.placeNeighbours();
  }

  private neighbourBase = {
    moon: new THREE.Vector3(),
    giant: new THREE.Vector3(),
  };

  private placeNeighbours() {
    const tall = this.camera.aspect < 0.85;
    this.neighbourBase.moon.set(tall ? -1.15 : -2.75, tall ? 2.0 : 1.05, -2.2);
    this.neighbourBase.giant.set(tall ? 3.3 : 8.2, tall ? 5.9 : 4.4, -11);
  }

  /* ---------------------------------------------------------------- */
  /* Frame loop                                                         */
  /* ---------------------------------------------------------------- */

  private tick = () => {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.25);
    this.lastTime = now;
    this.governFrameRate(dt);
    this.updateFrame(dt);
    this.renderer.render(this.scene, this.camera);
    this.emitHotspots();
  };

  private updateFrame(dt: number) {
    const reduced = this.profile.reducedMotion;
    this.progress = reduced ? this.targetProgress : damp(this.progress, this.targetProgress, 3.2, dt);
    this.pointerSmoothed.x = damp(this.pointerSmoothed.x, this.pointer.x, 2.4, dt);
    this.pointerSmoothed.y = damp(this.pointerSmoothed.y, this.pointer.y, 2.4, dt);

    const shot = sampleShots(this.shots, this.progress, this.shot);
    const px = this.pointerSmoothed.x;
    const py = this.pointerSmoothed.y;

    // Camera: scroll-driven dolly + gentle pointer parallax.
    const introZ = this.intro.zoom * this.intro.zoom * 4.5;
    this.camera.position.set(px * 0.14, py * 0.09 + this.intro.zoom * 0.6, shot.cameraZ + introZ);
    this.camera.lookAt(px * 0.04, py * 0.025, 0);
    if (Math.abs(this.camera.fov - shot.fov) > 0.01) {
      this.camera.fov = shot.fov;
      this.camera.updateProjectionMatrix();
    }

    this.earthGroup.position.copy(shot.earth);

    // Rotation: slow drift, or ease toward a focused place.
    const spinScale = reduced ? 0.35 : 1;
    if (this.focusSpin === null) {
      this.spinAngle += shot.spin * spinScale * dt;
    } else {
      this.spinAngle = damp(this.spinAngle, this.focusSpin, 2.2, dt);
    }
    this.spinner.rotation.y = this.spinAngle;
    this.pivot.rotation.x = damp(this.pivot.rotation.x, this.focusLat, 2.2, dt);
    const tiltTarget = this.focusSpin === null ? BASE_AXIAL_TILT : 0;
    this.tiltGroup.rotation.z = damp(this.tiltGroup.rotation.z, tiltTarget, 2, dt);
    this.tiltGroup.rotation.x = py * 0.05;
    this.tiltGroup.rotation.y = px * 0.08;

    // Clouds drift a touch faster than the surface.
    this.cloudAngle += dt * 0.006 * spinScale;
    if (this.clouds) this.clouds.rotation.y = this.cloudAngle;
    this.uniforms.cloudOffset.value = this.cloudAngle / TAU;

    // Element emphasis.
    const u = this.uniforms;
    u.land.value = damp(u.land.value as number, this.elementTargets.land, 3, dt);
    u.ocean.value = damp(u.ocean.value as number, this.elementTargets.ocean, 3, dt);
    u.atmosphere.value = damp(u.atmosphere.value as number, this.elementTargets.atmosphere, 3, dt);
    this.atmosphere.scale.setScalar(1.04 + (u.atmosphere.value as number) * 0.025);
    u.exposure.value = this.intro.exposure;

    // Neighbours glide out of frame when the shot does not want them.
    const away = 1 - shot.neighbours;
    this.moon.position.copy(this.neighbourBase.moon).add(this.tmpA.set(-2.6 * away, 0.8 * away, 0));
    this.moon.rotation.y += dt * 0.02;
    this.giant.position.copy(this.neighbourBase.giant).add(this.tmpA.set(7 * away, 3 * away, 0));
    this.giant.children[0].rotation.y += dt * 0.03;

    // Stars stay centred on the camera and turn imperceptibly.
    this.stars.position.copy(this.camera.position);
    this.stars.rotation.y += dt * 0.0035;
    this.stars.rotation.x = py * 0.01;
  }

  private emitHotspots() {
    if (!this.hotspotListener || this.hotspotLocals.length === 0) return;
    const exploreWeight = Math.max(0, 1 - Math.abs(this.progress - 1) * 2.6);
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const center = this.earthGroup.getWorldPosition(this.tmpC);
    this.spinner.updateMatrixWorld();

    for (let i = 0; i < this.hotspotLocals.length; i++) {
      const world = this.tmpA.copy(this.hotspotLocals[i]).applyMatrix4(this.spinner.matrixWorld);
      const normal = this.tmpB.copy(world).sub(center).normalize();
      const toCamera = this.tmpD.copy(this.camera.position).sub(world).normalize();
      const facing = normal.dot(toCamera);
      const visibility = THREE.MathUtils.smoothstep(facing, 0.12, 0.38) * exploreWeight * this.intro.exposure;
      world.project(this.camera);
      this.hotspotBuffer[i * 3] = (world.x * 0.5 + 0.5) * width;
      this.hotspotBuffer[i * 3 + 1] = (-world.y * 0.5 + 0.5) * height;
      this.hotspotBuffer[i * 3 + 2] = visibility;
    }
    this.hotspotListener(this.hotspotBuffer);
  }

  /** Lowers the pixel ratio if the device cannot sustain a fluid frame rate. */
  private governFrameRate(dt: number) {
    this.frameAccumulator += dt;
    this.frameCount++;
    if (this.frameAccumulator < 2.5) return;
    const fps = this.frameCount / this.frameAccumulator;
    this.frameAccumulator = 0;
    this.frameCount = 0;
    if (document.hidden) return;
    if (fps < 34 && this.dpr > 1) {
      this.dpr = Math.max(1, this.dpr - 0.25);
      this.renderer.setPixelRatio(this.dpr);
      this.resize();
    }
  }
}
