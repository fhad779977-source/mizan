// Device frames drawn in CSS (no third-party device artwork). The screen is a
// logical viewport (e.g. 393×852 phone, 1440×900 desktop) scaled to fit, so
// screen recordings or UI keep their exact aspect ratio.
import React from "react";

export const DEVICES = {
  phone: { vw: 393, vh: 852 },
  browser: { vw: 1440, vh: 900 },
} as const;

export type DeviceKind = keyof typeof DEVICES;

export const deviceSize = (kind: DeviceKind, outerWidth: number) => {
  const d = DEVICES[kind];
  if (kind === "phone") {
    const bezel = outerWidth * 0.035;
    const screenW = outerWidth - bezel * 2;
    const screenH = (screenW * d.vh) / d.vw;
    return { outerW: outerWidth, outerH: screenH + bezel * 2, screenW, screenH, bezel, chrome: 0, scale: screenW / d.vw };
  }
  const chrome = outerWidth * 0.032;
  const screenW = outerWidth;
  const screenH = (screenW * d.vh) / d.vw;
  return { outerW: outerWidth, outerH: screenH + chrome, screenW, screenH, bezel: 0, chrome, scale: screenW / d.vw };
};

/** Renders children at a logical viewport size, scaled to the target width. */
export const ScaledViewport: React.FC<{ logicalW: number; logicalH: number; scale: number; children: React.ReactNode }> = ({
  logicalW,
  logicalH,
  scale,
  children,
}) => (
  <div style={{ width: logicalW * scale, height: logicalH * scale, overflow: "hidden", position: "relative" }}>
    <div style={{ width: logicalW, height: logicalH, scale: String(scale), transformOrigin: "0 0", position: "absolute", top: 0, left: 0 }}>
      {children}
    </div>
  </div>
);

export const DeviceFrame: React.FC<{
  kind: DeviceKind;
  width: number;
  frameColor: string;
  edgeColor: string;
  chromeText?: string;
  textColor?: string;
  latinFont?: string;
  style?: React.CSSProperties;
  children: React.ReactNode; // rendered at logical viewport size
}> = ({ kind, width, frameColor, edgeColor, chromeText = "localhost:3000", textColor = "#888", latinFont, style, children }) => {
  const s = deviceSize(kind, width);
  const d = DEVICES[kind];
  if (kind === "phone") {
    const radius = width * 0.14;
    return (
      <div
        style={{
          width: s.outerW,
          height: s.outerH,
          borderRadius: radius,
          background: frameColor,
          padding: s.bezel,
          boxSizing: "border-box",
          boxShadow: `inset 0 0 0 ${Math.max(1, width * 0.004)}px ${edgeColor}, 0 ${width * 0.08}px ${width * 0.2}px rgba(0,0,0,0.55)`,
          position: "relative",
          ...style,
        }}
      >
        <div style={{ borderRadius: radius - s.bezel, overflow: "hidden", width: s.screenW, height: s.screenH, position: "relative" }}>
          <ScaledViewport logicalW={d.vw} logicalH={d.vh} scale={s.scale}>
            {children}
          </ScaledViewport>
          <div
            style={{
              position: "absolute",
              top: s.screenH * 0.014,
              left: "50%",
              translate: "-50% 0",
              width: s.screenW * 0.3,
              height: s.screenW * 0.085,
              borderRadius: 999,
              background: "#000",
            }}
          />
        </div>
      </div>
    );
  }
  const r = width * 0.012;
  return (
    <div
      style={{
        width: s.outerW,
        height: s.outerH,
        borderRadius: r,
        overflow: "hidden",
        background: frameColor,
        boxShadow: `0 0 0 1px ${edgeColor}, 0 ${width * 0.04}px ${width * 0.1}px rgba(0,0,0,0.5)`,
        ...style,
      }}
    >
      <div style={{ height: s.chrome, display: "flex", alignItems: "center", padding: `0 ${s.chrome * 0.5}px`, gap: s.chrome * 0.22, position: "relative" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: s.chrome * 0.24, height: s.chrome * 0.24, borderRadius: 99, background: `${edgeColor}` }} />
        ))}
        <div
          dir="ltr"
          style={{
            position: "absolute",
            left: "50%",
            translate: "-50% 0",
            height: s.chrome * 0.56,
            width: "34%",
            borderRadius: 99,
            background: "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: latinFont,
            fontSize: s.chrome * 0.3,
            color: textColor,
            letterSpacing: "0.02em",
          }}
        >
          {chromeText}
        </div>
      </div>
      <ScaledViewport logicalW={d.vw} logicalH={d.vh} scale={s.scale}>
        {children}
      </ScaledViewport>
    </div>
  );
};
