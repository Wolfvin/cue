/**
 * Terminal template — generates a terminal/log output window with
 * title bar, command prompt, and color-coded log lines.
 */

import type { TerminalTemplateConfig, TerminalLine, ResolvedTheme } from "../types";

/** Default lines when none are provided. */
const DEFAULT_LINES: TerminalLine[] = [
  { text: "$ npm run build", type: "command" },
  { text: "Building project...", type: "output" },
  { text: "✔ Compiled successfully in 1.2s", type: "success" },
  { text: "✔ 12 modules transformed", type: "success" },
  { text: "Output: dist/index.js (42.8 kB)", type: "output" },
  { text: "Output: dist/index.mjs (38.1 kB)", type: "output" },
  { text: "// Ready to deploy!", type: "comment" },
];

/**
 * Render a terminal template as an HTML string.
 */
export function renderTerminal(config: TerminalTemplateConfig, theme: ResolvedTheme): string {
  const {
    title = "Terminal",
    lines = DEFAULT_LINES,
    cwd,
    prompt = "$ ",
  } = config;

  const titleText = cwd ? `${esc(title)} — ${esc(cwd)}` : esc(title);

  const linesHtml = lines.map((line) => {
    const prefix = line.type === "command" ? `<span class="term-prompt">${esc(prompt)}</span>` : "";
    const typeClass = line.type ? ` term-${line.type}` : "";
    return `<div class="term-line${typeClass}">${prefix}${esc(line.text)}</div>`;
  }).join("\n");

  return `<div class="term-wrapper">
  <div class="term-window">
    <div class="term-titlebar">
      <div class="term-dots">
        <span class="term-dot dot-red"></span>
        <span class="term-dot dot-yellow"></span>
        <span class="term-dot dot-green"></span>
      </div>
      <span class="term-titletext">${titleText}</span>
    </div>
    <div class="term-body">
      ${linesHtml}
      <div class="term-cursor-line">
        <span class="term-prompt">${esc(prompt)}</span><span class="term-cursor"></span>
      </div>
    </div>
  </div>
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

/** CSS for the terminal template. */
export function terminalCSS(t: ResolvedTheme): string {
  // Use a monospace font override for terminal
  const monoFont = "'SFMono-Regular','Cascadia Code','Fira Code','Consolas',monospace";

  return `<style>
.term-wrapper{height:100%;padding:24px;background:var(--t-bg);display:flex;align-items:center;justify-content:center}
.term-window{width:100%;max-width:640px;background:var(--t-bg-card);border:1px solid var(--t-border);border-radius:var(--t-radius);overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.4)}
.term-titlebar{display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(0,0,0,.3);border-bottom:1px solid var(--t-border)}
.term-dots{display:flex;gap:6px}
.term-dot{width:10px;height:10px;border-radius:50%}
.dot-red{background:#ff5f57}
.dot-yellow{background:#febc2e}
.dot-green{background:#28c840}
.term-titletext{margin-left:8px;font-size:12px;color:var(--t-text-dim);font-family:${monoFont}}
.term-body{padding:16px 20px;min-height:200px;font-family:${monoFont};font-size:13px;line-height:1.7}
.term-line{color:var(--t-text)}
.term-prompt{color:var(--t-accent);font-weight:600}
.term-command{color:var(--t-text)}
.term-output{color:var(--t-text-muted)}
.term-success{color:#22c55e}
.term-error{color:#ef4444}
.term-warning{color:#f59e0b}
.term-comment{color:var(--t-text-dim);font-style:italic}
.term-cursor-line{margin-top:4px;display:flex;align-items:center}
.term-cursor{display:inline-block;width:8px;height:16px;background:var(--t-accent);animation:term-blink 1s step-end infinite;margin-left:2px}
@keyframes term-blink{50%{opacity:0}}
</style>`;
}
