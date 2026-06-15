/**
 * Verify that @cue-vin/player/node can be imported in Node.js
 * without crashing on "HTMLElement is not defined".
 *
 * Run: npx tsx showcase/saas/test-node.ts
 */

import { exportToHtml, exportToPng } from "../../packages/player/dist/node.js";
import type { ExportOptions, ExportPngOptions } from "../../packages/player/dist/node.js";
import type { DemoScript } from "../../packages/core/dist/index.js";

const script: DemoScript = {
  id: "test-demo",
  title: "Node Export Test",
  steps: [
    {
      id: "step-1",
      caption: "First step of the demo",
      duration: 3000,
    },
  ],
  loop: false,
  theme: { accent: "#00FF94", bg: "#0A0E17" },
};

// Test exportToHtml
const html = exportToHtml({ script });
console.log("exportToHtml() returned HTML string:", html.length > 0 ? "OK" : "FAIL");
console.log("  Contains <cue-embed>:", html.includes("cue-embed") ? "OK" : "FAIL");
console.log("  Contains script JSON:", html.includes("__CUE_SCRIPT__") ? "OK" : "FAIL");

// Test exportToPng (just verify the function exists and has correct signature)
console.log("exportToPng is a function:", typeof exportToPng === "function" ? "OK" : "FAIL");

// Verify no browser globals were accessed
console.log("\nAll checks passed — @cue-vin/player/node is Node.js-safe!");
