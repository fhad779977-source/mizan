// Product still of a procedural ceramic piece (concept product photography)
// for interface visuals: npx remotion still ceramic-still out.png --props='{"piece":"moon","glaze":"bone"}'
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Ceramic, type CeramicPiece, type Glaze } from "../three/ceramics";
import { StudioStage } from "../three/StudioStage";

const FRAMING: Record<CeramicPiece, { y: number; dist: number }> = {
  bottle: { y: 1.05, dist: 10.5 },
  moon: { y: 0.85, dist: 9 },
  bowl: { y: 0.3, dist: 9 },
  cup: { y: 0.45, dist: 5.2 },
};

export const CeramicStill: React.FC<{ piece?: CeramicPiece; glaze?: Glaze; background?: string; angle?: number }> = ({
  piece = "moon",
  glaze = "bone",
  background = "#E6DFD3",
  angle = 0.5,
}) => {
  const { width, height } = useVideoConfig();
  const f = FRAMING[piece];
  return (
    <AbsoluteFill style={{ background }}>
      <StudioStage
        width={width}
        height={height}
        background={background}
        camera={{ position: [Math.sin(angle) * 1.2, f.y + f.dist * 0.16, f.dist], target: [0, f.y, 0], fov: 24 }}
        keyLight={{ position: [-4, 7, 4.5], intensity: 3.2, color: "#fff1e0" }}
        rimColor="#fff6ea"
        accentColor="#B5643C"
        accentIntensity={0.18}
      >
        {/* Lifts the floor outside the key cone so the sweep reads seamless. */}
        <hemisphereLight args={["#ffffff", "#d8d0c4", 1.5]} />
        <Ceramic piece={piece} glaze={glaze} rotationY={angle} />
      </StudioStage>
    </AbsoluteFill>
  );
};
