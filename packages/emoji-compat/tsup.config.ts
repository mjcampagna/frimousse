import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/assets.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: false,
});
