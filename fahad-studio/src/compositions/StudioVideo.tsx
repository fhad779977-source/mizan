// The one composition every project renders through. Content comes entirely
// from project data (projects/<slug>/project.json); scenes, transitions,
// subtitles and audio are resolved from it.
import { TransitionSeries } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction, useVideoConfig } from "remotion";
import { z } from "zod";
import { AudioMix } from "../components/AudioMix";
import { SafeAreaGuides } from "../components/SafeAreaGuides";
import { Subtitles } from "../components/Subtitles";
import { BrandProvider } from "../lib/brand";
import "../lib/fonts";
import { SafeAreaProvider, useLayout } from "../lib/layout";
import { buildTimeline } from "../lib/timeline";
import { parseMatchRect, resolveTransition } from "../motion/transitions";
import { SceneRenderer } from "../scenes/SceneRenderer";
import { ProjectSchema } from "../schema/project";
import { fontStack } from "../lib/fonts";

export const StudioVideoSchema = ProjectSchema.extend({ formatId: z.string() });
export type StudioVideoProps = z.infer<typeof StudioVideoSchema>;

export const calculateStudioMetadata: CalculateMetadataFunction<StudioVideoProps> = ({ props }) => {
  const fmt = props.formats.find((f) => f.id === props.formatId) ?? props.formats[0];
  return {
    durationInFrames: buildTimeline(props).durationInFrames,
    fps: props.fps,
    width: fmt.width,
    height: fmt.height,
  };
};

const SubtitleLayer: React.FC<{ props: StudioVideoProps }> = ({ props }) => {
  const L = useLayout();
  if (!props.subtitles.enabled || props.subtitles.items.length === 0) return null;
  return (
    <Subtitles
      captions={props.subtitles.items}
      bottom={L.safe.bottom}
      maxWidth={L.content.w * 0.9}
      fontFamily={fontStack(props.brand.fonts.body)}
      fontSize={(L.isPortrait ? 40 : 36) * L.u}
      color={props.brand.colors.foreground}
      background="rgba(0,0,0,0.62)"
    />
  );
};

export const StudioVideo: React.FC<StudioVideoProps> = (props) => {
  const { fps } = useVideoConfig();
  const fmt = props.formats.find((f) => f.id === props.formatId) ?? props.formats[0];
  const tl = buildTimeline(props);
  const last = props.scenes.length - 1;
  const items: React.ReactElement[] = [];
  props.scenes.forEach((scene, i) => {
    items.push(
      <TransitionSeries.Sequence key={scene.id} name={scene.id} durationInFrames={tl.scenes[i].durationInFrames} premountFor={fps}>
        <SceneRenderer scene={scene} dur={tl.scenes[i].durationInFrames} index={i} total={props.scenes.length} />
      </TransitionSeries.Sequence>,
    );
    const t = scene.transitionOut;
    if (t && i < last) {
      const r = resolveTransition(t, { edge: props.brand.colors.silver }, parseMatchRect(scene.variant, fmt.height > fmt.width));
      if (r) items.push(<TransitionSeries.Transition key={`${scene.id}-out`} presentation={r.presentation} timing={r.timing} />);
    }
  });
  return (
    <BrandProvider project={props}>
      <SafeAreaProvider safeArea={fmt.safeArea}>
        <AbsoluteFill style={{ background: props.brand.colors.background }}>
          <TransitionSeries name="Scenes">{items}</TransitionSeries>
          <SubtitleLayer props={props} />
          <AudioMix project={props} />
          {props.showSafeArea ? <SafeAreaGuides /> : null}
        </AbsoluteFill>
      </SafeAreaProvider>
    </BrandProvider>
  );
};
