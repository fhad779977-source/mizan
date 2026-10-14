// Remotion CLI / Studio configuration for FAHAD STUDIO.
// Quality presets used by scripts live in presets/quality.json; these are the
// defaults when running `npx remotion ...` directly.
import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

Config.setEntryPoint("src/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");
Config.setColorSpace("bt709");

// 3D scenes need WebGL. "swangle" (SwiftShader via ANGLE) works on machines
// without a GPU; override with FAHAD_GL=angle on a machine with a real GPU.
Config.setChromiumOpenGlRenderer(
  (process.env.FAHAD_GL as "swangle" | "angle" | "egl" | undefined) ?? "swangle",
);

// Prefer an explicitly configured browser, then a pre-installed headless
// shell; otherwise Remotion downloads and manages its own.
const browserCandidates = [
  process.env.FAHAD_BROWSER,
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
].filter(Boolean) as string[];
const browser = browserCandidates.find((p) => existsSync(p));
if (browser) Config.setBrowserExecutable(browser);
