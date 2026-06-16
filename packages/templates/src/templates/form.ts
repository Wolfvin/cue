/**
 * Form template — generates a multi-field data entry form
 * with title, description, labeled inputs, and submit button.
 */

import type { FormTemplateConfig, TemplateField, ResolvedTheme } from "../types";

/** Default fields when none are provided. */
const DEFAULT_FIELDS: TemplateField[] = [
  { name: "fullname", label: "Full Name", type: "text", placeholder: "John Doe", required: true },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com", required: true },
  { name: "department", label: "Department", type: "select", options: ["Engineering", "Design", "Marketing", "Sales"] },
];

/**
 * Normalize a field definition — accepts either a string (field name)
 * or a full TemplateField object.
 */
function normalizeField(f: string | TemplateField): TemplateField {
  if (typeof f === "string") {
    const typeGuess = f === "password" ? "password" : f === "email" ? "email" : "text";
    return { name: f, type: typeGuess };
  }
  return f;
}

/**
 * Render a form template as an HTML string.
 */
export function renderForm(config: FormTemplateConfig, theme: ResolvedTheme): string {
  const {
    title = "Form",
    description,
    fields = DEFAULT_FIELDS,
    submitLabel = "Submit",
    layout = "centered",
  } = config;

  const descHtml = description
    ? `<p class="form-desc">${esc(description)}</p>`
    : "";

  const fieldsHtml = fields.map((f) => renderFormField(normalizeField(f))).join("\n");

  const wrapperClass = layout === "full" ? "form-wrapper full" : "form-wrapper centered";

  return `<div class="${wrapperClass}">
  <div class="form-card">
    <h1 class="form-title">${esc(title)}</h1>
    ${descHtml}
    <form class="form-body" onsubmit="return false">
      ${fieldsHtml}
      <button type="submit" class="form-btn">${esc(submitLabel)}</button>
    </form>
  </div>
</div>`;
}

/** Render a single form field. */
function renderFormField(f: TemplateField): string {
  const label = f.label ?? capitalize(f.name);
  const inputType = f.type ?? "text";
  const placeholder = f.placeholder ?? "";
  const value = f.value ?? "";
  const required = f.required ? " required" : "";

  if (inputType === "textarea") {
    return `<div class="form-field">
  <label class="form-label" for="field-${esc(f.name)}">${esc(label)}</label>
  <textarea id="field-${esc(f.name)}" class="form-input" rows="3" placeholder="${esc(placeholder)}"${required}>${esc(value)}</textarea>
</div>`;
  }

  if (inputType === "select" && f.options) {
    const opts = f.options.map((o) => `<option value="${esc(o)}"${o === value ? " selected" : ""}>${esc(o)}</option>`).join("");
    return `<div class="form-field">
  <label class="form-label" for="field-${esc(f.name)}">${esc(label)}</label>
  <select id="field-${esc(f.name)}" class="form-input"${required}>${opts}</select>
</div>`;
  }

  return `<div class="form-field">
  <label class="form-label" for="field-${esc(f.name)}">${esc(label)}</label>
  <input id="field-${esc(f.name)}" class="form-input" type="${esc(inputType)}" placeholder="${esc(placeholder)}" value="${esc(value)}"${required}>
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

/** Capitalize the first letter. */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** CSS for the form template. */
export function formCSS(t: ResolvedTheme): string {
  return `<style>
.form-wrapper{height:100%;padding:24px;background:var(--t-bg);display:flex;flex-direction:column;overflow:auto}
.form-wrapper.centered{align-items:center;justify-content:center}
.form-wrapper.full{align-items:stretch}
.form-card{background:var(--t-bg-card);border:1px solid var(--t-border);border-radius:var(--t-radius);padding:28px 24px;width:100%;max-width:480px}
.form-wrapper.full .form-card{max-width:100%;border-radius:0;border:none}
.form-title{font-size:20px;font-weight:700;color:var(--t-text);margin-bottom:4px}
.form-desc{font-size:13px;color:var(--t-text-muted);margin-bottom:20px;line-height:1.5}
.form-body{display:flex;flex-direction:column;gap:16px}
.form-field{display:flex;flex-direction:column;gap:5px}
.form-label{font-size:12px;color:var(--t-text-muted);font-weight:500}
.form-input{padding:10px 12px;background:var(--t-bg-input);border:1px solid var(--t-border);border-radius:8px;color:var(--t-text);font-size:14px;font-family:var(--t-font);outline:none;transition:border-color .2s}
.form-input:focus{border-color:var(--t-accent)}
.form-input::placeholder{color:var(--t-text-dim)}
.form-btn{width:100%;padding:10px;background:var(--t-accent);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;font-family:var(--t-font);cursor:pointer;transition:opacity .2s,transform .15s;margin-top:4px}
.form-btn:hover{opacity:.9;transform:scale(1.01)}
</style>`;
}
