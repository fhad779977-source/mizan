// Logo / closing lockup. Latin wordmark cascades by letter; the Arabic name is
// revealed as one shaped word through a mask. Re-flows for portrait/landscape.
import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, prog } from "../motion/easing";
import { Hairline } from "./Hairline";
import { KineticTitle } from "./KineticTitle";
import { MaskReveal } from "./MaskReveal";

export const EndLockup: React.FC<{
  wordmark: string;
  arabic: string;
  tagline: string;
  start?: number;
  landscape: boolean;
  u: number;
  colors: { fg: string; muted: string; silver: string; accent: string };
  fonts: { display: string; latin: string };
}> = ({ wordmark, arabic, tagline, start = 0, landscape, u, colors, fonts }) => {
  const frame = useCurrentFrame();
  const wordSize = (landscape ? 230 : 200) * u;
  const arabicSize = (landscape ? 150 : 128) * u;
  const dot = prog(frame, start + 34, 16, EASE.out);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 * u }}>
      <div style={{ display: "flex", flexDirection: landscape ? "row" : "column", alignItems: "center", gap: (landscape ? 64 : 28) * u }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 * u }}>
          <KineticTitle
            text={wordmark}
            mode="letters"
            start={start + 4}
            stagger={3}
            duration={26}
            fontFamily={fonts.latin}
            fontSize={wordSize}
            fontWeight={800}
            color={colors.fg}
            lineHeight={1}
            letterSpacing="-0.035em"
          />
          <div
            style={{
              width: 22 * u,
              height: 22 * u,
              borderRadius: 99,
              background: colors.accent,
              marginBottom: wordSize * 0.14,
              scale: String(dot),
            }}
          />
        </div>
        <Hairline
          start={start}
          duration={24}
          length={landscape ? arabicSize * 1.1 : 360 * u}
          vertical={landscape}
          color={colors.silver}
          origin="center"
          thickness={Math.max(1, 2 * u)}
        />
        <MaskReveal start={start + 14} duration={30} from={landscape ? "left" : "bottom"}>
          <div dir="rtl" style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: arabicSize, color: colors.fg, lineHeight: 1.35, padding: `0 ${8 * u}px` }}>
            {arabic}
          </div>
        </MaskReveal>
      </div>
      <KineticTitle
        text={tagline}
        mode="letters"
        start={start + 30}
        stagger={1}
        duration={18}
        fontFamily={fonts.latin}
        fontSize={30 * u}
        fontWeight={500}
        color={colors.silver}
        letterSpacing="0.5em"
        style={{ marginInlineStart: "0.5em" }}
      />
    </div>
  );
};
