/**
 * Theme defaults and merge utility for @cue-vin/templates.
 */

import type { TemplateTheme, ResolvedTheme } from "./types";

/** Default theme values used when no overrides are provided. */
export const DEFAULT_THEME: ResolvedTheme = {
  accent: "#C91C1C",
  bg: "#0a0a0a",
  bgCard: "#111827",
  bgInput: "#1e293b",
  border: "#1e293b",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  font: "'Inter','Segoe UI',system-ui,-apple-system,sans-serif",
  radius: 12,
};

/**
 * Merge user-provided theme overrides with defaults.
 * Only defined values from the override are applied.
 */
export function resolveTheme(override?: TemplateTheme): ResolvedTheme {
  if (!override) return { ...DEFAULT_THEME };

  const result = { ...DEFAULT_THEME };
  for (const key of Object.keys(override) as Array<keyof TemplateTheme>) {
    const val = override[key];
    if (val !== undefined) {
      (result as Record<string, unknown>)[key] = val;
    }
  }
  return result;
}

/**
 * Generate a <style> block string with CSS custom properties from the resolved theme.
 * This is injected into every template's HTML output.
 */
export function themeToCSS(t: ResolvedTheme): string {
  return `<style>
:host{--t-accent:${t.accent};--t-bg:${t.bg};--t-bg-card:${t.bgCard};--t-bg-input:${t.bgInput};--t-border:${t.border};--t-text:${t.text};--t-text-muted:${t.textMuted};--t-text-dim:${t.textDim};--t-font:${t.font};--t-radius:${t.radius}px;--t-accent-glow:${t.accent}33}
*{margin:0;padding:0;box-sizing:border-box}
body,html{background:var(--t-bg);color:var(--t-text);font-family:var(--t-font);height:100%;overflow:hidden}
</style>`;
}
