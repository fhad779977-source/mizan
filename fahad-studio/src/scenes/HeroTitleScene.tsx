// Opening title: a hairline horizon draws, the Arabic headline rises out of
// it word by word, the Latin line tracks in beneath. Exits upward.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Hairline } from "../components/Hairline";
import { IndexLabel } from "../components/IndexLabel";
import { KineticTitle } from "../components/KineticTitle";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { EASE, prog, scaled } from "../motion/easing";
import { pad2, type SceneProps } from "./types";

export const HeroTitleScene: React.FC<SceneProps> = ({ scene, dur, index, total }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const s = (f: number) => scaled(f, b.speed);
  const headline = scene.headline ?? "";
  const words = headline.split(" ");
  // Portrait stacks short headlines one word per line; landscape keeps one line.
  const text = L.isPortrait && words.length <= 3 ? words.join("\n") : headline;
  const size = (L.isPortrait ? 236 : 210) * L.u;
  // Exit overlaps the outgoing transition so the frame is never empty.
  const exitAt = dur - s(10);
  const drift = prog(frame, 0, dur, EASE.soft);
  return (
    <AbsoluteFill style={{ background: b.colors.background }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(${L.isPortrait ? "90% 50%" : "60% 70%"} at 50% 55%, ${b.colors.surface} 0%, ${b.colors.background} 70%)`,
        }}
      />
      <div style={{ position: "absolute", top: L.safe.top, left: L.safe.left, right: L.safe.right, display: "flex", justifyContent: "space-between" }}>
        <IndexLabel
          index={`${pad2(index + 1)}/${pad2(total)}`}
          label={scene.eyebrow ?? ""}
          start={s(10)}
          fontFamily={b.font.latin}
          fontSize={22 * L.u}
          color={b.colors.muted}
          accent={b.colors.accent}
        />
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 * L.u, scale: String(1 + drift * 0.03) }}>
          <KineticTitle
            text={text}
            mode="words"
            start={s(5)}
            stagger={s(7)}
            duration={s(26)}
            exitAt={exitAt}
            fontFamily={b.font.display}
            fontSize={size}
            fontWeight={b.dw(900)}
            color={b.colors.foreground}
            lineHeight={1.22}
            align="center"
          />
          <Hairline start={0} duration={s(14)} exitAt={exitAt} length={L.content.w * (L.isPortrait ? 0.86 : 0.62)} color={b.colors.silver} origin="center" thickness={Math.max(1, 2 * L.u)} />
          {scene.headlineLatin ? (
            <div style={{ display: "flex", alignItems: "center", gap: 18 * L.u }}>
              <div style={{ width: 12 * L.u, height: 12 * L.u, background: b.colors.accent, scale: String(prog(frame, s(24), s(10)) * (1 - prog(frame, exitAt, s(10), EASE.in))) }} />
              <KineticTitle
                text={scene.headlineLatin}
                mode="words"
                start={s(20)}
                stagger={s(3)}
                duration={s(20)}
                exitAt={exitAt + 2}
                fontFamily={b.font.latin}
                fontSize={(L.isPortrait ? 40 : 38) * L.u}
                fontWeight={500}
                color={b.colors.silver}
                letterSpacing="0.34em"
              />
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
