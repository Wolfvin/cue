/** A single hotspot overlay positioned on a demo step. */
export interface DemoHotspot {
  /** Unique identifier for this hotspot. */
  id: string;
  /** X position as a fraction (0–1) of the slide width. */
  x: number;
  /** Y position as a fraction (0–1) of the slide height. */
  y: number;
  /** Short label displayed on the hotspot. */
  label: string;
  /** Whether the hotspot is always visible (not just on hover). */
  alwaysShow?: boolean;
}

/** An annotation overlay drawn on a demo step. */
export interface DemoAnnotation {
  /** Shape / type of annotation. */
  type: "arrow" | "box" | "text";
  /** Additional properties specific to each annotation type. */
  [key: string]: unknown;
}

/** Pointer position and click state for a demo step. */
export interface DemoPointer {
  /** X position as a fraction (0–1) of the slide width. */
  x: number;
  /** Y position as a fraction (0–1) of the slide height. */
  y: number;
  /** Whether the pointer appears in a clicking state. */
  clicking?: boolean;
}

/** Theme configuration for a demo script. */
export interface DemoTheme {
  /** Accent color used for highlights and interactive elements. Default: "#C91C1C". */
  accent?: string;
  /** Background color of the demo theater. Default: "#0a0a0a". */
  bg?: string;
  /** Font family applied to captions and labels. */
  font?: string;
}

/** A single step in a demo script. */
export interface DemoStep {
  /** Unique identifier for this step. */
  id: string;
  /** Auto-advance duration in milliseconds. `undefined` means manual advance. */
  duration?: number;
  /** Screenshot or image URL/base64 rendered via ScreenSlide. */
  screen?: string;
  /** Pointer position and click state. */
  pointer?: DemoPointer;
  /** Interactive hotspot overlays. */
  hotspots?: DemoHotspot[];
  /** Annotation overlays (arrows, boxes, text). */
  annotations?: DemoAnnotation[];
  /** Caption text displayed below the slide. */
  caption?: string;
}

/** JSON-driven demo configuration that an AI agent generates and cue renders. */
export interface DemoScript {
  /** Unique identifier for this demo. */
  id: string;
  /** Display title of the demo. */
  title: string;
  /** Ordered list of demo steps. */
  steps: DemoStep[];
  /** Whether the demo loops back to the first step after the last. */
  loop?: boolean;
  /** Visual theme applied to the demo. */
  theme?: DemoTheme;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Validate that an unknown value conforms to the DemoScript interface.
 * Performs structural checks on required fields; returns a type guard.
 */
export function validateDemoScript(script: unknown): script is DemoScript {
  if (typeof script !== "object" || script === null) return false;

  const obj = script as Record<string, unknown>;

  // Required string fields
  if (typeof obj.id !== "string") return false;
  if (typeof obj.title !== "string") return false;

  // steps must be an array of objects with at least an `id` string
  if (!Array.isArray(obj.steps)) return false;
  for (const step of obj.steps) {
    if (typeof step !== "object" || step === null) return false;
    if (typeof (step as Record<string, unknown>).id !== "string") return false;
  }

  // Optional fields type-checks (best-effort; skip if absent)
  if (obj.loop !== undefined && typeof obj.loop !== "boolean") return false;
  if (obj.theme !== undefined) {
    if (typeof obj.theme !== "object" || obj.theme === null) return false;
    const theme = obj.theme as Record<string, unknown>;
    if (theme.accent !== undefined && typeof theme.accent !== "string") return false;
    if (theme.bg !== undefined && typeof theme.bg !== "string") return false;
    if (theme.font !== undefined && typeof theme.font !== "string") return false;
  }

  return true;
}

/**
 * Safely retrieve a demo step by its index.
 * Returns `undefined` if the index is out of bounds.
 */
export function getDemoStep(script: DemoScript, index: number): DemoStep | undefined {
  if (index < 0 || index >= script.steps.length) return undefined;
  return script.steps[index];
}
