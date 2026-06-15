import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

// Shared settings
const entry = "src/index.ts";
const plugins = [react()];

// Vite doesn't natively support multiple lib builds with different
// externals in a single config. We solve this with a two-pass build:
//   Pass 1 (default): IIFE — bundles everything inline (including React)
//   Pass 2 (build:es):  ES  — externalizes react/react-dom for tree-shaking
//
// The "build" script in package.json runs: vite build && vite build --config vite.config.es.ts

// ─── Default config: IIFE build ─────────────────────────────────────────
export default defineConfig({
  plugins,
  build: {
    lib: {
      entry,
      formats: ["iife"],
      name: "Cue",
      fileName: () => "cue-player.iife.js",
    },
    rollupOptions: {
      // Bundle react + react-dom inline for standalone <script> usage
      external: [],
    },
    outDir: "dist",
  },
});
