// Component library preview: one labelled segment per reusable building block.
// Open "component-library" in Studio to scrub through every component.
import { Audio, Video as MediaVideo } from "@remotion/media";
import type { Caption } from "@remotion/captions";
import { TransitionSeries } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import project from "../../projects/digital-craft/project.json";
import captions from "../../public/assets/subtitles/web-showcase.ar.captions.json";
import { BeforeAfter } from "../components/BeforeAfter";
import { DeviceFrame, DEVICES } from "../components/DeviceFrame";
import { EndLockup } from "../components/EndLockup";
import { KineticTitle } from "../components/KineticTitle";
import { MaskReveal } from "../components/MaskReveal";
import { ProductCard } from "../components/ProductCard";
import { Subtitles } from "../components/Subtitles";
import { StudioSite, siteHeight } from "../components/ui/StudioSite";
import { BrandProvider, useBrand } from "../lib/brand";
import "../lib/fonts";
import { EASE } from "../motion/easing";
import { iris, maskWipe, matchFrame } from "../motion/transitions";
import { linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { ProjectSchema } from "../schema/project";
import { Monogram, Plinth } from "../three/objects";
import { StudioStage, type Vec3 } from "../three/StudioStage";

const P = ProjectSchema.parse(project);
const SEG = 90;

const Label: React.FC<{ name: string; file: string; i: number }> = ({ name, file, i }) => {
  const b = useBrand();
  return (
    <div style={{ position: "absolute", left: 64, top: 48, right: 64, display: "flex", justifyContent: "space-between", fontFamily: b.font.latin, color: b.colors.muted, fontSize: 22, letterSpacing: "0.12em" }}>
      <span>
        <span style={{ color: b.colors.accent }}>{String(i + 1).padStart(2, "0")}</span>&nbsp;&nbsp;{name.toUpperCase()}
      </span>
      <span style={{ letterSpacing: 0 }}>{file}</span>
    </div>
  );
};

const useT = () => {
  const b = useBrand();
  return { bg: b.colors.background, surface: b.colors.surface, fg: b.colors.foreground, muted: b.colors.muted, silver: b.colors.silver, accent: b.colors.accent, display: b.font.display, body: b.font.body, latin: b.font.latin };
};

const Titles: React.FC = () => {
  const b = useBrand();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
      <KineticTitle text="نصنع حضورًا رقميًا" start={4} stagger={6} fontFamily={b.font.display} fontSize={130} fontWeight={900} color={b.colors.foreground} />
      <KineticTitle text="DIGITAL CRAFT" mode="letters" start={16} stagger={2} fontFamily={b.font.latin} fontSize={90} fontWeight={800} color={b.colors.silver} letterSpacing="0.06em" />
    </AbsoluteFill>
  );
};

const Masks: React.FC = () => {
  const b = useBrand();
  const line = (text: string, from: "left" | "right" | "bottom", start: number) => (
    <MaskReveal from={from} start={start} duration={30}>
      <div dir="rtl" style={{ fontFamily: b.font.display, fontSize: 92, fontWeight: 800, color: b.colors.foreground, lineHeight: 1.5 }}>{text}</div>
    </MaskReveal>
  );
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 10 }}>
      {line("الحروفُ تبقى متّصلةً أثناء الحركة", "right", 2)}
      {line("قناعٌ يكشف السطر كاملًا ٢٠٢٦ — 2026", "left", 14)}
      {line("بلا تفكيكٍ للكلمات", "bottom", 26)}
    </AbsoluteFill>
  );
};

const Cards: React.FC = () => {
  const b = useBrand();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 60 }}>
      <ProductCard
        image="assets/images/vessel-study.png"
        title="المنتج ٠١"
        latin="OBJECT STUDY"
        specs={[{ label: "الخامة", value: "سيراميك مطفأ" }, { label: "السعة", latin: "500 ML" }]}
        start={0}
        width={460}
        imageAspect={1}
        colors={{ surface: b.colors.surface, fg: b.colors.foreground, muted: b.colors.muted, line: `${b.colors.muted}44`, accent: b.colors.accent, imageBg: "#E9E5DD" }}
        fonts={b.font}
      />
      <ProductCard image="assets/images/vessel-study.png" title="صورة مربعة" latin="FIT: COVER" start={8} width={360} imageAspect={16 / 10} fit="cover" colors={{ surface: b.colors.surface, fg: b.colors.foreground, muted: b.colors.muted, line: `${b.colors.muted}44`, accent: b.colors.accent, imageBg: "#E9E5DD" }} fonts={b.font} />
    </AbsoluteFill>
  );
};

const Devices: React.FC = () => {
  const b = useBrand();
  const t = useT();
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [10, 80], [0, siteHeight(393) - 852 - 600], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.inOut });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 80 }}>
      <DeviceFrame kind="browser" width={980} frameColor="#0c0d0f" edgeColor={`${b.colors.silver}44`} textColor={b.colors.muted} latinFont={b.font.latin}>
        <Video src={staticFile("assets/video/site-scroll.mp4")} />
      </DeviceFrame>
      <DeviceFrame kind="phone" width={330} frameColor="#0d0d10" edgeColor={`${b.colors.silver}55`}>
        <StudioSite viewportWidth={DEVICES.phone.vw} viewportHeight={DEVICES.phone.vh} scroll={scroll} t={t} />
      </DeviceFrame>
    </AbsoluteFill>
  );
};

const Video: React.FC<{ src: string }> = ({ src }) => {
  const { fps } = useVideoConfig();
  return <MediaVideo src={src} muted premountFor={fps} objectFit="cover" style={{ width: DEVICES.browser.vw, height: DEVICES.browser.vh }} />;
};

const Compare: React.FC = () => {
  const b = useBrand();
  const t = useT();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 1440 * 0.75, height: 900 * 0.75, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ scale: "0.75", transformOrigin: "0 0", width: 1440, height: 900 }}>
          <BeforeAfter width={1440} height={900} before={<StudioSite viewportWidth={1440} viewportHeight={900} scroll={0} wireframe t={t} />} after={<StudioSite viewportWidth={1440} viewportHeight={900} scroll={0} t={t} />} start={4} duration={80} labels={{ before: "BEFORE", after: "AFTER" }} lineColor={b.colors.foreground} accent={b.colors.accent} font={b.font.latin} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Subs: React.FC = () => {
  const b = useBrand();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div dir="ltr" style={{ fontFamily: b.font.latin, color: b.colors.muted, fontSize: 24, letterSpacing: "0.1em" }}>public/assets/subtitles/web-showcase.ar.srt → npm run import-srt</div>
      <Subtitles captions={captions as Caption[]} bottom={140} maxWidth={1400} fontFamily={b.font.body} fontSize={46} color={b.colors.foreground} background="rgba(255,255,255,0.08)" />
    </AbsoluteFill>
  );
};

const Panel: React.FC<{ color: string; text: string }> = ({ color, text }) => {
  const b = useBrand();
  return (
    <AbsoluteFill style={{ background: color, justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontFamily: b.font.latin, fontSize: 64, fontWeight: 800, color: b.colors.background, letterSpacing: "0.1em" }}>{text}</div>
    </AbsoluteFill>
  );
};

const Transitions: React.FC = () => {
  const b = useBrand();
  const { fps } = useVideoConfig();
  const tm = linearTiming({ durationInFrames: 14, easing: EASE.inOut });
  return (
    <AbsoluteFill style={{ padding: "140px 160px 100px" }}>
      <div style={{ position: "relative", flex: 1, borderRadius: 18, overflow: "hidden" }}>
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={34} premountFor={fps}><Panel color={b.colors.silver} text="MASK WIPE" /></TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={maskWipe({ direction: "left", edgeColor: b.colors.accent, skew: 12 })} timing={tm} />
          <TransitionSeries.Sequence durationInFrames={34} premountFor={fps}><Panel color={b.colors.foreground} text="IRIS" /></TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={iris({ cx: 0.7, cy: 0.4 })} timing={tm} />
          <TransitionSeries.Sequence durationInFrames={34} premountFor={fps}><Panel color={b.colors.accent} text="MATCH FRAME" /></TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={matchFrame({ from: { x: 0.35, y: 0.35, w: 0.3, h: 0.3 }, edgeColor: b.colors.foreground, radius: 18 })} timing={tm} />
          <TransitionSeries.Sequence durationInFrames={34} premountFor={fps}><Panel color={b.colors.muted} text="SLIDE" /></TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={tm} />
          <TransitionSeries.Sequence durationInFrames={34} premountFor={fps}><Panel color={b.colors.silver} text="END" /></TransitionSeries.Sequence>
        </TransitionSeries>
      </div>
    </AbsoluteFill>
  );
};

const ThreeD: React.FC = () => {
  const b = useBrand();
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const a = interpolate(frame, [0, SEG], [-0.6, 0.5]);
  return (
    <StudioStage
      width={width}
      height={height}
      background={b.colors.background}
      camera={{ position: [Math.sin(a) * 8, 1.8, Math.cos(a) * 8] as Vec3, target: [0, 1.2, 0], fov: 28 }}
      keyLight={{ position: [interpolate(frame, [0, SEG], [-6, 6]), 6.5, 4.5] as Vec3, intensity: 5 }}
      rimColor={b.colors.silver}
      accentColor={b.colors.accent}
    >
      <Plinth color="#0d0d10" edge={b.colors.silver} />
      <Monogram color={b.colors.silver} position={[0, 0.14, 0]} />
    </StudioStage>
  );
};

const Lockup: React.FC = () => {
  const b = useBrand();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <EndLockup wordmark={b.logo.wordmark} arabic={b.logo.arabic} tagline={b.logo.tagline} start={0} landscape u={1} colors={{ fg: b.colors.foreground, muted: b.colors.muted, silver: b.colors.silver, accent: b.colors.accent }} fonts={b.font} />
    </AbsoluteFill>
  );
};

const CUES = [
  { f: 6, src: "assets/audio/sfx/whoosh.wav", v: 0.5, n: "whoosh" },
  { f: 20, src: "assets/audio/sfx/impact.wav", v: 0.7, n: "impact" },
  { f: 46, src: "assets/audio/sfx/tick.wav", v: 0.5, n: "tick" },
  { f: 56, src: "assets/audio/sfx/shimmer.wav", v: 0.45, n: "shimmer" },
];

const Mix: React.FC = () => {
  const b = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, 15, SEG - 20, SEG - 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = (f: number) => 160 + (f / SEG) * 1600;
  return (
    <AbsoluteFill>
      <Audio src={staticFile("assets/audio/music/ambient-bed.wav")} premountFor={fps} volume={0.5 * fade} />
      {CUES.map((c) => (
        <Audio key={c.n} src={staticFile(c.src)} from={c.f} premountFor={fps} volume={c.v} />
      ))}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <polyline
          fill="none"
          stroke={b.colors.silver}
          strokeWidth={3}
          points={Array.from({ length: SEG }, (_, f) => `${x(f)},${700 - 200 * interpolate(f, [0, 15, SEG - 20, SEG - 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}`).join(" ")}
        />
        {CUES.map((c) => (
          <g key={c.n}>
            <line x1={x(c.f)} x2={x(c.f)} y1={380} y2={760} stroke={frame >= c.f ? b.colors.accent : b.colors.muted} strokeWidth={2} />
            <text x={x(c.f) + 10} y={400} fill={b.colors.foreground} fontFamily="FS Inter" fontSize={24}>{c.n}</text>
          </g>
        ))}
        <line x1={x(frame)} x2={x(frame)} y1={360} y2={780} stroke={b.colors.foreground} strokeWidth={3} />
        <text x={160} y={820} fill={b.colors.muted} fontFamily="FS Inter" fontSize={22}>MUSIC BED: FADE IN 0.5s · HOLD · FADE OUT 0.67s — SFX CUES AT FIXED FRAMES</text>
      </svg>
    </AbsoluteFill>
  );
};

const SEGMENTS: Array<{ name: string; file: string; len: number; C: React.FC }> = [
  { name: "KineticTitle — Arabic words / Latin letters", file: "src/components/KineticTitle.tsx", len: SEG, C: Titles },
  { name: "MaskReveal — shaped Arabic lines", file: "src/components/MaskReveal.tsx", len: SEG, C: Masks },
  { name: "ProductCard — image cards", file: "src/components/ProductCard.tsx", len: SEG, C: Cards },
  { name: "DeviceFrame — screen recording + live UI", file: "src/components/DeviceFrame.tsx", len: SEG, C: Devices },
  { name: "BeforeAfter", file: "src/components/BeforeAfter.tsx", len: SEG, C: Compare },
  { name: "Subtitles — timed from SRT", file: "src/components/Subtitles.tsx", len: 150, C: Subs },
  { name: "Transitions — mask / iris / match / slide", file: "src/motion/transitions.tsx", len: 34 * 5 - 14 * 4, C: Transitions },
  { name: "StudioStage — 3D camera, light, material", file: "src/three/StudioStage.tsx", len: SEG, C: ThreeD },
  { name: "EndLockup — logo & closing", file: "src/components/EndLockup.tsx", len: SEG, C: Lockup },
  { name: "AudioMix — bed fades + SFX cues", file: "src/components/AudioMix.tsx", len: SEG, C: Mix },
];
export const LIBRARY_DURATION = SEGMENTS.reduce((a, s) => a + s.len, 0);

export const Library: React.FC = () => {
  const { fps } = useVideoConfig();
  let from = 0;
  return (
    <BrandProvider project={P}>
      <AbsoluteFill style={{ background: P.brand.colors.background }}>
        {SEGMENTS.map((s, i) => {
          const at = from;
          from += s.len;
          return (
            <Sequence key={s.name} name={s.name} from={at} durationInFrames={s.len} premountFor={fps}>
              <s.C />
              <Label name={s.name} file={s.file} i={i} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </BrandProvider>
  );
};
