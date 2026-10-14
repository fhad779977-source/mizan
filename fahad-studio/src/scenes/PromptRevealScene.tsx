// "Result + product + prompt" — the AI-generation reveal format.
// Act 1: the generated result plays full-bleed (headline = its label).
// Act 2: the result shrinks into a top panel; below it the source product
// (scene.secondaryMedia) and the prompt (scene.body) appear as two cards,
// labelled by items[0] / items[1]. The prompt scrolls slowly at a readable
// size. Result and product may be an image or a video (by file extension).
// Content lives in project.json; nothing here is copy.
import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { EASE, prog, scaled } from "../motion/easing";
import type { SceneProps } from "./types";

const isVideo = (p: string) => /\.(mp4|webm|mov)$/i.test(p);

const Media: React.FC<{ src?: string; fit: "cover" | "contain"; zoom: number; bg: string }> = ({ src, fit, zoom, bg }) => {
  const { fps } = useVideoConfig();
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: fit, scale: String(zoom) };
  if (!src) return <div style={{ width: "100%", height: "100%", background: bg }} />;
  return isVideo(src) ? <Video src={staticFile(src)} muted loop premountFor={fps} objectFit={fit} style={style} /> : <Img src={staticFile(src)} style={style} />;
};

export const PromptRevealScene: React.FC<SceneProps> = ({ scene, dur }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const s = (f: number) => scaled(f, b.speed);
  const [productLabel, promptLabel] = [scene.items?.[0]?.label ?? "", scene.items?.[1]?.label ?? ""];

  // Act timing: hold the full-bleed result, then split.
  const splitAt = Math.round(dur * 0.32);
  const split = prog(frame, splitAt, s(26), EASE.inOut);
  const cards = prog(frame, splitAt + s(14), s(22));
  const label = prog(frame, s(6), s(18));
  const exit = prog(frame, dur - s(10), s(10), EASE.in);

  // Geometry (authored at 1080 short edge). Portrait: result panel on top,
  // cards side by side below. Landscape: result left, cards stacked right.
  const { width: W, height: H, safe, u } = L;
  const gap = 28 * u;
  const labelH = 64 * u;
  const inner = { x: safe.left, y: safe.top, w: W - safe.left - safe.right, h: H - safe.top - safe.bottom };
  const panel = L.isLandscape
    ? { x: inner.x, y: inner.y + labelH, w: inner.w * 0.58, h: inner.h - labelH }
    : { x: inner.x, y: inner.y + labelH, w: inner.w, h: (inner.h - labelH) * 0.5 };
  const cardsBox = L.isLandscape
    ? { x: panel.x + panel.w + gap * 2, y: inner.y, w: inner.w - panel.w - gap * 2, h: inner.h }
    : { x: inner.x, y: panel.y + panel.h + gap * 2, w: inner.w, h: inner.y + inner.h - (panel.y + panel.h + gap * 2) };
  const lerp = (a: number, z: number) => a + (z - a) * split;
  const rect = { x: lerp(0, panel.x), y: lerp(0, panel.y), w: lerp(W, panel.w), h: lerp(H, panel.h), r: lerp(0, 22 * u) };

  // Cards: product + prompt, with a "+" between (RTL: product reads first, on the right).
  const cardW = L.isLandscape ? cardsBox.w : (cardsBox.w - gap * 3) / 2;
  const cardH = L.isLandscape ? (cardsBox.h - labelH * 2 - gap * 3) / 2 : cardsBox.h - labelH;
  const prompt = scene.body ?? "";
  const promptFont = 30 * u;
  // Scroll the prompt from its top to its end over the visible act-2 time.
  const scrollStart = splitAt + s(40);
  const scroll = interpolate(frame, [scrollStart, dur - s(14)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.soft });
  const approxLines = Math.ceil((prompt.length * promptFont * 0.5) / Math.max(1, cardW - 56 * u)) + prompt.split("\n").length;
  const textH = approxLines * promptFont * 1.45;
  const travel = Math.max(0, textH - (cardH - 56 * u));

  const tag = (text: string, o: number): React.ReactNode => (
    <div dir="rtl" style={{ height: labelH, display: "flex", alignItems: "center", fontFamily: b.font.display, fontWeight: b.dw(800), fontSize: 46 * u, color: b.colors.foreground, opacity: o, translate: `0 ${(1 - o) * 18 * u}px` }}>
      {text}
    </div>
  );

  const card = (children: React.ReactNode, style: React.CSSProperties) => (
    <div style={{ position: "relative", width: cardW, height: cardH, borderRadius: 18 * u, overflow: "hidden", background: b.colors.surface, border: `1px solid ${b.colors.silver}33`, ...style }}>{children}</div>
  );

  const productCard = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {tag(productLabel, cards)}
      {card(<Media src={scene.secondaryMedia} fit="contain" zoom={1 + frame * 0.0004} bg={b.colors.surface} />, { background: "#F4F2EE", opacity: cards, translate: `0 ${(1 - cards) * 40 * u}px` })}
    </div>
  );
  const promptCard = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {tag(promptLabel, prog(frame, splitAt + s(20), s(22)))}
      {card(
        <>
          <div dir="ltr" style={{ position: "absolute", left: 28 * u, right: 28 * u, top: 28 * u, translate: `0 ${-travel * scroll}px`, fontFamily: b.font.latin, fontSize: promptFont, lineHeight: 1.45, color: b.colors.foreground, whiteSpace: "pre-wrap" }}>{prompt}</div>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${b.colors.surface}, transparent 14%, transparent 84%, ${b.colors.surface})` }} />
        </>,
        { opacity: prog(frame, splitAt + s(20), s(22)), translate: `0 ${(1 - prog(frame, splitAt + s(20), s(22))) * 40 * u}px` },
      )}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: b.colors.background, opacity: 1 - exit }}>
      {/* Result label: big over the footage in act 1, settles above the panel in act 2. */}
      <div style={{ position: "absolute", left: inner.x, top: inner.y, width: rect.w > W * 0.99 ? inner.w : panel.w, zIndex: 2 }}>
        <div dir="rtl" style={{ height: labelH, display: "flex", alignItems: "center", fontFamily: b.font.display, fontWeight: b.dw(800), fontSize: lerp(76, 46) * u, color: split < 0.5 ? "#fff" : b.colors.foreground, opacity: label, textShadow: split < 0.5 ? "0 2px 24px rgba(0,0,0,.45)" : "none" }}>
          {scene.headline}
        </div>
      </div>
      <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: rect.r, overflow: "hidden", background: "#000" }}>
        <Media src={scene.media} fit="cover" zoom={1.08 - frame * 0.00025} bg={b.colors.surface} />
      </div>
      <div
        style={{
          position: "absolute",
          left: cardsBox.x,
          top: cardsBox.y,
          width: cardsBox.w,
          height: cardsBox.h,
          display: "flex",
          flexDirection: L.isLandscape ? "column" : "row",
          alignItems: L.isLandscape ? "stretch" : "flex-start",
          justifyContent: "space-between",
          gap: gap,
        }}
      >
        {/* RTL order: product on the right / first. */}
        {L.isLandscape ? productCard : promptCard}
        <div style={{ alignSelf: "center", marginTop: L.isLandscape ? 0 : labelH, fontFamily: b.font.latin, fontSize: 54 * u, color: b.colors.accent, opacity: cards, fontWeight: 300 }}>+</div>
        {L.isLandscape ? promptCard : productCard}
      </div>
    </AbsoluteFill>
  );
};
