// Screen recording in a device frame (browser by default, `variant: "phone"`
// for a phone), with numbered callouts from `items` appearing in sequence.
// The recording is a real video file from public/ (scene.media).
import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { DEVICES, DeviceFrame, deviceSize } from "../components/DeviceFrame";
import { Hairline } from "../components/Hairline";
import { IndexLabel } from "../components/IndexLabel";
import { KineticTitle } from "../components/KineticTitle";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { EASE, prog, scaled, settle } from "../motion/easing";
import { pad2, type SceneProps } from "./types";

export const ScreenRecordingScene: React.FC<SceneProps> = ({ scene, dur, index, total }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (f: number) => scaled(f, b.speed);
  const kind = scene.variant === "phone" ? "phone" : "browser";
  const dev = DEVICES[kind];
  const outerW = L.isPortrait ? (kind === "phone" ? 520 : L.content.w) * (kind === "phone" ? L.u : 1) : L.width * (kind === "phone" ? 0.22 : 0.56);
  const size = deviceSize(kind, outerW);
  const enter = settle(frame, fps, 0, 100);
  const items = scene.items ?? [];
  const slot = items.length ? (dur - s(50)) / items.length : 0;
  return (
    <AbsoluteFill style={{ background: b.colors.background }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 50% at ${L.isPortrait ? "50% 40%" : "68% 50%"}, ${b.colors.surface}, ${b.colors.background} 80%)` }} />
      <AbsoluteFill
        style={{
          flexDirection: L.isPortrait ? "column" : "row-reverse",
          justifyContent: "center",
          alignItems: "center",
          gap: (L.isPortrait ? 64 : 96) * L.u,
          padding: `${L.safe.top}px ${L.safe.right}px ${L.safe.bottom}px ${L.safe.left}px`,
        }}
      >
        <div style={{ scale: String(0.94 + enter * 0.06), opacity: enter, translate: `0 ${(1 - enter) * 60 * L.u}px` }}>
          <DeviceFrame kind={kind} width={outerW} frameColor="#0c0d0f" edgeColor={`${b.colors.silver}44`} textColor={b.colors.muted} latinFont={b.font.latin}>
            {scene.media ? (
              <Video src={staticFile(scene.media)} muted premountFor={fps} objectFit="cover" style={{ width: dev.vw, height: dev.vh }} />
            ) : (
              <div style={{ width: dev.vw, height: dev.vh, background: b.colors.surface }} />
            )}
          </DeviceFrame>
        </div>
        <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 26 * L.u, width: L.isPortrait ? size.outerW : undefined, flex: L.isPortrait ? undefined : 1 }}>
          <IndexLabel index={`${pad2(index + 1)}/${pad2(total)}`} label={scene.eyebrow ?? ""} start={s(6)} fontFamily={b.font.latin} fontSize={22 * L.u} color={b.colors.muted} accent={b.colors.accent} style={{ direction: "ltr", justifyContent: "flex-end" }} />
          <KineticTitle text={scene.headline ?? ""} start={s(10)} stagger={s(5)} duration={s(22)} exitAt={dur - s(16)} fontFamily={b.font.display} fontSize={(L.isPortrait ? 76 : 76) * L.u} fontWeight={800} color={b.colors.foreground} lineHeight={1.3} />
          {items.map((it, i) => {
            const at = s(30) + i * slot;
            const on = prog(frame, at, s(18), EASE.out);
            const active = frame >= at && frame < at + slot;
            return (
              <div key={it.label} style={{ display: "flex", flexDirection: "column", gap: 10 * L.u, opacity: 0.35 + on * (active || i === items.length - 1 ? 0.65 : 0.25) }}>
                <Hairline start={at} duration={s(16)} length="100%" color={active ? b.colors.accent : `${b.colors.muted}66`} origin="end" thickness={2} />
                <div style={{ display: "flex", gap: 18 * L.u, alignItems: "baseline", translate: `${(1 - on) * -30 * L.u}px 0` }}>
                  <span style={{ fontFamily: b.font.latin, fontSize: 22 * L.u, color: b.colors.accent, fontWeight: 600 }}>{it.value ?? pad2(i + 1)}</span>
                  <span style={{ fontFamily: b.font.display, fontSize: 40 * L.u, color: b.colors.foreground, fontWeight: 700 }}>{it.label}</span>
                  {it.latin ? <span dir="ltr" style={{ fontFamily: b.font.latin, fontSize: 18 * L.u, color: b.colors.muted, letterSpacing: "0.18em", marginInlineStart: "auto" }}>{it.latin}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
