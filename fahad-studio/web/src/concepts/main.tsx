// Concept screens at a fixed 1440×900 viewport. Capture source for
// scripts/capture-concepts.mjs: /concepts/?id=c01 … c05. Without an id, all
// screens are listed for review.
import React from "react";
import { createRoot } from "react-dom/client";
import "../shared/styles/fonts.css";
import "../shared/styles/base.css";
import { C01Nocturne } from "./C01Nocturne";
import { C02Herbarium } from "./C02Herbarium";
import { C03Kiln } from "./C03Kiln";
import { C04Meridian } from "./C04Meridian";
import { C05Midad } from "./C05Midad";

export const CONCEPT_SCREENS: Record<string, React.FC> = { c01: C01Nocturne, c02: C02Herbarium, c03: C03Kiln, c04: C04Meridian, c05: C05Midad };

const id = new URLSearchParams(location.search).get("id");
const Screen = id ? CONCEPT_SCREENS[id] : null;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {Screen ? (
      <div id="capture" style={{ width: 1440, height: 900 }}>
        <Screen />
      </div>
    ) : (
      <div style={{ display: "grid", gap: 24, padding: 24, background: "#222" }}>
        {Object.entries(CONCEPT_SCREENS).map(([k, C]) => (
          <a key={k} href={`?id=${k}`} style={{ display: "block", width: 1440, height: 900 }}>
            <C />
          </a>
        ))}
      </div>
    )}
  </React.StrictMode>,
);
