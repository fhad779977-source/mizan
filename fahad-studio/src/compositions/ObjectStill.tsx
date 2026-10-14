// Renders the abstract vessel study as a still image asset
// (public/assets/images/vessel-study.png) for product-card layouts.
// It is a geometric study, not a photograph or model of a real product.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Vessel } from "../three/objects";
import { StudioStage } from "../three/StudioStage";

export const ObjectStill: React.FC<{ background?: string; body?: string; cap?: string }> = ({
  background = "#E9E5DD",
  body = "#F4F1EA",
  cap = "#B9BCC2",
}) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background }}>
      <StudioStage
        width={width}
        height={height}
        background={background}
        camera={{ position: [2.2, 2.0, 7.2], target: [0, 1.15, 0], fov: 26 }}
        keyLight={{ position: [-4.5, 6.5, 5], intensity: 3.4, color: "#fff4e6" }}
        rimColor="#ffffff"
        accentColor="#E4572E"
        accentIntensity={0.25}
      >
        <Vessel body={body} cap={cap} rotationY={0.4} />
      </StudioStage>
    </AbsoluteFill>
  );
};
