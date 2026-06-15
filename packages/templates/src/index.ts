/**
 * @cue-vin/templates — Headless HTML template engine for cue SDK.
 *
 * Generates mock UI for DemoScript steps as self-contained HTML strings.
 * No React, no DOM dependency — pure TypeScript returning string HTML.
 *
 * @example
 * ```ts
 * import { renderTemplate } from "@cue-vin/templates";
 *
 * const html = renderTemplate({
 *   type: "login",
 *   title: "Sign In",
 *   fields: [
 *     { name: "email", type: "email", placeholder: "you@example.com" },
 *     { name: "password", type: "password", placeholder: "••••••••" },
 *   ],
 *   theme: { accent: "#C91C1C" },
 * });
 * ```
 */

// ─── Render functions ───────────────────────────────────────────────────────

export { renderTemplate, renderTemplateBody, renderTemplateCSS } from "./render";

// ─── Types ──────────────────────────────────────────────────────────────────

export type {
  TemplateTheme,
  ResolvedTheme,
  TemplateField,
  TemplateLayout,
  TemplateConfig,
  LoginTemplateConfig,
  DashboardMetric,
  DashboardTemplateConfig,
  FormTemplateConfig,
  TableRow,
  TableColumn,
  TableTemplateConfig,
  TerminalLine,
  TerminalTemplateConfig,
  TemplateConfigWithTheme,
} from "./types";

// ─── Theme utilities ────────────────────────────────────────────────────────

export { resolveTheme, DEFAULT_THEME } from "./theme";

// ─── Individual template renderers ──────────────────────────────────────────

export { renderLogin, loginCSS } from "./templates/login";
export { renderDashboard, dashboardCSS } from "./templates/dashboard";
export { renderForm, formCSS } from "./templates/form";
export { renderTable, tableCSS } from "./templates/table";
export { renderTerminal, terminalCSS } from "./templates/terminal";
