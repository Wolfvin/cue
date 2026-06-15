/**
 * Type definitions for @cue-vin/templates.
 *
 * Templates are "headless" — they accept configuration data and return an
 * HTML string that can be injected into a DemoScript step via `innerHTML`
 * or used as `step.screen` (data-URI encoded). No React, no DOM dependency.
 */

// ─── Theme ──────────────────────────────────────────────────────────────────

/** Color/theme overrides passed to every template. */
export interface TemplateTheme {
  /** Primary accent color. Default: "#C91C1C" */
  accent?: string;
  /** Page background color. Default: "#0a0a0a" */
  bg?: string;
  /** Card / panel background. Default: "#111827" */
  bgCard?: string;
  /** Input field background. Default: "#1e293b" */
  bgInput?: string;
  /** Border color. Default: "#1e293b" */
  border?: string;
  /** Primary text color. Default: "#f1f5f9" */
  text?: string;
  /** Muted/secondary text color. Default: "#94a3b8" */
  textMuted?: string;
  /** Dimmed text color. Default: "#64748b" */
  textDim?: string;
  /** Font family. Default: "'Inter','Segoe UI',system-ui,-apple-system,sans-serif" */
  font?: string;
  /** Border radius in px. Default: 12 */
  radius?: number;
}

/** Resolved theme with all defaults filled in. */
export interface ResolvedTheme extends Required<TemplateTheme> {}

// ─── Field Definitions ──────────────────────────────────────────────────────

/** A single input field in a form/login template. */
export interface TemplateField {
  /** Field name / identifier (e.g. "email", "password"). */
  name: string;
  /** Human-readable label. If omitted, derived from name. */
  label?: string;
  /** HTML input type. Default: "text" */
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search" | "date" | "textarea" | "select";
  /** Placeholder text. */
  placeholder?: string;
  /** Pre-filled value. */
  value?: string;
  /** Whether the field is required. Default: false */
  required?: boolean;
  /** For type="select", the available options. */
  options?: string[];
}

// ─── Layout ─────────────────────────────────────────────────────────────────

/** Layout variant for the rendered template. */
export type TemplateLayout =
  | "centered"    /** Centered card (default for login, form) */
  | "full"        /** Full-bleed, no card wrapper */
  | "split"       /** Two-column split layout */
  | "sidebar";    /** Sidebar + main content area */

// ─── Template-Specific Data ─────────────────────────────────────────────────

/** Configuration for the "login" template. */
export interface LoginTemplateConfig {
  type: "login";
  /** Form title. Default: "Sign In" */
  title?: string;
  /** Subtitle / description. */
  subtitle?: string;
  /** Input fields — accepts string names or full TemplateField objects.
   *  Default: [{ name: "email" }, { name: "password", type: "password" }] */
  fields?: Array<string | TemplateField>;
  /** Submit button label. Default: "Sign In" */
  submitLabel?: string;
  /** Brand/logo text displayed above the form. */
  brand?: string;
  /** Footer links (e.g. "Forgot password?", "Create account"). */
  footerLinks?: Array<{ label: string; href?: string }>;
}

/** A single metric card in the dashboard template. */
export interface DashboardMetric {
  /** Metric label (e.g. "Revenue"). */
  label: string;
  /** Metric value (e.g. "$42,500"). */
  value: string;
  /** Change indicator (e.g. "+12.5%"). */
  change?: string;
  /** Whether the change is positive. Default: true */
  positive?: boolean;
  /** Icon emoji or character. */
  icon?: string;
}

/** Configuration for the "dashboard" template. */
export interface DashboardTemplateConfig {
  type: "dashboard";
  /** Dashboard title. Default: "Dashboard" */
  title?: string;
  /** Metric cards to display. Default: 4 sample metrics */
  metrics?: DashboardMetric[];
  /** Optional greeting text (e.g. "Good morning, Andi"). */
  greeting?: string;
  /** Number of columns for metric grid. Default: 2 */
  columns?: number;
}

/** Configuration for the "form" template (multi-field data entry). */
export interface FormTemplateConfig {
  type: "form";
  /** Form title. Default: "Form" */
  title?: string;
  /** Form description/subtitle. */
  description?: string;
  /** Input fields — accepts string names or full TemplateField objects.
   *  Default: 3 sample fields */
  fields?: Array<string | TemplateField>;
  /** Submit button label. Default: "Submit" */
  submitLabel?: string;
  /** Layout variant. Default: "centered" */
  layout?: TemplateLayout;
}

/** A single row in the table template. */
export interface TableRow {
  /** Cell values for this row. */
  cells: string[];
  /** Row status — affects styling. */
  status?: "default" | "success" | "warning" | "error";
}

/** Column definition for the table template. */
export interface TableColumn {
  /** Column header text. */
  header: string;
  /** Column width as CSS value. Default: auto */
  width?: string;
}

/** Configuration for the "table" template. */
export interface TableTemplateConfig {
  type: "table";
  /** Table title. Default: "Data Table" */
  title?: string;
  /** Column definitions. */
  columns?: TableColumn[];
  /** Row data. Default: 4 sample rows */
  rows?: TableRow[];
  /** Whether to show row numbers. Default: true */
  showRowNumbers?: boolean;
}

/** A single log line in the terminal template. */
export interface TerminalLine {
  /** Line content (supports basic HTML for color spans). */
  text: string;
  /** Line type — affects color/styling. Default: "output" */
  type?: "prompt" | "output" | "success" | "error" | "warning" | "comment" | "command";
}

/** Configuration for the "terminal" template. */
export interface TerminalTemplateConfig {
  type: "terminal";
  /** Terminal window title. Default: "Terminal" */
  title?: string;
  /** Log lines. Default: sample command + output */
  lines?: TerminalLine[];
  /** Working directory shown in title bar. */
  cwd?: string;
  /** Shell prompt string. Default: "$ " */
  prompt?: string;
}

// ─── Union Config ───────────────────────────────────────────────────────────

/** Union of all template configuration types. */
export type TemplateConfig =
  | LoginTemplateConfig
  | DashboardTemplateConfig
  | FormTemplateConfig
  | TableTemplateConfig
  | TerminalTemplateConfig;

/** Template configuration with optional theme override. */
export interface TemplateConfigWithTheme {
  /** Template configuration. */
  config: TemplateConfig;
  /** Theme overrides. Merged with defaults. */
  theme?: TemplateTheme;
}
