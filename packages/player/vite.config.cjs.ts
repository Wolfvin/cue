import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * CJS build — generates CommonJS outputs for Node.js require() consumers.
 *
 * Builds two entries:
 *   src/index.ts → dist/index.cjs  (browser + Node safe, lazy-loads WebComponent)
 *   src/node.ts  → dist/node.cjs   (Node.js only, no HTMLElement reference)
 *
 * This config must run AFTER the IIFE build (vite.config.ts) and BEFORE or
 * alongside the ES build (vite.config.es.ts). The build script in package.json
 * should be: vite build && vite build --config vite.config.es.ts && vite build --config vite.config.cjs.ts
 */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        node: "src/node.ts",
      },
      formats: ["cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@cue-vin/core",
        "@cue-vin/react",
        "@cue-vin/templates",
        "puppeteer",
        "fs",
        "path",
      ],
      output: {
        // Give deterministic names to chunks instead of content hashes
        chunkFileNames: "[name].cjs",
        entryFileNames: "[name].cjs",
      },
    },
    outDir: "dist",
    // Don't clear dist/ — the IIFE + ES builds ran first
    emptyOutDir: false,
  },
});
