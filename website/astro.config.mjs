import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [mdx(), react()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    },
  },
  output: "static",
  vite: {
    server: {
      fs: {
        allow: [".."],
      },
    },
  },
});
