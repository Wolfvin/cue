/**
 * showcase/pipeline-test/run.ts
 *
 * End-to-end pipeline test: generate() -> DemoScript -> exportToHtml() -> HTML output.
 * Covers the 5 bug fixes from PR #20 with 7 test cases.
 *
 * Run:  cd cue && pnpm install && tsx showcase/pipeline-test/run.ts
 */

import { generate } from "../../packages/core/src/index.ts";
import type { DemoScript } from "../../packages/core/src/DemoScript.ts";
import { exportToHtml } from "../../packages/player/src/export.ts";

// ─── Test harness ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function test(index: number, description: string, condition: boolean, detail?: string): void {
  const label = `Test ${index}: ${description}`;
  if (condition) {
    console.log(`PASS  ${label}`);
    passed++;
  } else {
    const msg = detail ? `${label} — ${detail}` : label;
    console.log(`FAIL  ${msg}`);
    failed++;
    failures.push(msg);
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  Test 1: generate() with CTA — step.cta is not null
// ══════════════════════════════════════════════════════════════════════════

const scriptWithCta = generate({
  id: "cta-test",
  title: "CTA Propagation Test",
  features: [
    {
      name: "Sign Up",
      description: "Join thousands of users",
      cta: { type: "email_capture", label: "Start free trial" },
    },
  ],
});

const ctaStep = scriptWithCta.steps[0];
test(
  1,
  "generate() with CTA — step.cta is not null",
  ctaStep.cta !== undefined && ctaStep.cta !== null && ctaStep.cta!.type === "email_capture",
  `step.cta = ${JSON.stringify(ctaStep.cta)}`
);

// ══════════════════════════════════════════════════════════════════════════
//  Test 2: generate() with hotspots — step.pointer auto-placed
// ══════════════════════════════════════════════════════════════════════════

const scriptWithHotspots = generate({
  id: "pointer-hotspot-test",
  title: "Pointer Auto-Placement Test (hotspot)",
  features: [
    {
      name: "Dashboard",
      description: "See your key metrics",
      hotspots: [{ label: "Revenue chart", x: 0.35, y: 0.42 }],
    },
  ],
});

const hotspotStep = scriptWithHotspots.steps[0];
test(
  2,
  "generate() with hotspots — step.pointer auto-placed",
  hotspotStep.pointer !== undefined &&
    hotspotStep.pointer!.x === 0.35 &&
    hotspotStep.pointer!.y === 0.42,
  `step.pointer = ${JSON.stringify(hotspotStep.pointer)}`
);

// ══════════════════════════════════════════════════════════════════════════
//  Test 3: generate() without hotspot/CTA — step.pointer undefined
// ══════════════════════════════════════════════════════════════════════════

const scriptPlain = generate({
  id: "no-pointer-test",
  title: "No Pointer Test",
  features: [
    {
      name: "Welcome",
      description: "Welcome to the demo",
    },
  ],
});

const plainStep = scriptPlain.steps[0];
test(
  3,
  "generate() without hotspot/CTA — step.pointer undefined",
  plainStep.pointer === undefined,
  `step.pointer = ${JSON.stringify(plainStep.pointer)}`
);

// ══════════════════════════════════════════════════════════════════════════
//  Test 4: exportToHtml() output — HTML contains autoplay attribute
// ══════════════════════════════════════════════════════════════════════════

const htmlAutoplay = exportToHtml({
  script: scriptWithCta,
  title: "Autoplay Test",
});

test(
  4,
  "exportToHtml() — HTML contains autoplay attribute",
  /<cue-embed[^>]*\bautoplay\b/.test(htmlAutoplay),
  "autoplay attribute not found on <cue-embed> tag"
);

// ══════════════════════════════════════════════════════════════════════════
//  Test 5: exportToHtml() with script.loop=true — HTML contains loop attribute
// ══════════════════════════════════════════════════════════════════════════

const loopScript: DemoScript = {
  id: "loop-test",
  title: "Loop Test",
  steps: [{ id: "step-1", caption: "Step one", duration: 3000 }],
  loop: true,
};

const htmlLoop = exportToHtml({ script: loopScript, title: "Loop Test" });

test(
  5,
  "exportToHtml() with loop=true — HTML contains loop attribute",
  /<cue-embed[^>]*\bautoplay\b[^>]*\bloop\b/.test(htmlLoop),
  "loop attribute not found on <cue-embed> tag alongside autoplay"
);

// ══════════════════════════════════════════════════════════════════════════
//  Test 6: exportToHtml() with script.loop=false — HTML does NOT contain loop
// ══════════════════════════════════════════════════════════════════════════

const noLoopScript: DemoScript = {
  id: "no-loop-test",
  title: "No Loop Test",
  steps: [{ id: "step-1", caption: "Step one", duration: 3000 }],
  loop: false,
};

const htmlNoLoop = exportToHtml({ script: noLoopScript, title: "No Loop Test" });
const cueEmbedTagNoLoop = htmlNoLoop.match(/<cue-embed[^>]*>/)?.[0] ?? "";

test(
  6,
  "exportToHtml() with loop=false — HTML does NOT contain loop attribute",
  !cueEmbedTagNoLoop.includes("loop"),
  `<cue-embed> tag unexpectedly contains 'loop': ${cueEmbedTagNoLoop}`
);

// ══════════════════════════════════════════════════════════════════════════
//  Test 7: Font string in exportToHtml() — no &#39; escaped single quotes
// ══════════════════════════════════════════════════════════════════════════

const fontScript: DemoScript = {
  id: "font-test",
  title: "Font Escaping Test",
  steps: [{ id: "step-1", caption: "Check font", duration: 3000 }],
  theme: {
    font: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
};

const htmlFont = exportToHtml({ script: fontScript, title: "Font Test" });
const styleBlock = htmlFont.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";

// Also verify the default font (no custom theme) doesn't produce &#39;
const defaultFontScript: DemoScript = {
  id: "default-font-test",
  title: "Default Font Test",
  steps: [{ id: "step-1", caption: "Default font", duration: 3000 }],
};

const htmlDefaultFont = exportToHtml({ script: defaultFontScript, title: "Default Font Test" });
const defaultStyleBlock = htmlDefaultFont.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";

const noEscapedQuotes =
  !styleBlock.includes("&#39;") && !defaultStyleBlock.includes("&#39;");

test(
  7,
  "Font string in exportToHtml() — no &#39; escaped single quotes",
  noEscapedQuotes,
  noEscapedQuotes
    ? undefined
    : `Found &#39; in style block — custom: ${styleBlock.includes("&#39;")}, default: ${defaultStyleBlock.includes("&#39;")}`
);

// ══════════════════════════════════════════════════════════════════════════
//  Summary
// ══════════════════════════════════════════════════════════════════════════

const total = passed + failed;
console.log("\n" + "=".repeat(60));
console.log(`  ${passed}/${total} tests passed`);
if (failed > 0) {
  console.log("\n  Failures:");
  for (const f of failures) {
    console.log(`    - ${f}`);
  }
}
console.log("=".repeat(60));

process.exit(failed > 0 ? 1 : 0);
