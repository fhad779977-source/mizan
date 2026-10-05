export type QualityTier = 'high' | 'low' | 'none';

export interface QualityProfile {
  tier: QualityTier;
  /** Upper bound for devicePixelRatio. */
  maxDpr: number;
  /** Texture set folder inside /textures. */
  textureSet: 'hd' | 'sd';
  sphereSegments: number;
  /** Separate, independently rotating cloud shell (otherwise clouds are baked into the surface). */
  cloudShell: boolean;
  anisotropy: number;
  reducedMotion: boolean;
}

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

/**
 * Picks a rendering profile from cheap, synchronous hints.
 * A runtime frame-rate governor (see EarthExperience) refines this further.
 */
export function detectQuality(): QualityProfile {
  const nav = navigator as NavigatorWithHints;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forced = new URLSearchParams(window.location.search).get('quality');

  const canRender = hasWebGL2() || 'gpu' in navigator;
  if (!canRender || forced === 'none') {
    return {
      tier: 'none',
      maxDpr: 1,
      textureSet: 'sd',
      sphereSegments: 0,
      cloudShell: false,
      anisotropy: 1,
      reducedMotion,
    };
  }

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 700;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const saveData = nav.connection?.saveData === true;

  const weak = (coarse && smallScreen) || cores <= 4 || memory <= 4 || saveData;
  const tier: QualityTier = forced === 'high' ? 'high' : forced === 'low' || weak ? 'low' : 'high';

  return tier === 'high'
    ? {
        tier,
        maxDpr: 2,
        textureSet: 'hd',
        sphereSegments: 160,
        cloudShell: true,
        anisotropy: 8,
        reducedMotion,
      }
    : {
        tier,
        maxDpr: 1.5,
        textureSet: 'sd',
        sphereSegments: 96,
        cloudShell: false,
        anisotropy: 4,
        reducedMotion,
      };
}
