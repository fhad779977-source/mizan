// Registers one composition per project × format, plus studio utilities.
// Project content lives in projects/<slug>/project.json.
import React from "react";
import { Composition, Folder } from "remotion";
import { calculateStudioMetadata, StudioVideo, StudioVideoSchema } from "./compositions/StudioVideo";
import { ProjectSchema } from "./schema/project";
import { PROJECTS } from "./projects.generated";
import { Library, LIBRARY_DURATION } from "./compositions/Library";
import { ObjectStill } from "./compositions/ObjectStill";
import { SiteScroll } from "./compositions/SiteScroll";
import { HorizonLoop } from "./compositions/HorizonLoop";
import { CeramicStill } from "./compositions/CeramicStill";
import { ConceptScreen } from "./compositions/ConceptScreen";

// Invalid projects are skipped (with a console warning) so one broken file
// never takes down the whole Studio; `npm run check` reports the details.
const projects = PROJECTS.flatMap((p) => {
  const r = ProjectSchema.safeParse(p);
  if (!r.success) {
    console.warn(`Skipping invalid project ${(p as { slug?: string }).slug}: run npm run check`);
    return [];
  }
  return [r.data];
});

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Projects">
      {projects.map((project) =>
        project.formats.map((fmt) => (
          <Composition
            key={`${project.slug}-${fmt.id}`}
            id={`${project.slug}-${fmt.id}`}
            component={StudioVideo}
            schema={StudioVideoSchema}
            defaultProps={{ ...project, formatId: fmt.id }}
            calculateMetadata={calculateStudioMetadata}
            durationInFrames={1}
            fps={project.fps}
            width={fmt.width}
            height={fmt.height}
          />
        )),
      )}
    </Folder>
    <Folder name="Studio">
      <Composition id="component-library" component={Library} durationInFrames={LIBRARY_DURATION} fps={30} width={1920} height={1080} />
      <Composition id="object-still" component={ObjectStill} durationInFrames={1} fps={30} width={1600} height={2000} />
      <Composition id="site-scroll" component={SiteScroll} durationInFrames={240} fps={30} width={1440} height={900} />
      <Composition id="ceramic-still" component={CeramicStill} durationInFrames={1} fps={30} width={1200} height={1500} defaultProps={{ piece: "moon", glaze: "bone" }} />
      <Composition id="salsal-screen" component={ConceptScreen} durationInFrames={1} fps={30} width={1170} height={2532} defaultProps={{ screen: "home" as const }} />
      <Composition id="web-horizon-loop" component={HorizonLoop} durationInFrames={300} fps={30} width={1920} height={1080} />
    </Folder>
  </>
);
