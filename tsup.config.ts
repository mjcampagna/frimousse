import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: {
    resolve: [/emojibase/],
    // tsup's DTS pipeline still injects a deprecated `baseUrl` internally on TS 6.
    compilerOptions: {
      ignoreDeprecations: "6.0",
    },
  },
  splitting: true,
  clean: true,
  format: ["esm", "cjs"],
  sourcemap: true,
});
