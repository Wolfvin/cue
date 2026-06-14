import type { DemoScript, DemoStep } from "@cue-vin/core";
import { captureScreenshot } from "./capture.js";

// ─── Types ─────────────────────────────────────────────────────────────────

/** A single action to execute during a recording session. */
export interface CaptureAction {
  /** Action type. */
  type: "navigate" | "click" | "hover" | "type" | "wait" | "screenshot";
  /** URL to navigate to (required for `type: "navigate"`). */
  url?: string;
  /** CSS selector for the target element (required for click/hover/type). */
  selector?: string;
  /** Text to type into the selected element (required for `type: "type"`). */
  text?: string;
  /** Duration in milliseconds (used by `wait`, or as auto-advance on the resulting step). */
  duration?: number;
  /** Caption text for the resulting demo step. */
  caption?: string;
  /** Hotspot overlays to resolve from selectors. */
  hotspots?: Array<{ label: string; selector: string; alwaysShow?: boolean }>;
}

/** Options for the main `record()` function. */
export interface RecordOptions {
  /** Ordered list of capture actions to execute. */
  actions: CaptureAction[];
  /** File path where the resulting DemoScript JSON will be written. */
  outputPath: string;
  /** Viewport width in pixels. Default: 1280. */
  width?: number;
  /** Viewport height in pixels. Default: 800. */
  height?: number;
  /** Directory where screenshot PNGs are saved. Default: "./screenshots". */
  screenshotsDir?: string;
}

// ─── Internal Helpers ──────────────────────────────────────────────────────

/**
 * Execute a single CaptureAction on the Playwright page.
 * Returns when the action (and any resulting navigation) has settled.
 */
async function executeAction(
  page: import("playwright").Page,
  action: CaptureAction
): Promise<void> {
  switch (action.type) {
    case "navigate": {
      if (!action.url) throw new Error(`Action "navigate" requires a "url" field.`);
      await page.goto(action.url, { waitUntil: "networkidle" });
      break;
    }

    case "click": {
      if (!action.selector) throw new Error(`Action "click" requires a "selector" field.`);
      await page.waitForSelector(action.selector, { timeout: 10_000 });
      await page.click(action.selector);
      // Allow any navigation or animation to settle
      await page.waitForLoadState("networkidle").catch(() => {});
      break;
    }

    case "hover": {
      if (!action.selector) throw new Error(`Action "hover" requires a "selector" field.`);
      await page.waitForSelector(action.selector, { timeout: 10_000 });
      await page.hover(action.selector);
      await page.waitForTimeout(300); // Brief pause for hover effects
      break;
    }

    case "type": {
      if (!action.selector) throw new Error(`Action "type" requires a "selector" field.`);
      if (action.text === undefined) throw new Error(`Action "type" requires a "text" field.`);
      await page.waitForSelector(action.selector, { timeout: 10_000 });
      await page.fill(action.selector, action.text);
      break;
    }

    case "wait": {
      const ms = action.duration ?? 1000;
      await page.waitForTimeout(ms);
      break;
    }

    case "screenshot": {
      // Screenshot-only action — no page interaction, just pause briefly
      await page.waitForTimeout(200);
      break;
    }

    default: {
      throw new Error(`Unknown action type: "${(action as CaptureAction).type}"`);
    }
  }
}

/**
 * Ensure a directory exists on disk.
 */
async function ensureDir(dirPath: string): Promise<void> {
  const fs = await import("node:fs/promises");
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Write a DemoScript JSON file to disk.
 */
async function writeDemoScript(script: DemoScript, outputPath: string): Promise<void> {
  const fs = await import("node:fs/promises");
  const json = JSON.stringify(script, null, 2);
  await fs.writeFile(outputPath, json, "utf-8");
}

// ─── Main Record Function ──────────────────────────────────────────────────

/**
 * Run a sequence of Playwright actions, capture screenshots at each step,
 * and produce a DemoScript JSON file.
 *
 * ### Flow per step
 * 1. Execute the action (navigate / click / hover / type / wait / screenshot)
 * 2. Take a viewport screenshot → save to `screenshotsDir/step-NNN.png`
 * 3. Track pointer position from selector or last known mouse position
 * 4. Resolve hotspot positions from selectors via `element.boundingBox()`
 * 5. Build a `DemoStep` and accumulate
 * 6. After all steps, assemble `DemoScript`, write JSON to `outputPath`
 *
 * The caller is responsible for installing Playwright browsers
 * (`npx playwright install chromium`).
 */
export async function record(options: RecordOptions): Promise<DemoScript> {
  // Dynamic import so Playwright stays a peer dep and isn't bundled
  const { chromium } = await import("playwright");

  const {
    actions,
    outputPath,
    width = 1280,
    height = 800,
    screenshotsDir = "./screenshots",
  } = options;

  // Resolve screenshotsDir to an absolute path
  const path = await import("node:path");
  const absScreenshotsDir = path.resolve(screenshotsDir);
  await ensureDir(absScreenshotsDir);

  // Ensure output directory exists
  const outputDir = path.dirname(path.resolve(outputPath));
  await ensureDir(outputDir);

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2, // Crisp retina screenshots
  });
  const page = await context.newPage();

  const steps: DemoStep[] = [];

  try {
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];

      // Execute the action on the page
      await executeAction(page, action);

      // Determine pointer selector for this step
      const pointerSelector =
        action.type === "click" || action.type === "hover"
          ? action.selector
          : undefined;

      const pointerClicking = action.type === "click";

      // Capture screenshot + resolve positions
      const capture = await captureScreenshot({
        page,
        stepIndex: i,
        screenshotsDir: absScreenshotsDir,
        viewportWidth: width,
        viewportHeight: height,
        pointerSelector,
        pointerClicking,
        hotspotSelectors: action.hotspots?.map((h) => ({
          label: h.label,
          selector: h.selector,
        })),
      });

      // Build the DemoStep
      const step: DemoStep = {
        id: `step-${i}`,
        screen: capture.relativePath,
        pointer: capture.pointer,
      };

      if (action.caption) step.caption = action.caption;
      if (action.duration !== undefined) step.duration = action.duration;
      if (capture.hotspots.length > 0) step.hotspots = capture.hotspots;

      steps.push(step);
    }
  } finally {
    // Always close the browser, even on error
    await browser.close();
  }

  // Assemble DemoScript
  const script: DemoScript = {
    id: `demo-${Date.now()}`,
    title: "Recorded Demo",
    steps,
    loop: false,
  };

  // Write JSON to disk
  await writeDemoScript(script, outputPath);

  return script;
}
