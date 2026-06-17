import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@cue-vin/core": path.resolve(__dirname, "../core/src/index.ts"),
      "@cue-vin/react": path.resolve(__dirname, "../react/src/index.ts"),
      "@cue-vin/templates": path.resolve(__dirname, "../templates/src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
});
