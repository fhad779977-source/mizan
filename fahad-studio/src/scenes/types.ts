import type { Scene } from "../schema/project";

export type SceneProps = {
  scene: Scene;
  /** Scene length in frames (includes transition overlaps). */
  dur: number;
  index: number;
  total: number;
};

export const pad2 = (n: number) => String(n).padStart(2, "0");
