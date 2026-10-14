// Project data schema — the single contract between content (projects/*.json)
// and motion logic (src/scenes, src/components). Validated by `npm run check`
// and used by Remotion Studio to render editable props in the sidebar.
import { zColor } from "@remotion/zod-types";
import { z } from "zod";

export const FONT_FAMILIES = ["kufi", "plex-arabic", "inter", "instrument-serif"] as const;

export const TransitionSchema = z.object({
  type: z.enum(["cut", "maskWipe", "slide", "iris", "matchFrame"]),
  durationInFrames: z.number().int().min(0).max(60),
  direction: z.enum(["left", "right", "up", "down"]).default("left"),
});

export const SfxCueSchema = z.object({
  // Path relative to public/, e.g. "assets/audio/sfx/whoosh.wav"
  src: z.string(),
  // Seconds from the start of the scene the cue belongs to.
  at: z.number().min(0),
  volume: z.number().min(0).max(1).default(0.6),
});

export const SceneItemSchema = z.object({
  label: z.string(),
  latin: z.string().optional(),
  value: z.string().optional(),
});

export const SCENE_TYPES = [
  "hero-title",
  "type-grid",
  "interface",
  "three-object",
  "logo-end",
  "product-hero",
  "feature-cards",
  "screen-recording",
  "before-after",
  "palette",
  "statement",
  "prompt-reveal",
] as const;

export const SceneSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(SCENE_TYPES),
  durationInSeconds: z.number().positive().max(60),
  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  headlineLatin: z.string().optional(),
  body: z.string().optional(),
  items: z.array(SceneItemSchema).optional(),
  // Asset path relative to public/ (image, video or model).
  media: z.string().optional(),
  // Second asset for two-media scenes (e.g. the source product in prompt-reveal).
  secondaryMedia: z.string().optional(),
  // Free-form variant switch interpreted by the scene (e.g. "light", "wire").
  variant: z.string().optional(),
  transitionOut: TransitionSchema.optional(),
  sfx: z.array(SfxCueSchema).default([]),
});

export const SAFE_AREA_PRESETS = [
  "none",
  "reels",
  "tiktok",
  "shorts",
  "feed",
  "youtube",
] as const;

export const FormatSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  width: z.number().int().min(320).max(4096),
  height: z.number().int().min(320).max(4096),
  safeArea: z.enum(SAFE_AREA_PRESETS).default("none"),
});

export const BrandSchema = z.object({
  name: z.string(),
  colors: z.object({
    background: zColor(),
    surface: zColor(),
    foreground: zColor(),
    muted: zColor(),
    silver: zColor(),
    accent: zColor(),
  }),
  fonts: z.object({
    display: z.enum(FONT_FAMILIES),
    body: z.enum(FONT_FAMILIES),
    latin: z.enum(FONT_FAMILIES),
  }),
  logo: z.object({
    wordmark: z.string(),
    arabic: z.string(),
    tagline: z.string(),
  }),
});

export const CaptionSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  timestampMs: z.number().nullable(),
  confidence: z.number().nullable(),
});

export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  template: z.enum(["digital-craft", "product-ad", "web-showcase", "identity-reel", "prompt-reel", "library"]),
  language: z.enum(["ar", "en", "mixed"]),
  direction: z.enum(["rtl", "ltr"]),
  fps: z.number().int().min(12).max(60),
  targetDurationInSeconds: z.number().positive(),
  formats: z.array(FormatSchema).min(1),
  brief: z.object({
    goal: z.string(),
    audience: z.string(),
    message: z.string(),
    assumptions: z.array(z.string()).default([]),
  }),
  brand: BrandSchema,
  motion: z.object({
    // 1 = default pacing; >1 faster, <1 slower. Scales in-scene animation timings.
    speed: z.number().min(0.5).max(2).default(1),
    // Musical grid used to place cuts and accents.
    bpm: z.number().min(60).max(180).default(120),
  }),
  scenes: z.array(SceneSchema).min(1),
  audio: z.object({
    music: z
      .object({
        src: z.string(),
        volume: z.number().min(0).max(1),
        fadeInSeconds: z.number().min(0),
        fadeOutSeconds: z.number().min(0),
      })
      .nullable(),
    sfxVolume: z.number().min(0).max(1).default(1),
  }),
  subtitles: z.object({
    enabled: z.boolean(),
    items: z.array(CaptionSchema).default([]),
  }),
  // Every file under public/ this project depends on; verified by `npm run check`.
  assets: z.array(z.string()).default([]),
  showSafeArea: z.boolean().default(false),
});

export type Project = z.infer<typeof ProjectSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type Transition = z.infer<typeof TransitionSchema>;
export type Format = z.infer<typeof FormatSchema>;
