// Converts scene seconds into frame-accurate timeline data. Used by
// calculateMetadata (total duration), the scene sequencer and the audio mix
// (absolute SFX times), so all three always agree.
import type { Project } from "../schema/project";

export type TimelineScene = {
  index: number;
  id: string;
  from: number;
  durationInFrames: number;
  transitionInFrames: number; // overlap with the previous scene
  transitionOutFrames: number; // overlap with the next scene
};

export const transitionFrames = (project: Project, index: number): number => {
  const t = project.scenes[index]?.transitionOut;
  if (!t || t.type === "cut" || index === project.scenes.length - 1) return 0;
  return t.durationInFrames;
};

export const buildTimeline = (project: Project) => {
  const scenes: TimelineScene[] = [];
  let cursor = 0;
  project.scenes.forEach((scene, index) => {
    const durationInFrames = Math.round(scene.durationInSeconds * project.fps);
    const transitionInFrames = index > 0 ? transitionFrames(project, index - 1) : 0;
    const from = cursor - transitionInFrames;
    scenes.push({
      index,
      id: scene.id,
      from,
      durationInFrames,
      transitionInFrames,
      transitionOutFrames: transitionFrames(project, index),
    });
    cursor = from + durationInFrames;
  });
  return { scenes, durationInFrames: cursor };
};

export const validateTimeline = (project: Project): string[] => {
  const errors: string[] = [];
  const { scenes } = buildTimeline(project);
  scenes.forEach((s) => {
    if (s.transitionInFrames + s.transitionOutFrames > s.durationInFrames) {
      errors.push(`scene "${s.id}": transitions (${s.transitionInFrames}+${s.transitionOutFrames}f) exceed its length (${s.durationInFrames}f)`);
    }
  });
  return errors;
};
