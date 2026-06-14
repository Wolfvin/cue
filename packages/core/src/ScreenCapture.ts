import type { DemoStep, DemoHotspot, DemoPointer } from "./DemoScript";

/** Options for creating a DemoStep from a screenshot. */
export interface ScreenshotToStepOptions {
  /** Image source — URL string or base64 data URI. */
  src: string;
  /** Unique identifier for the resulting step. */
  id: string;
  /** Caption text displayed below the slide. */
  caption?: string;
  /** Pointer position and click state. */
  pointer?: { x: number; y: number; clicking?: boolean };
  /** Interactive hotspot overlays. */
  hotspots?: DemoHotspot[];
  /** Auto-advance duration in milliseconds. */
  duration?: number;
}

/**
 * Create a DemoStep from a screenshot image, ready for use with ScreenSlide.
 * Validates the image source and wraps it into a fully-typed DemoStep object.
 */
export async function screenshotToStep(
  options: ScreenshotToStepOptions
): Promise<DemoStep> {
  const { src, id, caption, pointer, hotspots, duration } = options;

  const step: DemoStep = { id, screen: src };

  if (caption !== undefined) step.caption = caption;
  if (duration !== undefined) step.duration = duration;

  if (pointer !== undefined) {
    const demoPointer: DemoPointer = { x: pointer.x, y: pointer.y };
    if (pointer.clicking !== undefined) demoPointer.clicking = pointer.clicking;
    step.pointer = demoPointer;
  }

  if (hotspots !== undefined && hotspots.length > 0) {
    step.hotspots = hotspots;
  }

  return step;
}

/**
 * Convert a local file path to a base64 data URL suitable for ScreenSlide src.
 * Requires Node.js environment — will throw if fs module is unavailable.
 */
export async function fileToDataUrl(
  filePath: string,
  mimeType: string = "image/png"
): Promise<string> {
  // We intentionally avoid Node.js type references so this file compiles
  // without @types/node. The dynamic import is wrapped in try-catch; in
  // browser environments the import fails and we throw a clear error.
  type ReadFileFn = (path: string) => { toString(encoding: string): string };
  let readFileSync: ReadFileFn;
  try {
    // @ts-expect-error — dynamic Node.js import; not resolvable without @types/node
    const fs: Record<string, unknown> = await import("fs");
    readFileSync = fs.readFileSync as ReadFileFn;
  } catch {
    throw new Error("fileToDataUrl requires Node.js environment");
  }

  const buffer = readFileSync(filePath);
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Generate an interpolated pointer path between two points for smooth animation.
 * Returns an array of intermediate points (excluding the start, including the end).
 */
export function interpolatePointer(
  from: { x: number; y: number },
  to: { x: number; y: number },
  steps: number
): Array<{ x: number; y: number }> {
  if (steps <= 0) return [{ x: to.x, y: to.y }];

  const points: Array<{ x: number; y: number }> = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    points.push({
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    });
  }
  return points;
}
