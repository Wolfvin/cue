import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

// Shared settings
const plugins = [react()];

// Vite doesn't natively support multiple lib builds with different
// externals in a single config. We solve this with a two-pass build:
//   Pass 1 (default): IIFE — bundles everything inline (including React)
//   Pass 2 (build:es):  ES  — externalizes react/react-dom for tree-shaking
//
// The "build" script in package.json runs: vite build && vite build --config vite.config.es.ts

// The IIFE build uses a dedicated entry (src/iife.ts) that imports CueEmbed
// synchronously — this is safe because the IIFE bundle only ever runs in
// browsers. The ES module build uses src/index.ts which avoids top-level
// HTMLElement references so that Node.js consumers don't crash.
const iifeEntry = "src/iife.ts";

// ─── Default config: IIFE build ─────────────────────────────────────────
export default defineConfig({
  plugins,
  build: {
    lib: {
      entry: iifeEntry,
      formats: ["iife"],
      name: "Cue",
      fileName: () => "cue-player.iife.js",
    },
    rollupOptions: {
      // Bundle react + react-dom inline for standalone <script> usage.
      // Externalize puppeteer — it's a Node.js-only peer dep that must
      // not be pulled into the browser IIFE bundle.
      external: ["puppeteer", "puppeteer-core"],
    },
    outDir: "dist",
  },
});
