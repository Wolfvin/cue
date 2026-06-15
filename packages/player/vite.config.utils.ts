import { defineConfig } from "vite";

/**
 * Vite config for building cue-utils.iife.js — a standalone IIFE bundle
 * that exposes Timeline and Pointer as window.CueUtils.
 *
 * This is a lightweight alternative to the full cue-player.iife.js
 * (which includes React + the full player component). Target: < 15kb.
 *
 * Entry:  packages/core/src/utils-iife.ts
 * Output: packages/player/dist/cue-utils.iife.js
 * Global: window.CueUtils
 */
export default defineConfig({
  build: {
    lib: {
      entry: "../core/src/utils-iife.ts",
      formats: ["iife"],
      name: "CueUtils",
      fileName: () => "cue-utils.iife.js",
    },
    rollupOptions: {
      // No externals — bundle everything inline for standalone <script> usage.
      // Timeline and Pointer have zero dependencies, so the bundle is tiny.
    },
    outDir: "dist",
    // Don't clear dist/ — the main IIFE + ES builds ran first
    emptyOutDir: false,
    // Minify for smaller bundle (esbuild is Vite's default, no extra install needed)
    minify: true,
  },
});
