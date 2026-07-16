import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { PlaygroundApp } from "./playground-app";
import "./playground.css";
import "prosemirror-view/style/prosemirror.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Playground root container was not found.");
}

createRoot(container).render(
  <StrictMode>
    <PlaygroundApp />
  </StrictMode>,
);
