import type { render, renderHook } from "vitest-browser-react";

declare module "vitest/browser" {
  export { page, userEvent } from "@vitest/browser/context";
  export * from "@vitest/browser/context";

  interface BrowserPage {
    render: typeof render;
    renderHook: typeof renderHook;
  }
}
