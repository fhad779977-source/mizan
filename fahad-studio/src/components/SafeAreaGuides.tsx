import React from "react";
import { AbsoluteFill } from "remotion";
import { useLayout } from "../lib/layout";

/** Dashed guide for the platform safe area. Toggle with `showSafeArea`. */
export const SafeAreaGuides: React.FC = () => {
  const { safe } = useLayout();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: safe.top,
          right: safe.right,
          bottom: safe.bottom,
          left: safe.left,
          border: "2px dashed rgba(0,255,170,0.7)",
        }}
      />
    </AbsoluteFill>
  );
};
