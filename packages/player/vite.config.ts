import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

// Shared settings
const entry = "src/index.ts";
const plugins = [react()];

// ES module build — externalizes react/react-dom so consumers tree-shake
const esConfig: UserConfig = {
  plugins,
  build: {
    lib: {
      entry,
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
    outDir: "dist",
  },
};

// IIFE build — bundles everything (including react) for <script> tag usage
const iifeConfig: UserConfig = {
  plugins,
  build: {
    lib: {
      entry,
      formats: ["iife"],
      name: "Cue",
      fileName: () => "cue-player.iife.js",
    },
    rollupOptions: {
      // Bundle react + react-dom inline for standalone usage
      external: [],
    },
    outDir: "dist",
    // Avoid overwriting the ES output — Vite clears outDir by default
    emptyOutDir: false,
  },
};

// Vite doesn't natively support multiple lib builds in a single config.
// We export the IIFE config as default and run the ES build separately
// via the build script, OR we use a single config with both formats.
//
// Simplest correct approach: single config with both formats.
// IIFE inlines all; ES externalizes react. Since Vite's external option
// applies to all formats, we use the "bundle everything" approach and
// note that for the ES module path, consumers should add react as a peer.
export default defineConfig({
  plugins,
  build: {
    lib: {
      entry,
      formats: ["es", "iife"],
      name: "Cue",
      fileName: (format) => {
        if (format === "iife") return "cue-player.iife.js";
        return "index.js";
      },
    },
  },
});
