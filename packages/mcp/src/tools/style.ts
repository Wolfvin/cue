/**
 * Tool handler for cue_style — recommend a curated set of cue techniques
 * based on a user's intent (vibe / goal) and optional context.
 *
 * Returns a JSON string describing:
 *   - preset:           which curated preset was chosen
 *   - techniques:       techniques to use
 *   - avoid:            techniques to avoid
 *   - css_vars:         recommended CSS custom property overrides
 *   - rationale:        short explanation of why this preset was chosen
 *
 * The mapping is intentionally simple (case-insensitive keyword matching)
 * and always falls back to the "saas-launch" preset so the tool never
 * throws and always returns valid JSON.
 *
 * Preset data is hardcoded here (not imported from @cue-vin/css) because
 * the @cue-vin/mcp package does not depend on @cue-vin/css.
 */

import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/** Zod schema for the cue_style tool input. */
export const styleToolSchema = {
  intent: z.string().describe(
    "Description of the desired vibe / goal, e.g. \"premium landing page like Apple\", \"playful mobile app\", \"enterprise dashboard\"."
  ),
  context: z.string().optional().describe(
    "Optional extra context — industry, audience, constraints, etc. Combined with `intent` when matching keywords."
  ),
};

/** A single curated style preset. */
interface StylePreset {
  techniques: string[];
  avoid: string[];
  css_vars: Record<string, string>;
}

/** Hardcoded preset data — kept in sync with @cue-vin/css recommendations. */
const PRESETS: Record<string, StylePreset> = {
  "saas-launch": {
    techniques: ["cue-cinematic", "fx-fade-in", "cue-ambient", "cue-group", "fx-slide-in"],
    avoid: ["cue-bounce", "cue-shake", "cue-spinner"],
    css_vars: {
      "--fx-duration": "600ms",
      "--cue-step-duration": "400ms",
    },
  },
  enterprise: {
    techniques: ["cue-enter-fade", "fx-fade-in", "cue-enter-scale"],
    avoid: ["cue-bounce", "cue-shake", "cue-glow", "cue-pulse", "cue-cinematic", "cue-marquee"],
    css_vars: {
      "--fx-duration": "300ms",
      "--cue-step-duration": "250ms",
    },
  },
  "indie-hacker": {
    techniques: ["cue-marquee", "cue-marquee-track", "cue-enter-bounce", "fx-slide-in", "cue-pulse"],
    avoid: ["cue-cinematic", "fx-rise"],
    css_vars: {
      "--cue-marquee-duration": "15s",
      "--fx-duration": "200ms",
    },
  },
  portfolio: {
    techniques: ["cue-cinematic", "fx-rise", "cue-enter-fade", "cue-ambient", "cue-group"],
    avoid: ["cue-bounce", "cue-shake", "cue-spinner", "cue-marquee"],
    css_vars: {
      "--fx-duration": "800ms",
      "--fx-y": "40px",
      "--cue-step-duration": "500ms",
    },
  },
};

/** Keyword → preset mapping, evaluated in order. First match wins. */
const KEYWORD_RULES: ReadonlyArray<{ preset: string; keywords: string[]; rationale: string }> = [
  {
    preset: "saas-launch",
    keywords: ["premium", "apple", "clean", "minimal", "saas"],
    rationale:
      "Clean, premium aesthetic detected — saas-launch pairs cinematic fades with ambient effects, well-suited for product launches and modern SaaS marketing pages.",
  },
  {
    preset: "enterprise",
    keywords: ["enterprise", "corporate", "b2b", "dashboard", "professional"],
    rationale:
      "Enterprise / professional context detected — enterprise preset favors restrained, fast motion appropriate for B2B dashboards and corporate tools.",
  },
  {
    preset: "indie-hacker",
    keywords: ["playful", "indie", "hacker", "startup", "bold", "energetic"],
    rationale:
      "Playful, energetic vibe detected — indie-hacker preset uses bold marquees and bouncy entrances to convey startup energy.",
  },
  {
    preset: "portfolio",
    keywords: ["portfolio", "creative", "personal", "designer", "showcase"],
    rationale:
      "Creative / showcase intent detected — portfolio preset emphasizes cinematic, ambient motion ideal for personal and design portfolios.",
  },
];

/** Default fallback rationale when no keyword matches. */
const DEFAULT_RATIONALE =
  "No specific intent matched — defaulting to saas-launch, a versatile preset that works well for most product launches and marketing pages.";

/**
 * Determine which preset to apply for a given intent + context.
 *
 * Matching is case-insensitive and uses simple substring checks against a
 * fixed keyword list. Returns the preset name and a human-readable rationale.
 * Always returns "saas-launch" as a fallback when no rule matches.
 */
function resolvePreset(intent: string, context: string): { preset: string; rationale: string } {
  const haystack = `${intent} ${context}`.toLowerCase();

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => haystack.includes(kw))) {
      return { preset: rule.preset, rationale: rule.rationale };
    }
  }

  return { preset: "saas-launch", rationale: DEFAULT_RATIONALE };
}

/**
 * Handle the cue_style tool call.
 * Returns a JSON string with the recommended preset, techniques, avoid list,
 * CSS variables, and rationale.
 *
 * This tool never throws — on any unexpected error it falls back to the
 * saas-launch preset so callers always receive valid JSON.
 */
export async function handleStyle(
  args: Record<string, unknown>
): Promise<CallToolResult> {
  try {
    const raw = args as { intent?: unknown; context?: unknown };

    // Normalize inputs — treat anything non-string as empty.
    const intent =
      typeof raw.intent === "string" ? raw.intent : "";
    const context =
      typeof raw.context === "string" ? raw.context : "";

    // Empty intent → fall back to saas-launch with a clear note.
    if (intent.trim() === "") {
      const preset = PRESETS["saas-launch"];
      const result = {
        preset: "saas-launch",
        techniques: preset.techniques,
        avoid: preset.avoid,
        css_vars: preset.css_vars,
        rationale:
          "No intent provided — defaulting to saas-launch. Provide a non-empty `intent` (e.g. \"premium SaaS landing page\") for a more tailored recommendation.",
      };
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    const { preset, rationale } = resolvePreset(intent, context);
    const presetData = PRESETS[preset] ?? PRESETS["saas-launch"];

    const result = {
      preset,
      techniques: presetData.techniques,
      avoid: presetData.avoid,
      css_vars: presetData.css_vars,
      rationale,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    // Defensive: should never happen given the simple logic above, but
    // we still guarantee a valid JSON response.
    const message = error instanceof Error ? error.message : String(error);
    const preset = PRESETS["saas-launch"];
    const result = {
      preset: "saas-launch",
      techniques: preset.techniques,
      avoid: preset.avoid,
      css_vars: preset.css_vars,
      rationale: `Falling back to saas-launch due to an unexpected error: ${message}`,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      isError: true,
    };
  }
}
