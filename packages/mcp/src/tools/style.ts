/**
 * Tool handler for cue_style — recommend a curated set of cue techniques
 * based on a user's intent (vibe / goal) and optional context.
 *
 * MANIFEST-DRIVEN RETRIEVAL
 * -------------------------
 * Historically this tool resolved a small fixed map of 4 presets
 * (saas-launch, enterprise, indie-hacker, portfolio) via keyword matching.
 * That left ~87% of the technique library in packages/css/src/manifest.json
 * unreachable. This implementation reads manifest.json at runtime and ranks
 * every entry against the user's intent + context, so any technique added
 * to the manifest automatically becomes recommendable — no BOS update needed.
 *
 * RANKING ALGORITHM
 * -----------------
 *   1. Tokenize `intent` + `context` (lowercase, split on whitespace + punctuation)
 *   2. For every manifest entry, compute a match score:
 *        +1  per token that substring-matches any string in entry.vibe
 *        -2  per token that substring-matches any string in entry.avoid-when
 *      (avoid penalty is intentionally larger — avoid must be honoured.)
 *   3. Rank all entries by score; keep top 8–12 entries with score > 0.
 *   4. Aggregate never-pair lists of selected entries → response.avoid
 *      (deduped, excluding the selected entries themselves).
 *   5. Aggregate css-vars of selected entries → response.css_vars
 *      (var name → empty string placeholder; consumer fills values).
 *   6. Build a dynamic rationale citing the match count + most frequent vibe
 *      keywords across selected entries.
 *
 * BACKWARD COMPATIBILITY
 * ----------------------
 * If the intent explicitly mentions one of the legacy preset names
 * ("saas-launch", "enterprise", "indie-hacker", "portfolio") as a token,
 * that preset's technique list is prepended to the manifest-driven ranking
 * as a quick-shortcut. Consumers that already integrated against the 4
 * preset names continue to receive them — augmented, not replaced, by
 * manifest-driven picks. The response shape
 * (preset/techniques/avoid/css_vars/rationale) is unchanged.
 *
 * The 4 preset technique lists below are duplicated from
 * packages/css/src/presets.ts (the canonical source). They are stable
 * curated data and are duplicated here so the MCP package can resolve the
 * legacy quick-shortcut without importing TS source from @cue-vin/css
 * (the css package ships source .ts, no compiled output). If a preset is
 * updated in presets.ts, update the matching entry here too.
 *
 * INVARIANTS
 * ----------
 *   - cue_style NEVER throws — every code path returns valid JSON.
 *   - On no-match (no entry with score > 0) we fall back to entries whose
 *     vibe contains "premium" or "modern" — never throw, never empty.
 *   - manifest.json and cue.css are pure consumers' data sources; we do
 *     not modify them.
 */

import { z } from "zod";
import { createRequire } from "node:module";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Load manifest.json at runtime via createRequire.
 *
 * Using `require()` instead of a static ESM import sidesteps Node v24's
 * strict `with { type: "json" }` import-attribute requirement and works
 * identically in CJS and ESM builds (tsup emits both). `import.meta.url`
 * is the standard base for this in ESM; in CJS it falls back to an empty
 * string, which `createRequire` tolerates (it then resolves relative to
 * the calling file's __dirname, which is the dist directory — same place
 * where `@cue-vin/css` is symlinked into node_modules).
 */
const require = createRequire(import.meta.url);
const manifestData = require("@cue-vin/css/manifest") as Record<
  string,
  ManifestEntry | string
>;

/** Zod schema for the cue_style tool input. */
export const styleToolSchema = {
  intent: z.string().describe(
    "Description of the desired vibe / goal, e.g. \"premium landing page like Apple\", \"playful mobile app\", \"enterprise dashboard\"."
  ),
  context: z.string().optional().describe(
    "Optional extra context — industry, audience, constraints, etc. Combined with `intent` when matching keywords."
  ),
};

/** Shape of a single manifest entry. */
interface ManifestEntry {
  class: string;
  category: string;
  vibe: string[];
  "avoid-when": string[];
  pairs: string[];
  "never-pair": string[];
  timing: string;
  "css-vars": string[];
}

/** Filter to just the technique entries (skip $schema / $comment). */
const MANIFEST_ENTRIES: ManifestEntry[] = Object.values(manifestData).filter(
  (v): v is ManifestEntry =>
    typeof v === "object" && v !== null && typeof (v as ManifestEntry).class === "string"
);

/**
 * Legacy preset technique lists.
 *
 * Duplicated from packages/css/src/presets.ts (canonical source) so the
 * MCP package can resolve the backward-compat quick-shortcut without
 * importing TS source from @cue-vin/css. See file header for rationale.
 *
 * KEEP IN SYNC with presets.ts if either file changes.
 */
const LEGACY_PRESETS: Record<
  "saas-launch" | "enterprise" | "indie-hacker" | "portfolio",
  string[]
> = {
  "saas-launch": [
    "cue-cinematic",
    "cue-enter",
    "cue-enter-fade",
    "cue-stagger-1",
    "cue-stagger-2",
    "cue-stagger-3",
    "cue-stagger-4",
    "fx-rise",
    "cue-ambient",
    "cue-group",
    "cue-hover-glow",
    "cue-hover-lift",
  ],
  enterprise: [
    "cue-enter-fade",
    "cue-enter-slide-down",
    "fx-fade-in",
    "cue-step-enter",
    "cue-step-enter-active",
    "cue-step-exit",
    "cue-step-exit-active",
    "cue-hover-lift",
    "cue-hover-scale",
  ],
  "indie-hacker": [
    "cue-marquee",
    "cue-marquee-track",
    "cue-enter-bounce",
    "cue-enter-slide-left",
    "cue-enter-slide-right",
    "cue-enter",
    "cue-stagger-1",
    "cue-stagger-2",
    "cue-stagger-3",
    "fx-slide-in",
    "cue-hover-scale",
  ],
  portfolio: [
    "cue-cinematic",
    "cue-enter-fade",
    "fx-rise",
    "fx-fade-in",
    "cue-stagger-2",
    "cue-stagger-4",
    "cue-stagger-6",
    "cue-hover-lift",
  ],
};

const LEGACY_PRESET_NAMES = Object.keys(LEGACY_PRESETS) as Array<
  keyof typeof LEGACY_PRESETS
>;

/**
 * Tokenize the intent + context into lowercase individual words.
 * Splits on any run of whitespace or punctuation (hyphens, underscores,
 * slashes, commas, periods, etc.) — so "saas-launch", "saas_launch", and
 * "saas launch" all produce the same token stream.
 *
 * Returns de-duplicated tokens, length 2+, to avoid noise from single-char
 * punctuation fragments.
 */
function tokenize(...sources: string[]): string[] {
  const tokens = new Set<string>();
  for (const src of sources) {
    if (typeof src !== "string") continue;
    const parts = src
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter((t) => t.length >= 2);
    for (const p of parts) tokens.add(p);
  }
  return [...tokens];
}

/** Scored manifest entry. */
interface ScoredEntry {
  entry: ManifestEntry;
  score: number;
  /** Vibe strings from this entry that matched at least one token (for rationale). */
  matchedVibes: string[];
}

/**
 * Score every manifest entry against the user's token stream.
 *
 * Scoring rules (per spec):
 *   +1  for each token that substring-matches any string in entry.vibe
 *   -2  for each token that substring-matches any string in entry.avoid-when
 *
 * "Substring match" is bidirectional: a token like "premium" matches a vibe
 * "premium" (exact) but also matches "premium-modern" or "playful-premium"
 * (vibe contains token), and a token like "ai" matches vibe "ai-agent"
 * (vibe contains token). We also allow token-contains-vibe so a token like
 * "dashboards" matches vibe "dashboard" (plural tolerance) and a token like
 * "playfulness" matches vibe "playful".
 */
function scoreEntries(tokens: string[]): ScoredEntry[] {
  const scored: ScoredEntry[] = [];

  for (const entry of MANIFEST_ENTRIES) {
    let score = 0;
    const matchedVibes = new Set<string>();

    for (const token of tokens) {
      // +1: token overlaps any vibe string (either direction, substring).
      for (const vibe of entry.vibe ?? []) {
        const v = vibe.toLowerCase();
        if (v.includes(token) || token.includes(v)) {
          score += 1;
          matchedVibes.add(vibe);
          break; // one token → at most one +1 from the vibe list
        }
      }

      // -2: token overlaps any avoid-when string (either direction, substring).
      // Larger penalty — avoid must be honoured strongly.
      for (const avoid of entry["avoid-when"] ?? []) {
        const a = avoid.toLowerCase();
        if (a.includes(token) || token.includes(a)) {
          score -= 2;
          break; // one token → at most one -2 from the avoid-when list
        }
      }
    }

    if (score !== 0 || matchedVibes.size > 0) {
      scored.push({ entry, score, matchedVibes: [...matchedVibes] });
    }
  }

  return scored;
}

/** Pick the top N scored entries with score > 0, capped between 8 and 12. */
function pickTopEntries(scored: ScoredEntry[], cap = 10): ScoredEntry[] {
  const positive = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return positive.slice(0, Math.max(8, Math.min(12, cap)));
}

/**
 * Fallback for the no-match case (no entry scored > 0): return entries whose
 * vibe list contains "premium" or "modern" — safe, broadly applicable defaults.
 * Never throws, never returns empty.
 */
function fallbackEntries(): ScoredEntry[] {
  const fallbacks = MANIFEST_ENTRIES.filter(
    (e) =>
      (e.vibe ?? []).some((v) => v === "premium" || v === "modern")
  );
  if (fallbacks.length === 0) {
    // Defensive: if even the fallback set is empty (shouldn't happen with 308
    // entries), return the first 8 manifest entries verbatim.
    return MANIFEST_ENTRIES.slice(0, 8).map((entry) => ({
      entry,
      score: 0,
      matchedVibes: [],
    }));
  }
  return fallbacks.slice(0, 10).map((entry) => ({
    entry,
    score: 0,
    matchedVibes: (entry.vibe ?? []).filter(
      (v) => v === "premium" || v === "modern"
    ),
  }));
}

/**
 * Detect whether the user explicitly mentioned a legacy preset name as a
 * token. If so, return that preset name so the caller can short-circuit
 * and prepend its technique list.
 *
 * Tokenizer splits "saas-launch" / "saas_launch" / "saas launch" all to
 * ["saas","launch"]. We reconstruct by joining tokens with "-" and checking
 * whether any legacy preset name is a substring of that joined form (this
 * catches both "indie hacker" → "indie-hacker" and "saas-launch" → "saas-launch").
 */
function detectLegacyPreset(
  tokens: string[]
): keyof typeof LEGACY_PRESETS | null {
  const joined = tokens.join("-");
  for (const p of LEGACY_PRESET_NAMES) {
    if (joined.includes(p)) return p;
  }
  return null;
}

/** Aggregate never-pair lists from selected entries, minus the selected entries themselves. */
function aggregateAvoid(selected: ScoredEntry[]): string[] {
  const selectedClasses = new Set(selected.map((s) => s.entry.class));
  const avoid = new Set<string>();
  for (const s of selected) {
    for (const np of s.entry["never-pair"] ?? []) {
      if (!selectedClasses.has(np)) avoid.add(np);
    }
  }
  return [...avoid];
}

/** Aggregate css-vars from selected entries (var name → placeholder value). */
function aggregateCssVars(selected: ScoredEntry[]): Record<string, string> {
  const cssVars: Record<string, string> = {};
  for (const s of selected) {
    for (const v of s.entry["css-vars"] ?? []) {
      // First-write-wins: keep the first occurrence stable. Value is left
      // empty — the consumer is expected to set CSS var values to taste,
      // and we cannot guess the right value without runtime context.
      if (!(v in cssVars)) cssVars[v] = "";
    }
  }
  return cssVars;
}

/** Tally vibe keywords across selected entries; return the top N (default 5). */
function topVibes(selected: ScoredEntry[], n = 5): string[] {
  const counts = new Map<string, number>();
  for (const s of selected) {
    for (const v of s.matchedVibes) {
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([v]) => v);
}

/** Assemble the dynamic rationale string. */
function buildRationale(
  intent: string,
  selected: ScoredEntry[],
  isFallback: boolean,
  isLegacyShortcut: boolean,
  legacyPreset: keyof typeof LEGACY_PRESETS | null
): string {
  const matchCount = selected.length;
  const vibes = topVibes(selected, 5);
  const vibesClause =
    vibes.length > 0
      ? ` Dominant vibe signals: ${vibes.join(", ")}.`
      : "";

  if (isLegacyShortcut && legacyPreset) {
    return (
      `Legacy preset "${legacyPreset}" detected in intent — using that preset's curated technique list as a quick-shortcut, augmented with ${matchCount} manifest-driven picks.` +
      vibesClause
    );
  }

  if (isFallback) {
    return (
      `No strong match found for intent "${intent}" — falling back to broadly applicable premium/modern techniques. ${matchCount} techniques selected.` +
      vibesClause
    );
  }

  return (
    `Manifest-driven retrieval matched ${matchCount} techniques for intent "${intent}".` +
    vibesClause
  );
}

/**
 * Handle the cue_style tool call.
 * Returns a JSON string with the recommended preset, techniques, avoid list,
 * CSS variables, and rationale.
 *
 * This tool never throws — on any unexpected error it falls back to a safe
 * default recommendation so callers always receive valid JSON.
 */
export async function handleStyle(
  args: Record<string, unknown>
): Promise<CallToolResult> {
  try {
    const raw = args as { intent?: unknown; context?: unknown };

    // Normalize inputs — treat anything non-string as empty.
    const intent = typeof raw.intent === "string" ? raw.intent : "";
    const context = typeof raw.context === "string" ? raw.context : "";

    // Empty intent → fall back to a safe default with a clear note.
    if (intent.trim() === "") {
      const fallback = fallbackEntries();
      const techniques = fallback.map((s) => s.entry.class);
      const avoid = aggregateAvoid(fallback);
      const cssVars = aggregateCssVars(fallback);
      const result = {
        preset: "manifest-driven",
        techniques,
        avoid,
        css_vars: cssVars,
        rationale:
          "No intent provided — defaulting to broadly applicable premium/modern techniques. Provide a non-empty `intent` (e.g. \"premium SaaS landing page\") for a more tailored recommendation.",
      };
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    const tokens = tokenize(intent, context);

    // ── Backward-compat quick-shortcut ─────────────────────────────────
    // If the user explicitly named a legacy preset, prepend its curated
    // technique list. The manifest-driven ranking still runs and augments
    // the result, but the legacy preset's picks come first so existing
    // consumers continue to see their expected techniques.
    const legacyPreset = detectLegacyPreset(tokens);
    const legacyTechniques = legacyPreset
      ? LEGACY_PRESETS[legacyPreset] ?? []
      : [];

    // ── Manifest-driven ranking ────────────────────────────────────────
    const scored = scoreEntries(tokens);
    let selected = pickTopEntries(scored);
    let isFallback = false;

    if (selected.length === 0) {
      selected = fallbackEntries();
      isFallback = true;
    }

    // Compose final technique list: legacy preset first (if applicable),
    // then manifest-driven picks, deduped, preserving order.
    const techniqueSet = new Set<string>(legacyTechniques);
    const techniques = [...legacyTechniques];
    for (const s of selected) {
      if (!techniqueSet.has(s.entry.class)) {
        techniques.push(s.entry.class);
        techniqueSet.add(s.entry.class);
      }
    }

    const avoid = aggregateAvoid(selected).filter((a) => !techniqueSet.has(a));
    const cssVars = aggregateCssVars(selected);
    const rationale = buildRationale(
      intent,
      selected,
      isFallback,
      legacyPreset !== null,
      legacyPreset
    );

    // `preset` field is preserved for backward compat. Value is
    // "manifest-driven" for the new path, or the legacy preset name when
    // the quick-shortcut fired.
    const result = {
      preset: legacyPreset ?? "manifest-driven",
      techniques,
      avoid,
      css_vars: cssVars,
      rationale,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    // Defensive: should never happen given the logic above, but we still
    // guarantee a valid JSON response. Fall back to a small hand-picked
    // safe set so the consumer always gets something usable.
    const message = error instanceof Error ? error.message : String(error);
    const fallback = fallbackEntries();
    const result = {
      preset: "manifest-driven",
      techniques: fallback.map((s) => s.entry.class),
      avoid: aggregateAvoid(fallback),
      css_vars: aggregateCssVars(fallback),
      rationale: `Falling back to default techniques due to an unexpected error: ${message}`,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      isError: true,
    };
  }
}
