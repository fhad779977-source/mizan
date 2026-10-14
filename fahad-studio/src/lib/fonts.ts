// Local, licensed (SIL OFL 1.1) fonts loaded before any frame is captured.
// @remotion/fonts' loadFont() holds the render until each face is ready.
// Arabic families contain only the Arabic subset; Latin characters and
// digits fall through to Inter via the font stack, so mixed text renders with
// a consistent Latin face.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import type { FONT_FAMILIES } from "../schema/project";

const faces: Array<{ family: string; file: string; weight: string; style?: string }> = [
  ...["400", "600", "800", "900"].map((w) => ({ family: "FS Kufi", file: `NotoKufiArabic-${w}.woff2`, weight: w })),
  ...["300", "400", "500", "600"].map((w) => ({ family: "FS Plex Arabic", file: `IBMPlexSansArabic-${w}.woff2`, weight: w })),
  ...["300", "400", "500", "600", "700", "800"].map((w) => ({ family: "FS Inter", file: `Inter-${w}.woff2`, weight: w })),
  { family: "FS Serif", file: "InstrumentSerif-Regular.woff2", weight: "400" },
  { family: "FS Serif", file: "InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
];

export const fontsReady = Promise.all(
  faces.map((f) =>
    loadFont({
      family: f.family,
      url: staticFile(`assets/fonts/${f.file}`),
      weight: f.weight,
      style: f.style ?? "normal",
      display: "block",
    }),
  ),
);

const STACKS: Record<(typeof FONT_FAMILIES)[number], string> = {
  kufi: '"FS Kufi", "FS Inter", sans-serif',
  "plex-arabic": '"FS Plex Arabic", "FS Inter", sans-serif',
  inter: '"FS Inter", "FS Plex Arabic", sans-serif',
  "instrument-serif": '"FS Serif", "FS Plex Arabic", serif',
};

export const fontStack = (key: (typeof FONT_FAMILIES)[number]) => STACKS[key];
