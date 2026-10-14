// Animated headline for Arabic and Latin text.
// Arabic is only ever split at word boundaries (or not at all), so letters
// keep their joined forms; each unit rises out of its own mask. Latin can be
// split into graphemes for a typographic letter cascade.
import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, prog } from "../motion/easing";
import { graphemes, hasArabic } from "./text";

export type KineticMode = "auto" | "line" | "words" | "letters";

export type KineticTitleProps = {
  text: string;
  start?: number;
  mode?: KineticMode;
  stagger?: number;
  duration?: number;
  exitAt?: number;
  exitDuration?: number;
  fontFamily: string;
  fontSize: number;
  fontWeight?: number;
  color: string;
  lineHeight?: number;
  letterSpacing?: string;
  align?: React.CSSProperties["textAlign"];
  style?: React.CSSProperties;
};

const resolveMode = (text: string, mode: KineticMode): Exclude<KineticMode, "auto"> => {
  if (hasArabic(text)) return mode === "line" ? "line" : "words";
  if (mode !== "auto") return mode;
  return text.length <= 16 ? "letters" : "words";
};

export const KineticTitle: React.FC<KineticTitleProps> = ({
  text,
  start = 0,
  mode = "auto",
  stagger = 3,
  duration = 22,
  exitAt,
  exitDuration = 14,
  fontFamily,
  fontSize,
  fontWeight = 800,
  color,
  lineHeight = 1.15,
  letterSpacing,
  align,
  style,
}) => {
  const frame = useCurrentFrame();
  const m = resolveMode(text, mode);
  const rtl = hasArabic(text);
  const lines = text.split("\n");
  let unitIndex = 0;

  const unit = (content: string, key: string) => {
    const i = unitIndex++;
    const enter = prog(frame, start + i * stagger, duration, EASE.out);
    const exit = exitAt === undefined ? 0 : prog(frame, exitAt + i * Math.ceil(stagger / 2), exitDuration, EASE.in);
    // Travel must exceed the glyph box plus the mask's padding (0.22em each
    // side) so no sliver of the word shows before entry or after exit.
    const y = (1 - enter) * 140 - exit * 140;
    return (
      <span
        key={key}
        style={{
          display: "inline-block",
          overflow: "hidden",
          // Room for Arabic marks and descenders so the mask never clips them.
          paddingBlock: "0.22em",
          marginBlock: "-0.22em",
          paddingInline: "0.04em",
          marginInline: "-0.04em",
          verticalAlign: "top",
        }}
      >
        <span style={{ display: "inline-block", translate: `0 ${y}%`, whiteSpace: "pre" }}>{content}</span>
      </span>
    );
  };

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color,
        lineHeight,
        letterSpacing,
        textAlign: align,
        unicodeBidi: "plaintext",
        // Arabic marks below the baseline (e.g. hamza under alef) need room
        // before the next block.
        paddingBlockEnd: rtl ? "0.12em" : undefined,
        ...style,
      }}
    >
      {lines.map((line, li) => (
        <div key={li}>
          {m === "line"
            ? unit(line, `l${li}`)
            : m === "words"
              ? line.split(" ").map((w, wi, arr) => (
                  <React.Fragment key={wi}>
                    {unit(w, `w${li}-${wi}`)}
                    {wi < arr.length - 1 ? " " : null}
                  </React.Fragment>
                ))
              : graphemes(line).map((g, gi) => (g === " " ? <span key={gi}>&nbsp;</span> : unit(g, `g${li}-${gi}`)))}
        </div>
      ))}
    </div>
  );
};
