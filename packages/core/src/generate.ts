/**
 * Heuristic DemoScript generator — transforms structured feature descriptions
 * into valid DemoScript JSON without calling an LLM.
 *
 * Agents that already have structured context (e.g. feature lists, product
 * specs) can call `generate()` to produce a ready-to-play DemoScript.
 */

import type { DemoScript, DemoStep, DemoHotspot, DemoTheme, DemoCta } from "./DemoScript";

// ─── Types ─────────────────────────────────────────────────────────────────

/** CTA (call-to-action) configuration for a feature step. */
interface GenerateCta {
  /** CTA interaction type. */
  type: "button" | "email_capture" | "link";
  /** Display label for the CTA. */
  label: string;
  /** Target URL (required when type is "link"). */
  href?: string;
}

/** Hotspot definition in generate input (simpler than DemoHotspot — no id needed). */
interface GenerateHotspot {
  /** Short label displayed on the hotspot. */
  label: string;
  /** X position as a fraction (0–1) of the slide width. */
  x: number;
  /** Y position as a fraction (0–1) of the slide height. */
  y: number;
}

/** A single feature to be converted into a DemoStep. */
interface GenerateFeature {
  /** Feature name, e.g. "Upload File". Also used to derive the step id via slugify. */
  name: string;
  /** Short description — becomes the step caption. */
  description: string;
  /** Optional path or URL to a screenshot image. */
  screenshotPath?: string;
  /** Optional hotspot overlays to highlight. */
  hotspots?: GenerateHotspot[];
  /** Optional call-to-action after this step. */
  cta?: GenerateCta;
}

/** Options for the `generate()` function. */
export interface GenerateOptions {
  /** Unique identifier for the demo. */
  id: string;
  /** Display title of the demo. */
  title: string;
  /** Ordered list of features — each becomes one DemoStep. */
  features: GenerateFeature[];
  /** Default auto-advance duration per step in milliseconds. Default: 4000. */
  defaultDuration?: number;
  /** Visual theme applied to the demo. */
  theme?: DemoTheme;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Slugify a string into a URL-safe, kebab-case identifier.
 *
 * Examples:
 *   "Upload File"    → "upload-file"
 *   "API Integration" → "api-integration"
 *   "2FA Login!"     → "2fa-login"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_]+/g, "-")     // Replace spaces and underscores with hyphens
    .replace(/--+/g, "-")        // Collapse multiple hyphens
    .replace(/^-+|-+$/g, "");    // Trim leading/trailing hyphens
}

/**
 * Build a DemoHotspot array from the simpler GenerateHotspot input.
 * Each hotspot gets an id derived from the step slug + index.
 */
function buildHotspots(
  stepSlug: string,
  hotspots?: GenerateHotspot[]
): DemoHotspot[] | undefined {
  if (!hotspots || hotspots.length === 0) return undefined;

  return hotspots.map((h, i) => ({
    id: `${stepSlug}-hotspot-${i}`,
    x: h.x,
    y: h.y,
    label: h.label,
  }));
}

// ─── Main Generator ────────────────────────────────────────────────────────

/**
 * Generate a valid DemoScript from structured feature descriptions.
 *
 * Each feature becomes one DemoStep:
 *   - `step.id`     = slugify(feature.name)
 *   - `step.caption` = feature.description
 *   - `step.screen`  = feature.screenshotPath (if provided)
 *   - `step.hotspots` = converted from feature.hotspots (if provided)
 *   - `step.duration` = defaultDuration, UNLESS the step has a CTA
 *                       (CTA steps set duration to undefined — wait for user action)
 *
 * CTA information is embedded in the step's caption as a trailing call-to-action
 * line, so it is visible in any player that renders captions.
 *
 * @param options - Generation options including id, title, features, etc.
 * @returns A valid DemoScript that can be fed directly to CuePlayer.
 *
 * @example
 * ```ts
 * import { generate } from "@cue/core";
 *
 * const script = generate({
 *   id: "my-saas-demo",
 *   title: "My SaaS Product Demo",
 *   features: [
 *     {
 *       name: "Dashboard Overview",
 *       description: "See all your key metrics at a glance.",
 *       hotspots: [{ label: "Revenue", x: 0.25, y: 0.3 }],
 *     },
 *     {
 *       name: "Upload Data",
 *       description: "Drag and drop your files to start analysis.",
 *       screenshotPath: "./screenshots/upload.png",
 *       cta: { type: "button", label: "Try Upload" },
 *     },
 *   ],
 *   defaultDuration: 5000,
 *   theme: { accent: "#3b82f6", bg: "#0a0a0a" },
 * });
 * ```
 */
export function generate(options: GenerateOptions): DemoScript {
  const {
    id,
    title,
    features,
    defaultDuration = 4000,
    theme,
  } = options;

  const steps: DemoStep[] = features.map((feature, index) => {
    if (typeof feature.name !== "string" || feature.name.trim() === "") {
      throw new Error(
        `Feature at index ${index} must have a "name" field (string). Received: ${JSON.stringify(feature)}`
      );
    }

    const stepSlug = slugify(feature.name);

    // Build the base step
    const step: DemoStep = {
      id: stepSlug,
      caption: feature.description,
    };

    // Attach screenshot if provided
    if (feature.screenshotPath) {
      step.screen = feature.screenshotPath;
    }

    // Attach hotspots if provided
    const hotspots = buildHotspots(stepSlug, feature.hotspots);
    if (hotspots) {
      step.hotspots = hotspots;
    }

    // Duration logic: steps with CTA wait for user action (undefined duration),
    // all other steps use defaultDuration.
    if (feature.cta) {
      // CTA steps: no auto-advance, player waits for user interaction
      step.duration = undefined;

      // BUG 2 FIX: Set step.cta so CtaOverlay actually renders in the player.
      // Previously only the caption text was updated — the structured CTA data
      // that CtaOverlay requires was never set on the step.
      step.cta = buildDemoCta(feature.cta);

      // Append CTA info to caption so any player can render it
      const ctaLine = buildCtaCaption(feature.cta);
      step.caption = `${feature.description}\n${ctaLine}`;
    } else {
      step.duration = defaultDuration;
    }

    // BUG 3 FIX: Auto-place pointer so the cursor moves in the player.
    // Previously generate() never set step.pointer, so ScriptedPointer
    // was never rendered and the cursor never moved.
    if (hotspots && hotspots.length > 0) {
      // Pointer at the first hotspot position
      step.pointer = { x: hotspots[0].x, y: hotspots[0].y };
    } else if (feature.cta) {
      // Pointer near center-bottom where CTA overlays typically appear
      step.pointer = { x: 0.5, y: 0.7 };
    }

    return step;
  });

  const script: DemoScript = {
    id,
    title,
    steps,
    loop: false,
  };

  if (theme) {
    script.theme = theme;
  }

  return script;
}

/**
 * Build a human-readable CTA caption line.
 * The CTA is appended to the step caption so it is visible
 * in any player that renders captions, even without CTA-specific UI.
 */
function buildCtaCaption(cta: GenerateCta): string {
  switch (cta.type) {
    case "button":
      return `[${cta.label}]`;
    case "email_capture":
      return `[${cta.label}] ✉️`;
    case "link":
      return `[${cta.label}] → ${cta.href ?? "#"}`;
    default:
      return `[${cta.label}]`;
  }
}

/**
 * Convert a GenerateCta (simplified input) into a DemoCta (full player format).
 * Fills in defaults for email_capture fields that were not provided.
 */
function buildDemoCta(cta: GenerateCta): DemoCta {
  const base: DemoCta = {
    type: cta.type,
    label: cta.label,
  };

  if (cta.href) {
    base.href = cta.href;
  }

  // email_capture defaults — ensure CtaOverlay has all required data
  if (cta.type === "email_capture") {
    base.placeholder = "Enter your email";
    base.submitLabel = cta.label;
    base.successMessage = "Thanks! We'll be in touch.";
  }

  return base;
}
