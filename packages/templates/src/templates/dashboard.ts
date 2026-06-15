/**
 * Dashboard template — generates a metrics dashboard with
 * greeting, metric cards, and a grid layout.
 */

import type { DashboardTemplateConfig, DashboardMetric, ResolvedTheme } from "../types";

/** Default metrics when none are provided. */
const DEFAULT_METRICS: DashboardMetric[] = [
  { label: "Revenue", value: "$42,500", change: "+12.5%", positive: true, icon: "💰" },
  { label: "Users", value: "1,234", change: "+8.2%", positive: true, icon: "👥" },
  { label: "Orders", value: "567", change: "-3.1%", positive: false, icon: "📦" },
  { label: "Conversion", value: "4.8%", change: "+0.6%", positive: true, icon: "📈" },
];

/**
 * Render a dashboard template as an HTML string.
 */
export function renderDashboard(config: DashboardTemplateConfig, theme: ResolvedTheme): string {
  const {
    title = "Dashboard",
    metrics = DEFAULT_METRICS,
    greeting,
    columns = 2,
  } = config;

  const greetingHtml = greeting
    ? `<p class="dash-greeting">${esc(greeting)}</p>`
    : "";

  const metricsHtml = metrics.map((m) => renderMetric(m, theme)).join("\n");

  return `<div class="dash-wrapper">
  <header class="dash-header">
    <div>
      <h1 class="dash-title">${esc(title)}</h1>
      ${greetingHtml}
    </div>
  </header>
  <div class="dash-grid" style="grid-template-columns:repeat(${columns},1fr)">
    ${metricsHtml}
  </div>
</div>`;
}

/** Render a single metric card. */
function renderMetric(m: DashboardMetric, t: ResolvedTheme): string {
  const changeHtml = m.change
    ? `<span class="metric-change ${m.positive !== false ? "positive" : "negative"}">${esc(m.change)}</span>`
    : "";

  const iconHtml = m.icon
    ? `<span class="metric-icon">${esc(m.icon)}</span>`
    : "";

  return `<div class="metric-card">
  <div class="metric-top">
    <span class="metric-label">${esc(m.label)}</span>
    ${iconHtml}
  </div>
  <div class="metric-value">${esc(m.value)}</div>
  ${changeHtml}
</div>`;
}

/** HTML-escape a string. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** CSS for the dashboard template. */
export function dashboardCSS(t: ResolvedTheme): string {
  return `<style>
.dash-wrapper{height:100%;padding:24px;background:var(--t-bg);display:flex;flex-direction:column;gap:20px;overflow:hidden}
.dash-header{display:flex;align-items:center;justify-content:space-between}
.dash-title{font-size:22px;font-weight:700;color:var(--t-text)}
.dash-greeting{font-size:13px;color:var(--t-text-muted);margin-top:4px}
.dash-grid{display:grid;gap:14px;flex:1;align-content:start}
.metric-card{background:var(--t-bg-card);border:1px solid var(--t-border);border-radius:var(--t-radius);padding:16px 18px;display:flex;flex-direction:column;gap:6px}
.metric-top{display:flex;align-items:center;justify-content:space-between}
.metric-label{font-size:12px;color:var(--t-text-muted);font-weight:500}
.metric-icon{font-size:18px}
.metric-value{font-size:24px;font-weight:700;color:var(--t-text)}
.metric-change{font-size:11px;font-weight:600;padding:2px 6px;border-radius:6px;display:inline-block;margin-top:2px}
.metric-change.positive{background:rgba(34,197,94,.15);color:#22c55e}
.metric-change.negative{background:rgba(239,68,68,.15);color:#ef4444}
</style>`;
}
