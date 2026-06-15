import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ES module build — externalizes react/react-dom so consumers can tree-shake
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
    outDir: "dist",
    // Don't clear dist/ — the IIFE build ran first
    emptyOutDir: false,
  },
});
