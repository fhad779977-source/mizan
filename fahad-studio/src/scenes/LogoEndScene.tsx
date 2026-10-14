import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EndLockup } from "../components/EndLockup";
import { KineticTitle } from "../components/KineticTitle";
import { useBrand } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { EASE, prog, scaled } from "../motion/easing";
import type { SceneProps } from "./types";

export const LogoEndScene: React.FC<SceneProps> = ({ scene }) => {
  const b = useBrand();
  const L = useLayout();
  const frame = useCurrentFrame();
  const s = (f: number) => scaled(f, b.speed);
  // The light field is already present as the iris opens, then blooms.
  const glow = 0.7 + 0.3 * prog(frame, 0, s(60), EASE.soft);
  return (
    <AbsoluteFill style={{ background: b.colors.background, justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill style={{ background: `radial-gradient(${L.isPortrait ? "70% 34%" : "46% 60%"} at 50% 50%, ${b.colors.surface}, ${b.colors.background})`, opacity: glow }} />
      <EndLockup
        wordmark={b.logo.wordmark}
        arabic={b.logo.arabic}
        tagline={b.logo.tagline}
        start={s(1)}
        landscape={!L.stacked}
        u={L.u}
        colors={{ fg: b.colors.foreground, muted: b.colors.muted, silver: b.colors.silver, accent: b.colors.accent }}
        fonts={{ display: b.font.display, latin: b.font.latin }}
      />
      {scene.body ? (
        <div style={{ position: "absolute", bottom: L.safe.bottom, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <KineticTitle text={scene.body} start={s(46)} stagger={s(3)} duration={s(20)} fontFamily={b.font.body} fontSize={30 * L.u} fontWeight={400} color={b.colors.muted} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
