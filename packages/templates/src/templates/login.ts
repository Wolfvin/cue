/**
 * Login form template — generates a centered login form with
 * brand logo, input fields, submit button, and optional footer links.
 */

import type { LoginTemplateConfig, TemplateField, ResolvedTheme } from "../types";

/** Default fields when none are provided. */
const DEFAULT_FIELDS: TemplateField[] = [
  { name: "email", label: "Email", type: "email", placeholder: "you@example.com", required: true },
  { name: "password", label: "Password", type: "password", placeholder: "Enter your password", required: true },
];

/** Default footer links. */
const DEFAULT_FOOTER_LINKS = [
  { label: "Forgot password?", href: "#" },
  { label: "Create account", href: "#" },
];

/**
 * Normalize a field definition — accepts either a string (field name)
 * or a full TemplateField object. Strings are converted to TemplateField
 * with sensible defaults (e.g. "password" → type: "password").
 */
function normalizeField(f: string | TemplateField): TemplateField {
  if (typeof f === "string") {
    const typeGuess = f === "password" ? "password" : f === "email" ? "email" : "text";
    return { name: f, type: typeGuess };
  }
  return f;
}

/**
 * Render a login form template as an HTML string.
 */
export function renderLogin(config: LoginTemplateConfig, theme: ResolvedTheme): string {
  const {
    title = "Sign In",
    subtitle,
    fields = DEFAULT_FIELDS,
    submitLabel = "Sign In",
    brand,
    footerLinks = DEFAULT_FOOTER_LINKS,
  } = config;

  const brandHtml = brand
    ? `<div class="login-brand">${esc(brand)}</div>`
    : "";

  const subtitleHtml = subtitle
    ? `<p class="login-subtitle">${esc(subtitle)}</p>`
    : "";

  const fieldsHtml = fields.map((f) => renderField(normalizeField(f), theme)).join("\n");

  const footerHtml = footerLinks.length > 0
    ? `<div class="login-footer">${footerLinks.map(
        (l) => `<a href="${safeHref(l.href)}" class="login-link">${esc(l.label)}</a>`
      ).join("<span class=\"login-divider\">·</span>")}</div>`
    : "";

  return `${brandHtml}
<div class="login-card">
  <h1 class="login-title">${esc(title)}</h1>
  ${subtitleHtml}
  <form class="login-form" onsubmit="return false">
    ${fieldsHtml}
    <button type="submit" class="login-btn">${esc(submitLabel)}</button>
  </form>
  ${footerHtml}
</div>`;
}

/** Render a single form field. */
function renderField(f: TemplateField, t: ResolvedTheme): string {
  const label = f.label ?? capitalize(f.name);
  const inputType = f.type ?? "text";
  const placeholder = f.placeholder ?? "";
  const value = f.value ?? "";
  const required = f.required ? " required" : "";

  if (inputType === "textarea") {
    return `<div class="login-field">
  <label class="login-label" for="field-${esc(f.name)}">${esc(label)}</label>
  <textarea id="field-${esc(f.name)}" class="login-input" placeholder="${esc(placeholder)}"${required}>${esc(value)}</textarea>
</div>`;
  }

  if (inputType === "select" && f.options) {
    const opts = f.options.map((o) => `<option value="${esc(o)}"${o === value ? " selected" : ""}>${esc(o)}</option>`).join("");
    return `<div class="login-field">
  <label class="login-label" for="field-${esc(f.name)}">${esc(label)}</label>
  <select id="field-${esc(f.name)}" class="login-input"${required}>${opts}</select>
</div>`;
  }

  return `<div class="login-field">
  <label class="login-label" for="field-${esc(f.name)}">${esc(label)}</label>
  <input id="field-${esc(f.name)}" class="login-input" type="${esc(inputType)}" placeholder="${esc(placeholder)}" value="${esc(value)}"${required}>
</div>`;
}

/** HTML-escape a string for safe embedding. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Sanitize href — block javascript:/data:/vbscript: and escape for attribute context. */
function safeHref(href: string | undefined): string {
  if (!href) return "#";
  const lower = href.trim().toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return "#";
  }
  return esc(href);
}

/** Capitalize the first letter. */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** CSS for the login template. */
export function loginCSS(t: ResolvedTheme): string {
  return `<style>
.login-wrapper{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:24px;background:var(--t-bg)}
.login-brand{font-size:24px;font-weight:800;color:var(--t-accent);margin-bottom:16px;letter-spacing:1px}
.login-card{background:var(--t-bg-card);border:1px solid var(--t-border);border-radius:var(--t-radius);padding:32px 28px;width:100%;max-width:360px}
.login-title{font-size:20px;font-weight:700;color:var(--t-text);margin-bottom:4px;text-align:center}
.login-subtitle{font-size:13px;color:var(--t-text-muted);text-align:center;margin-bottom:20px}
.login-form{display:flex;flex-direction:column;gap:14px}
.login-field{display:flex;flex-direction:column;gap:4px}
.login-label{font-size:12px;color:var(--t-text-muted);font-weight:500}
.login-input{padding:10px 12px;background:var(--t-bg-input);border:1px solid var(--t-border);border-radius:8px;color:var(--t-text);font-size:14px;font-family:var(--t-font);outline:none;transition:border-color .2s}
.login-input:focus{border-color:var(--t-accent)}
.login-input::placeholder{color:var(--t-text-dim)}
.login-btn{width:100%;padding:10px;background:var(--t-accent);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;font-family:var(--t-font);cursor:pointer;transition:opacity .2s,transform .15s}
.login-btn:hover{opacity:.9;transform:scale(1.01)}
.login-footer{margin-top:16px;text-align:center;font-size:12px;color:var(--t-text-dim)}
.login-link{color:var(--t-accent);text-decoration:none}
.login-link:hover{text-decoration:underline}
.login-divider{margin:0 8px;color:var(--t-text-dim)}
</style>`;
}
