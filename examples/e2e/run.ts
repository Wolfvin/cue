/**
 * End-to-end example: demonstrates the full cue workflow from
 * feature description → DemoScript → validation → HTML export.
 *
 * Run:  cd examples/e2e && pnpm start
 */

import { generate, validateDemoScript } from "@cue/core";
// Import directly from source — the @cue/player barrel export includes
// browser-only code (HTMLElement) that crashes in Node.js. The export.ts
// module is a pure string builder and works in any environment.
import { exportToHtml } from "../../packages/player/src/export";
import { writeFileSync } from "fs";
import { resolve } from "path";

// ─── Step 1: Generate DemoScript from feature descriptions ─────────────────
//
// The `generate()` function takes a structured list of features and produces
// a valid DemoScript — no LLM call required. Each feature becomes one step
// in the demo, with optional hotspots and call-to-action overlays.

const script = generate({
  id: "taskflow-demo",
  title: "TaskFlow — Manage tasks in seconds",
  features: [
    {
      name: "Create Task",
      description: "Click + to add a new task instantly",
    },
    {
      name: "Assign Team Member",
      description: "Drag to assign tasks to your team",
      hotspots: [{ label: "Drag here", x: 0.38, y: 0.46 }],
    },
    {
      name: "Track Progress",
      description: "See real-time completion across your project",
    },
    {
      name: "Get Started",
      description: "Join 10,000+ teams using TaskFlow",
      cta: { type: "email_capture", label: "Start free trial" },
    },
  ],
});

// ─── Step 2: Validate the generated DemoScript ─────────────────────────────
//
// `validateDemoScript()` performs structural checks on required fields
// (id, title, steps) and returns a type guard.

const valid = validateDemoScript(script);
console.log(`✓ Generated ${script.steps.length} steps, valid: ${valid}`);

if (!valid) {
  console.error("Generated DemoScript failed validation — aborting.");
  process.exit(1);
}

// Print a summary of each step
console.log("\nSteps:");
for (const step of script.steps) {
  const duration = step.duration ? `${step.duration}ms` : "manual (CTA)";
  const hotspots = step.hotspots ? ` | ${step.hotspots.length} hotspot(s)` : "";
  console.log(`  ${step.id}: "${step.caption?.split("\n")[0]}" (${duration}${hotspots})`);
}

// ─── Step 3: Export to a self-contained HTML file ──────────────────────────
//
// `exportToHtml()` produces a complete HTML page that embeds the DemoScript
// as JSON and loads the cue-player from a CDN. The file works in any browser
// without a build step or server.

const html = exportToHtml({ script, title: "TaskFlow Demo" });

const outputPath = resolve(__dirname, "demo.html");
writeFileSync(outputPath, html);

// ─── Step 4: Print summary ────────────────────────────────────────────────

console.log(`\n✓ Exported to ${outputPath} (${html.length} bytes)`);
console.log("\nOpen demo.html in browser to see the demo!");
