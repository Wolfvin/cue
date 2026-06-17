/**
 * showcase/saas/generate.ts — Taskly SaaS Demo Generator
 *
 * Generates a DemoScript for "Taskly" project management SaaS product
 * using generate() from @cue-vin/core, then exports to HTML via
 * exportToHtml() from @cue-vin/player.
 *
 * Run:  cd showcase/saas && npx tsx generate.ts
 */

import { generate, validateDemoScript } from "@cue-vin/core";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Step 1: Generate DemoScript for Taskly ─────────────────────────────────
//
// Taskly is a SaaS project management tool with 5+ features:
// - Create Project: Start a new project workspace
// - Invite Team: Add collaborators via email
// - Assign Task: Delegate work to team members
// - Set Deadline: Configure due dates and milestones
// - Dashboard Overview: See key metrics at a glance
// - Get Started (CTA): Signup call-to-action

const script = generate({
  id: "taskly-saas-demo",
  title: "Taskly — Project Management, Simplified",
  features: [
    {
      name: "Create Project",
      description: "Start a new project workspace in seconds — name it, pick a template, and go.",
      hotspots: [
        { label: "New Project button", x: 0.15, y: 0.22 },
        { label: "Template gallery", x: 0.55, y: 0.45 },
      ],
    },
    {
      name: "Invite Team",
      description: "Add collaborators by email — they get instant access to the project board.",
      hotspots: [
        { label: "Invite field", x: 0.42, y: 0.30 },
        { label: "Role selector", x: 0.72, y: 0.30 },
      ],
      cta: { type: "button", label: "Send Invite" },
    },
    {
      name: "Assign Task",
      description: "Drag a task card onto a team member's column to assign it instantly.",
      hotspots: [
        { label: "Task card", x: 0.30, y: 0.50 },
        { label: "Assignee avatar", x: 0.70, y: 0.50 },
      ],
    },
    {
      name: "Set Deadline",
      description: "Click the calendar icon on any task to set a due date and get automated reminders.",
      hotspots: [
        { label: "Calendar picker", x: 0.50, y: 0.35 },
        { label: "Reminder toggle", x: 0.50, y: 0.65 },
      ],
    },
    {
      name: "Dashboard Overview",
      description: "See burndown charts, task completion rates, and team velocity at a glance.",
      hotspots: [
        { label: "Burndown chart", x: 0.35, y: 0.40 },
        { label: "Completion rate", x: 0.65, y: 0.40 },
        { label: "Team velocity", x: 0.50, y: 0.70 },
      ],
    },
    {
      name: "Get Started",
      description: "Join 50,000+ teams managing projects with Taskly",
      cta: { type: "email_capture", label: "Start free trial" },
    },
  ],
  defaultDuration: 5000,
  theme: {
    accent: "#6366f1",  // Indigo — modern SaaS feel
    bg: "#0f172a",      // Slate-900 dark background
    font: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
});

// ─── Step 2: Validate the generated DemoScript ──────────────────────────────

const valid = validateDemoScript(script);
console.log(`\n✓ Generated ${script.steps.length} steps, valid: ${valid}`);

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

// ─── Step 3: Export to HTML ──────────────────────────────────────────────────
//
// KNOWN ISSUE: The @cue-vin/player barrel export includes WebComponent code
// (HTMLElement, customElements) that crashes in Node.js. The e2e example
// works around this by importing from source directly, but we use npm packages.
//
// Strategy: Try dynamic import of the barrel export. If it fails, replicate
// exportToHtml() logic manually — it's a pure string builder with no
// browser API dependencies.

let html: string;
let usedFallback = false;

try {
  // Attempt: import from @cue-vin/player barrel
  const playerModule = await import("@cue-vin/player");
  const exportFn = playerModule.exportToHtml;
  if (typeof exportFn === "function") {
    html = exportFn({ script, title: "Taskly — Project Management Demo" });
    console.log("\n✓ exportToHtml() from @cue-vin/player succeeded");
  } else {
    throw new Error("exportToHtml is not a function");
  }
} catch (err: any) {
  console.warn(`\n⚠ import from @cue-vin/player failed: ${err.message}`);
  console.log("  Falling back to manual HTML generation (replicating exportToHtml logic)...");

  // Fallback: replicate exportToHtml() — it's a pure string builder
  html = buildHtmlFallback(script, "Taskly — Project Management Demo");
  usedFallback = true;
  console.log("✓ Manual HTML fallback generated successfully");
}

// ─── Step 4: Write index.html ────────────────────────────────────────────────

const outputPath = resolve(__dirname, "index.html");
writeFileSync(outputPath, html);
console.log(`\n✓ Written to ${outputPath} (${html.length} bytes)`);
if (usedFallback) {
  console.log("  (Generated using manual fallback — see README.md for details)");
}

// ─── Fallback HTML builder ──────────────────────────────────────────────────
/**
 * Replicates exportToHtml() from @cue-vin/player/src/export.ts
 * since the barrel export crashes in Node.js due to HTMLElement references.
 */
function buildHtmlFallback(
  script: any,
  title: string,
  width = 840,
  height = 520
): string {
  const scriptJson = JSON.stringify(script);
  const bg = script.theme?.bg ?? "#0a0a0a";
  const accent = script.theme?.accent ?? "#C91C1C";
  const font =
    script.theme?.font ??
    "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  const cdnUrl = "https://unpkg.com/@cue-vin/player@latest/dist/cue-player.iife.js";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    body {
      background: ${escapeHtml(bg)};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ${escapeHtml(font)};
    }
  </style>
</head>
<body>
  <cue-embed id="player" width="${width}" height="${height}"></cue-embed>

  <script>window.__CUE_SCRIPT__ = ${scriptJson};</script>
  <script src="${escapeHtml(cdnUrl)}"></script>

  <script>
    if (window.Cue && typeof window.Cue.initCue === 'function') {
      window.Cue.initCue();
    }
    var player = document.getElementById('player');
    if (player && window.__CUE_SCRIPT__) {
      player.setAttribute('data', JSON.stringify(window.__CUE_SCRIPT__));
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
