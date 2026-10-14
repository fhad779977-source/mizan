// Timeline audio: a music bed with frame-based fades, plus SFX cues placed at
// absolute frames computed from the scene timeline. All levels are linear
// gains (0..1); peaks are verified after render by scripts/audio-check.ts.
import { Audio } from "@remotion/media";
import React from "react";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Project } from "../schema/project";
import { buildTimeline } from "../lib/timeline";

export const AudioMix: React.FC<{ project: Project }> = ({ project }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { scenes } = buildTimeline(project);
  const music = project.audio.music;
  const fadeIn = music ? Math.max(1, Math.round(music.fadeInSeconds * fps)) : 1;
  const fadeOut = music ? Math.max(1, Math.round(music.fadeOutSeconds * fps)) : 1;
  return (
    <>
      {music ? (
        <Audio
          name="Music bed"
          src={staticFile(music.src)}
          premountFor={fps}
          volume={
            music.volume *
            interpolate(frame, [0, fadeIn, durationInFrames - fadeOut, durationInFrames - 1], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
      {project.scenes.flatMap((scene, i) =>
        scene.sfx.map((cue, ci) => (
          <Audio
            key={`${scene.id}-${ci}`}
            name={`SFX ${scene.id} ${ci + 1}`}
            src={staticFile(cue.src)}
            from={scenes[i].from + Math.round(cue.at * fps)}
            premountFor={fps}
            volume={cue.volume * project.audio.sfxVolume}
          />
        )),
      )}
    </>
  );
};
