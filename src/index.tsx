/**
 * src/index.tsx
 * @description Application entry point that renders the main component tree
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Frame } from "./screens/Frame/Frame";

/**
 * Render the application inside a StrictMode wrapper with BrowserRouter for routing
 * @sideEffects Mounts the React application to the DOM
 */
createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Frame />
    </BrowserRouter>
  </StrictMode>,
);