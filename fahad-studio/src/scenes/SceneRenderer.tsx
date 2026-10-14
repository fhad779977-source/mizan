import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "./types";
import { HeroTitleScene } from "./HeroTitleScene";
import { TypeGridScene } from "./TypeGridScene";
import { InterfaceScene } from "./InterfaceScene";
import { ThreeObjectScene } from "./ThreeObjectScene";
import { LogoEndScene } from "./LogoEndScene";
import { StatementScene } from "./StatementScene";
import { ProductHeroScene } from "./ProductHeroScene";
import { FeatureCardsScene } from "./FeatureCardsScene";
import { ScreenRecordingScene } from "./ScreenRecordingScene";
import { BeforeAfterScene } from "./BeforeAfterScene";
import { PaletteScene } from "./PaletteScene";
import { PromptRevealScene } from "./PromptRevealScene";
import type { Scene } from "../schema/project";

const REGISTRY: Record<Scene["type"], React.FC<SceneProps>> = {
  "hero-title": HeroTitleScene,
  "type-grid": TypeGridScene,
  interface: InterfaceScene,
  "three-object": ThreeObjectScene,
  "logo-end": LogoEndScene,
  statement: StatementScene,
  "product-hero": ProductHeroScene,
  "feature-cards": FeatureCardsScene,
  "screen-recording": ScreenRecordingScene,
  "before-after": BeforeAfterScene,
  palette: PaletteScene,
  "prompt-reveal": PromptRevealScene,
};

export const SceneRenderer: React.FC<SceneProps> = (props) => {
  const C = REGISTRY[props.scene.type];
  if (!C) return <AbsoluteFill style={{ background: "#300", color: "#fff" }}>Unknown scene type {props.scene.type}</AbsoluteFill>;
  return <C {...props} />;
};
