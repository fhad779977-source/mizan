import React from "react";
import { createRoot } from "react-dom/client";
import "../../shared/styles/fonts.css";
import "../../shared/styles/base.css";
import "../../shared/styles/fx.css";
import "./form.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
