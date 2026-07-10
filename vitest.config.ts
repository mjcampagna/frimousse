import { playwright } from "@vitest/browser-playwright";
import { defineConfig, defineProject } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    include: ["react/jsx-dev-runtime"],
  },
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}", "!**/__tests__/**"],
      exclude: ["src/index.ts"],
      ignoreEmptyLines: true,
      excludeAfterRemap: true,
    },
    projects: [
      defineProject({
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          setupFiles: ["test/setup-jsdom.ts", "test/setup-emojibase.ts"],
        },
      }),
      defineProject({
        test: {
          name: "browser",
          include: ["src/**/*.test.browser.{ts,tsx}"],
          setupFiles: ["test/setup-browser.ts", "test/setup-emojibase.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      }),
    ],
  },
});
