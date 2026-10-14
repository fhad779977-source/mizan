import React from "react";
import type { Segment } from "./content";

/** Renders title lines from content segments (italic = serif italic accent). */
export const lines = (title: Segment[][]) =>
  title.map((line, i) => (
    <React.Fragment key={i}>
      {line.map((s, j) => (s.italic ? <em key={j}>{s.text}</em> : <React.Fragment key={j}>{s.text}</React.Fragment>))}
    </React.Fragment>
  ));
