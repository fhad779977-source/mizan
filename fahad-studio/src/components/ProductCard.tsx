// Product / image card: image kept at its native aspect (object-fit: contain
// inside a fixed frame), title block and spec rows that stagger in.
import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { EASE, prog } from "../motion/easing";
import { MaskReveal } from "./MaskReveal";

export const ProductCard: React.FC<{
  image: string; // path in public/
  title: string;
  latin?: string;
  specs?: Array<{ label: string; value?: string; latin?: string }>;
  start?: number;
  width: number;
  imageAspect?: number; // frame aspect w/h
  fit?: "contain" | "cover";
  colors: { surface: string; fg: string; muted: string; line: string; accent: string; imageBg: string };
  fonts: { display: string; body: string; latin: string };
  style?: React.CSSProperties;
}> = ({ image, title, latin, specs = [], start = 0, width, imageAspect = 4 / 5, fit = "contain", colors, fonts, style }) => {
  const frame = useCurrentFrame();
  const pad = width * 0.06;
  const imgP = prog(frame, start, 40, EASE.out);
  return (
    <MaskReveal start={start} duration={28} from="bottom" parallax={0.05} style={{ width, ...style }}>
      <div style={{ width, background: colors.surface, borderRadius: width * 0.035, overflow: "hidden" }}>
        <div style={{ width, height: width / imageAspect, background: colors.imageBg, overflow: "hidden", position: "relative" }}>
          <Img
            src={staticFile(image)}
            style={{ width: "100%", height: "100%", objectFit: fit, scale: String(1.08 - imgP * 0.08) }}
          />
        </div>
        <div dir="rtl" style={{ padding: pad, display: "flex", flexDirection: "column", gap: pad * 0.35 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: pad }}>
            <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: width * 0.075, color: colors.fg, lineHeight: 1.3 }}>{title}</div>
            {latin ? (
              <div dir="ltr" style={{ fontFamily: fonts.latin, fontSize: width * 0.03, letterSpacing: "0.2em", color: colors.muted, whiteSpace: "nowrap" }}>
                {latin}
              </div>
            ) : null}
          </div>
          {specs.map((s, i) => {
            const p = prog(frame, start + 16 + i * 5, 22, EASE.out);
            return (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: `1px solid ${colors.line}`,
                  paddingTop: pad * 0.3,
                  opacity: p,
                  translate: `0 ${(1 - p) * 20}px`,
                  fontFamily: fonts.body,
                  fontSize: width * 0.04,
                  color: colors.fg,
                }}
              >
                <span>{s.label}</span>
                <span dir="auto" style={{ color: colors.muted, fontFamily: s.latin ? fonts.latin : fonts.body }}>
                  {s.value ?? s.latin}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </MaskReveal>
  );
};
