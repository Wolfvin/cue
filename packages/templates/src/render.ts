/**
 * Core render function for @cue-vin/templates.
 *
 * `renderTemplate()` accepts a `TemplateConfig` (with a `type` discriminator)
 * and an optional theme override, and returns a self-contained HTML string
 * that can be injected into any DOM element via `innerHTML` or encoded as a
 * data URI for `DemoStep.screen`.
 *
 * The output includes:
 *   1. Base theme CSS (custom properties + reset)
 *   2. Template-specific CSS
 *   3. Template-specific HTML body
 *
 * All wrapped in a single root `<div>` for easy embedding.
 */

import type { TemplateConfig, TemplateTheme, ResolvedTheme } from "./types";
import { resolveTheme, themeToCSS } from "./theme";
import { renderLogin, loginCSS } from "./templates/login";
import { renderDashboard, dashboardCSS } from "./templates/dashboard";
import { renderForm, formCSS } from "./templates/form";
import { renderTable, tableCSS } from "./templates/table";
import { renderTerminal, terminalCSS } from "./templates/terminal";

/**
 * Render a template configuration into a self-contained HTML string.
 *
 * The returned string includes `<style>` blocks and the HTML body —
 * ready to be inserted into `innerHTML` or encoded as a data URI.
 *
 * @param config - Template configuration with a `type` field.
 * @param theme  - Optional theme overrides (merged with defaults).
 * @returns A complete HTML string for one demo step.
 *
 * @example
 * ```ts
 * import { renderTemplate } from "@cue-vin/templates";
 *
 * const html = renderTemplate(
 *   { type: "login", title: "Sign In", fields: ["email", "password"] },
 *   { accent: "#C91C1C" }
 * );
 * // html is a self-contained HTML string
 * ```
 */
export function renderTemplate(
  config: TemplateConfig,
  theme?: TemplateTheme,
): string {
  const resolved = resolveTheme(theme);
  const { body, css } = dispatchTemplate(config, resolved);

  return `<div class="cue-template">${themeToCSS(resolved)}${css}${body}</div>`;
}

/**
 * Render a template and return only the body HTML (no styles).
 * Useful when you want to inject styles separately or combine
 * multiple templates in one document.
 */
export function renderTemplateBody(
  config: TemplateConfig,
  theme?: TemplateTheme,
): string {
  const resolved = resolveTheme(theme);
  const { body } = dispatchTemplate(config, resolved);
  return body;
}

/**
 * Render a template and return only the CSS styles.
 * Useful for extracting styles to a `<style>` block in the `<head>`.
 */
export function renderTemplateCSS(
  config: TemplateConfig,
  theme?: TemplateTheme,
): string {
  const resolved = resolveTheme(theme);
  const { css } = dispatchTemplate(config, resolved);
  return `${themeToCSS(resolved)}${css}`;
}

// ─── Internal dispatcher ────────────────────────────────────────────────────

interface TemplateOutput {
  body: string;
  css: string;
}

function dispatchTemplate(
  config: TemplateConfig,
  theme: ResolvedTheme,
): TemplateOutput {
  switch (config.type) {
    case "login":
      return {
        body: renderLogin(config, theme),
        css: loginCSS(theme),
      };
    case "dashboard":
      return {
        body: renderDashboard(config, theme),
        css: dashboardCSS(theme),
      };
    case "form":
      return {
        body: renderForm(config, theme),
        css: formCSS(theme),
      };
    case "table":
      return {
        body: renderTable(config, theme),
        css: tableCSS(theme),
      };
    case "terminal":
      return {
        body: renderTerminal(config, theme),
        css: terminalCSS(theme),
      };
    default: {
      // Exhaustiveness check — TypeScript will error if a type is missed
      const _exhaustive: never = config;
      throw new Error(`Unknown template type: ${(config as TemplateConfig).type}`);
    }
  }
}
