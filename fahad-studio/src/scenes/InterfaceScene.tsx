// Digital interface: an original site in a device frame. The screen starts as
// the wireframe, a before/after divider reveals the designed interface, then
// the page scrolls and a pointer taps the call to action. Phone in portrait,
// browser window in landscape — the site itself switches to its mobile or
// desktop layout.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BeforeAfter } from "../components/BeforeAfter";
import { Cursor } from "../components/Cursor";
import { DEVICES, DeviceFrame, deviceSize } from "../components/DeviceFrame";
import { IndexLabel } from "../components/IndexLabel";
import { KineticTitle } from "../components/KineticTitle";
import { StudioSite, siteHeight } from "../components/ui/StudioSite";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { EASE, prog, scaled, settle } from "../motion/easing";
import { pad2, type SceneProps } from "./types";

export const InterfaceScene: React.FC<SceneProps> = ({ scene, dur, index, total }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (f: number) => scaled(f, b.speed);
  const kind = L.isPortrait ? "phone" : "browser";
  const dev = DEVICES[kind];
  const outerW = L.isPortrait ? 500 * L.u : L.width * 0.5;
  const size = deviceSize(kind, outerW);
  const t = {
    bg: b.colors.background,
    surface: b.colors.surface,
    fg: b.colors.foreground,
    muted: b.colors.muted,
    silver: b.colors.silver,
    accent: b.colors.accent,
    display: b.font.display,
    body: b.font.body,
    latin: b.font.latin,
  };
  // Timeline (scene-local frames)
  const revealStart = s(14);
  const revealDur = s(62);
  const scrollStart = revealStart + revealDur + s(6);
  const maxScroll = siteHeight(dev.vw) - dev.vh;
  const scroll = interpolate(frame, [scrollStart, scrollStart + s(46), scrollStart + s(58), dur - s(6)], [0, maxScroll * 0.38, maxScroll * 0.38, maxScroll * 0.72], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });
  const enter = settle(frame, fps, 0, 90);
  const tilt = (1 - enter) * 14;
  const screen = (wire: boolean) => <StudioSite viewportWidth={dev.vw} viewportHeight={dev.vh} scroll={scroll} wireframe={wire} t={t} />;
  // Device placement
  const devX = L.isPortrait ? (L.width - size.outerW) / 2 : L.width - L.safe.right - size.outerW;
  const devY = L.isPortrait ? L.safe.top + 230 * L.u : (L.height - size.outerH) / 2;
  // Pointer in logical screen coordinates → frame coordinates
  const toFrame = (x: number, y: number) => ({
    x: devX + (kind === "phone" ? size.bezel : 0) + x * size.scale,
    y: devY + (kind === "phone" ? size.bezel : size.chrome) + y * size.scale,
  });
  const clickF = scrollStart + s(50);
  const p1 = toFrame(dev.vw * 0.72, dev.vh * 0.62);
  const p2 = toFrame(dev.vw * 0.5, dev.vh * 0.5);
  return (
    <AbsoluteFill style={{ background: b.colors.background }}>
      <AbsoluteFill style={{ background: `radial-gradient(70% 45% at ${L.isPortrait ? "50% 60%" : "70% 50%"}, ${b.colors.surface}, ${b.colors.background} 75%)` }} />
      <div
        style={{
          position: "absolute",
          top: L.isPortrait ? L.safe.top : L.height * 0.3,
          left: L.safe.left,
          right: L.isPortrait ? L.safe.right : L.width - devX + 80 * L.u,
          display: "flex",
          flexDirection: "column",
          alignItems: L.isPortrait ? "center" : "flex-end",
          gap: 18 * L.u,
        }}
      >
        <IndexLabel index={`${pad2(index + 1)}/${pad2(total)}`} label={scene.eyebrow ?? ""} start={s(4)} fontFamily={b.font.latin} fontSize={22 * L.u} color={b.colors.muted} accent={b.colors.accent} />
        <KineticTitle
          text={scene.headline ?? ""}
          start={s(8)}
          stagger={s(5)}
          duration={s(24)}
          exitAt={dur - s(16)}
          fontFamily={b.font.display}
          fontSize={(L.isPortrait ? 64 : 80) * L.u}
          fontWeight={b.dw(800)}
          color={b.colors.foreground}
          lineHeight={1.35}
          align={L.isPortrait ? "center" : "right"}
        />
        {scene.headlineLatin ? (
          <KineticTitle text={scene.headlineLatin} mode="words" start={s(16)} stagger={s(2)} duration={s(18)} exitAt={dur - s(14)} fontFamily={b.font.latin} fontSize={(L.isPortrait ? 24 : 20) * L.u} fontWeight={500} color={b.colors.silver} letterSpacing="0.3em" />
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: devX,
          top: devY,
          transformOrigin: "50% 100%",
          transform: `perspective(${2400 * L.u}px) rotateX(${tilt}deg)`,
          translate: `0 ${(1 - enter) * 120 * L.u}px`,
          opacity: prog(frame, 0, s(8)),
        }}
      >
        <DeviceFrame kind={kind} width={outerW} frameColor="#0d0d10" edgeColor={`${b.colors.silver}55`} textColor={b.colors.muted} latinFont={b.font.latin}>
          <BeforeAfter
            width={dev.vw}
            height={dev.vh}
            before={screen(true)}
            after={screen(false)}
            start={revealStart}
            duration={revealDur}
            hold={0.5}
            labels={{ before: "WIREFRAME", after: "INTERFACE" }}
            lineColor={b.colors.foreground}
            accent={b.colors.accent}
            font={b.font.latin}
          />
        </DeviceFrame>
      </div>
      <Cursor
        keys={[
          { f: scrollStart + s(14), x: p2.x, y: p2.y + 160 * L.u },
          { f: clickF - s(4), x: p1.x, y: p1.y },
          { f: dur, x: p1.x - 40 * L.u, y: p1.y + 30 * L.u },
        ]}
        clicks={[clickF]}
        size={30 * L.u}
        color={b.colors.foreground}
        ring={b.colors.accent}
      />
    </AbsoluteFill>
  );
};
