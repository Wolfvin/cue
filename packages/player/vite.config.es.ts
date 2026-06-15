import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ES module build — externalizes react/react-dom so consumers can tree-shake
// Builds two entries:
//   src/index.ts → dist/index.js  (browser + Node safe, lazy-loads WebComponent)
//   src/node.ts  → dist/node.js   (Node.js only, no HTMLElement reference)
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        node: "src/node.ts",
      },
      formats: ["es"],
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
        // Give deterministic names to dynamic-import chunks instead of hashes
        chunkFileNames: "[name].js",
      },
    },
    outDir: "dist",
    // Don't clear dist/ — the IIFE build ran first
    emptyOutDir: false,
  },
});
