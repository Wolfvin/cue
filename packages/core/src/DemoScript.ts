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

/** Arrow annotation pointing from (x1,y1) to (x2,y2). */
export interface ArrowAnnotation {
  /** Discriminator: "arrow". */
  type: "arrow";
  /** Start X position as a fraction (0–1) of the slide width. */
  x1: number;
  /** Start Y position as a fraction (0–1) of the slide height. */
  y1: number;
  /** End X position as a fraction (0–1) of the slide width. */
  x2: number;
  /** End Y position as a fraction (0–1) of the slide height. */
  y2: number;
  /** Stroke color. Default: "#3b82f6". */
  color?: string;
  /** Optional label displayed near the arrow midpoint. */
  label?: string;
  /** Line width in pixels. Default: 2. */
  lineWidth?: number;
}

/** Highlight box annotation with optional label. */
export interface BoxAnnotation {
  /** Discriminator: "box". */
  type: "box";
  /** Top-left X position as a fraction (0–1) of the slide width. */
  x: number;
  /** Top-left Y position as a fraction (0–1) of the slide height. */
  y: number;
  /** Width as a fraction (0–1) of the slide width. */
  width: number;
  /** Height as a fraction (0–1) of the slide height. */
  height: number;
  /** Stroke color. Default: "#3b82f6". */
  color?: string;
  /** Corner radius in pixels. Default: 4. */
  cornerRadius?: number;
  /** Optional label displayed above the box. */
  label?: string;
  /** Opacity (0–1). Default: 1. */
  opacity?: number;
}

/** Text callout annotation. */
export interface TextAnnotation {
  /** Discriminator: "text". */
  type: "text";
  /** X position as a fraction (0–1) of the slide width. */
  x: number;
  /** Y position as a fraction (0–1) of the slide height. */
  y: number;
  /** Text content to display. */
  text: string;
  /** Text color. Default: "#f5f5f5". */
  color?: string;
  /** Font size in pixels. Default: 13. */
  fontSize?: number;
  /** Text alignment. Default: "left". */
  align?: "left" | "center" | "right";
}

/** Discriminated union of all annotation variants. Replaces the old loosely-typed DemoAnnotation. */
export type DemoAnnotation = ArrowAnnotation | BoxAnnotation | TextAnnotation;

/** Pointer position and click state for a demo step. */
export interface DemoPointer {
  /** X position as a fraction (0–1) of the slide width. */
  x: number;
  /** Y position as a fraction (0–1) of the slide height. */
  y: number;
  /** Whether the pointer appears in a clicking state. */
  clicking?: boolean;
}

/** Call-to-action overlay for a demo step. */
export interface DemoCta {
  /** CTA variant. */
  type: "button" | "email_capture" | "link";
  /** Label text for the button or CTA element. */
  label: string;
  /** URL for `type: "link"`, or navigation target for `type: "button"`. */
  href?: string;
  /** Placeholder text for `type: "email_capture"`. Default: "Enter your email". */
  placeholder?: string;
  /** Submit button label for `type: "email_capture"`. Default: "Get started". */
  submitLabel?: string;
  /** Message shown after email submission. Default: "Thanks! We'll be in touch.". */
  successMessage?: string;
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

/** Template configuration for rendering a step without a screenshot. */
export interface DemoTemplate {
  /** Template type — selects which built-in template to render. */
  type: "login" | "dashboard" | "form" | "table" | "terminal";
  /** Data payload passed to the template renderer. Structure depends on `type`. */
  data?: Record<string, unknown>;
  /** Theme overrides for this template step. Merged with the script-level theme. */
  theme?: DemoTheme;
}

/** A single step in a demo script. */
export interface DemoStep {
  /** Unique identifier for this step. */
  id: string;
  /** Auto-advance duration in milliseconds. `undefined` means manual advance. */
  duration?: number;
  /** Screenshot or image URL/base64 rendered via ScreenSlide. */
  screen?: string;
  /** Template configuration for rendering a step without a screenshot.
   *  When present and `screen` is absent, the player renders the template instead. */
  template?: DemoTemplate;
  /** Pointer position and click state. */
  pointer?: DemoPointer;
  /** Interactive hotspot overlays. */
  hotspots?: DemoHotspot[];
  /** Annotation overlays (arrows, boxes, text). */
  annotations?: DemoAnnotation[];
  /** Caption text displayed below the slide. */
  caption?: string;
  /** Call-to-action overlay. When present, renders a CTA on top of this step. */
  cta?: DemoCta;
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
