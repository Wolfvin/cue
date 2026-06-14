import type { DemoHotspot, DemoPointer } from "@cue-vin/core";

// ─── Types ─────────────────────────────────────────────────────────────────

/** Result of capturing a single screenshot. */
export interface CaptureResult {
  /** Relative path to the saved PNG file (relative to screenshotsDir). */
  relativePath: string;
  /** Absolute path to the saved PNG file. */
  absolutePath: string;
  /** Pointer position as viewport-relative fractions (0–1). */
  pointer: DemoPointer;
  /** Resolved hotspot positions as viewport-relative fractions. */
  hotspots: DemoHotspot[];
}

/** Options for the screenshot capture helper. */
export interface CaptureScreenshotOptions {
  /** Playwright Page instance. */
  page: import("playwright").Page;
  /** Step index used to generate the screenshot filename. */
  stepIndex: number;
  /** Directory where screenshots are saved (absolute path). */
  screenshotsDir: string;
  /** Viewport width (used to normalize coordinates). */
  viewportWidth: number;
  /** Viewport height (used to normalize coordinates). */
  viewportHeight: number;
  /** Optional CSS selector whose center becomes the pointer position. */
  pointerSelector?: string;
  /** Whether the pointer should appear in a clicking state. */
  pointerClicking?: boolean;
  /** Hotspot definitions with CSS selectors to resolve positions for. */
  hotspotSelectors?: Array<{ label: string; selector: string; alwaysShow?: boolean }>;
}

// ─── Internal: Extended Window for mouse tracking ──────────────────────────

/**
 * Interface for the custom properties we inject onto `window` to track
 * mouse position across Playwright actions.
 */
interface CueWindow extends Window {
  __cueMouseTrackerInjected?: boolean;
  __cueMouseX?: number;
  __cueMouseY?: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Resolve the center point of an element matching `selector` as viewport-relative
 * fractions (0–1). Returns `undefined` if the element is not found or has zero size.
 */
async function resolveSelectorPosition(
  page: import("playwright").Page,
  selector: string,
  viewportWidth: number,
  viewportHeight: number
): Promise<{ x: number; y: number } | undefined> {
  const element = await page.$(selector);
  if (!element) return undefined;

  const box = await element.boundingBox();
  if (!box || box.width === 0 || box.height === 0) return undefined;

  return {
    x: (box.x + box.width / 2) / viewportWidth,
    y: (box.y + box.height / 2) / viewportHeight,
  };
}

/**
 * Get the current mouse position from the page. Falls back to the center
 * of the viewport if tracking is unavailable.
 */
async function getMousePosition(
  page: import("playwright").Page,
  _viewportWidth: number,
  _viewportHeight: number
): Promise<{ x: number; y: number }> {
  try {
    const pos = await page.evaluate(() => {
      // Attempt to read the last-known mouse position injected by recorder
      const w = window as unknown as CueWindow;
      const x = w.__cueMouseX;
      const y = w.__cueMouseY;
      if (typeof x === "number" && typeof y === "number") return { x, y };
      return null;
    });
    if (pos) return pos as { x: number; y: number };
  } catch {
    // evaluate may fail on about:blank or special pages
  }

  // Default to center of viewport
  return { x: 0.5, y: 0.5 };
}

/**
 * Inject a mousemove listener into the page so we can track the cursor
 * position across actions. Safe to call multiple times — idempotent.
 */
async function injectMouseTracker(page: import("playwright").Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as CueWindow;
    if (w.__cueMouseTrackerInjected) return;
    w.__cueMouseTrackerInjected = true;
    document.addEventListener("mousemove", (e) => {
      w.__cueMouseX = e.clientX;
      w.__cueMouseY = e.clientY;
    });
  });
}

// ─── Main Capture Function ─────────────────────────────────────────────────

/**
 * Capture a screenshot and resolve pointer + hotspot positions.
 *
 * 1. Injects a mouse tracker into the page (idempotent).
 * 2. Takes a viewport screenshot and saves it as a PNG.
 * 3. Resolves pointer position from a selector (if provided) or last known
 *    mouse position.
 * 4. Resolves hotspot positions from selectors via `element.boundingBox()`.
 *
 * All coordinates are returned as viewport-relative fractions (0–1) so they
 * integrate directly into `DemoStep.pointer` and `DemoStep.hotspots`.
 */
export async function captureScreenshot(
  options: CaptureScreenshotOptions
): Promise<CaptureResult> {
  const {
    page,
    stepIndex,
    screenshotsDir,
    viewportWidth,
    viewportHeight,
    pointerSelector,
    pointerClicking,
    hotspotSelectors,
  } = options;

  // Inject mouse tracker for position tracking
  await injectMouseTracker(page);

  // Generate filename
  const filename = `step-${String(stepIndex).padStart(3, "0")}.png`;
  const absolutePath = `${screenshotsDir}/${filename}`;
  const relativePath = filename;

  // Take screenshot
  await page.screenshot({ path: absolutePath, fullPage: false });

  // Resolve pointer position
  let pointer: DemoPointer;
  if (pointerSelector) {
    const pos = await resolveSelectorPosition(
      page,
      pointerSelector,
      viewportWidth,
      viewportHeight
    );
    if (pos) {
      pointer = { x: pos.x, y: pos.y, clicking: pointerClicking ?? false };
    } else {
      // Selector not found — fall back to tracked mouse position
      const mousePos = await getMousePosition(page, viewportWidth, viewportHeight);
      pointer = { x: mousePos.x, y: mousePos.y, clicking: pointerClicking ?? false };
    }
  } else {
    // No selector — use tracked mouse position (already 0–1 fractions)
    const mousePos = await getMousePosition(page, viewportWidth, viewportHeight);
    pointer = { x: mousePos.x, y: mousePos.y, clicking: pointerClicking ?? false };
  }

  // Resolve hotspot positions
  const hotspots: DemoHotspot[] = [];
  if (hotspotSelectors && hotspotSelectors.length > 0) {
    for (let i = 0; i < hotspotSelectors.length; i++) {
      const hs = hotspotSelectors[i];
      const pos = await resolveSelectorPosition(
        page,
        hs.selector,
        viewportWidth,
        viewportHeight
      );
      if (pos) {
        const hotspot: DemoHotspot = {
          id: `hotspot-${stepIndex}-${i}`,
          x: pos.x,
          y: pos.y,
          label: hs.label,
        };
        if (hs.alwaysShow) hotspot.alwaysShow = hs.alwaysShow;
        hotspots.push(hotspot);
      }
    }
  }

  return { relativePath, absolutePath, pointer, hotspots };
}
