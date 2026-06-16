/**
 * HTML export — generate a self-contained HTML file from a DemoScript.
 *
 * When playerJsInline is true, the cue-player IIFE bundle is inlined
 * so the HTML file works completely offline (Node.js only for the read).
 * When false, the script is loaded from a CDN URL (works in browser/edge).
 *
 * When utilsJsInline is true, the cue-utils IIFE bundle is inlined
 * before the player so that window.CueUtils (Timeline + Pointer) is
 * available. When false, the utils script is loaded from a CDN URL.
 */

import { validateDemoScript } from "@cue-vin/core";
import type { DemoScript } from "@cue-vin/core";

/** Options for the HTML export function. */
export interface ExportOptions {
  /** DemoScript configuration to embed. */
  script: DemoScript;
  /** Page title. Default: script.title */
  title?: string;
  /** If true, inline the cue-player IIFE bundle into the HTML (standalone, no network). Default: false. */
  playerJsInline?: boolean;
  /** CDN URL for cue-player IIFE when not inlining. Default: unpkg URL. */
  cdnUrl?: string;
  /** If true, inline the cue-utils IIFE bundle (Timeline + Pointer) into the HTML. Default: false. */
  utilsJsInline?: boolean;
  /** CDN URL for cue-utils IIFE when not inlining. Default: unpkg URL. */
  utilsCdnUrl?: string;
  /** Artboard width. Default: 840. */
  width?: number;
  /** Artboard height. Default: 520. */
  height?: number;
}

/** Default CDN URL for the player IIFE bundle. */
const DEFAULT_CDN_URL =
  "https://unpkg.com/@cue-vin/player/dist/cue-player.iife.js";

/** Default CDN URL for the utils IIFE bundle. */
const DEFAULT_UTILS_CDN_URL =
  "https://unpkg.com/@cue-vin/player/dist/cue-utils.iife.js";

/**
 * Generate a self-contained HTML string from a DemoScript.
 * The returned string can be written directly to a .html file.
 *
 * When playerJsInline is true, this function uses fs.readFileSync
 * to read dist/cue-player.iife.js — this mode is Node.js only.
 * When false, no filesystem access is needed (browser/edge safe).
 *
 * The cue-utils IIFE (window.CueUtils — Timeline + Pointer) is always
 * included, either inlined or via CDN. It is placed BEFORE the player
 * script so that CueUtils is available when the player initializes.
 *
 * @throws {Error} If options is null/undefined or script is not a valid DemoScript.
 */
export function exportToHtml(options: ExportOptions): string {
  // ── Input validation (#81) ──────────────────────────────────────────────
  if (options == null || typeof options !== "object") {
    throw new Error(
      "exportToHtml: script is required and must be a valid DemoScript"
    );
  }

  const {
    script,
    title,
    playerJsInline = false,
    cdnUrl = DEFAULT_CDN_URL,
    utilsJsInline = false,
    utilsCdnUrl = DEFAULT_UTILS_CDN_URL,
    width = 840,
    height = 520,
  } = options;

  if (!validateDemoScript(script)) {
    throw new Error(
      "exportToHtml: script is required and must be a valid DemoScript"
    );
  }

  const pageTitle = title ?? script.title ?? "cue demo";
  const scriptJson = JSON.stringify(script);
  const bg = script.theme?.bg ?? "#0a0a0a";
  const font = script.theme?.font ?? "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";

  // Build the utils <script> tag — inline or CDN (#82)
  // Placed BEFORE the player so CueUtils is available when the player initializes.
  let utilsScriptTag: string;
  if (utilsJsInline) {
    const utilsContent = readUtilsBundle();
    utilsScriptTag = `<script>\n${utilsContent}\n</script>`;
  } else {
    utilsScriptTag = `<script src="${escapeHtml(utilsCdnUrl)}"><\/script>`;
  }

  // Build the player <script> tag — inline or CDN
  let playerScriptTag: string;
  if (playerJsInline) {
    const bundleContent = readPlayerBundle();
    playerScriptTag = `<script>\n${bundleContent}\n</script>`;
  } else {
    playerScriptTag = `<script src="${escapeHtml(cdnUrl)}"><\/script>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    body {
      background: ${escapeHtml(bg)};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ${font};
    }
  </style>
</head>
<body>
  <cue-embed id="player" width="${width}" height="${height}" autoplay${script.loop ? ' loop' : ''}></cue-embed>

  <script>window.__CUE_SCRIPT__ = ${scriptJson};</script>
  ${utilsScriptTag}
  ${playerScriptTag}

  <script>
    if (window.Cue && typeof window.Cue.initCue === 'function') {
      window.Cue.initCue();
    }
    var player = document.getElementById('player');
    if (player && window.__CUE_SCRIPT__) {
      player.setAttribute('data', JSON.stringify(window.__CUE_SCRIPT__));
    }
  </script>
</body>
</html>`;
}

/** Escape HTML special characters to prevent XSS in user-provided strings. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Read the cue-utils IIFE bundle from dist/ for inlining.
 * Node.js only — uses dynamic require of fs/path.
 * Returns an empty string when running in the browser so that
 * exportToHtml({ utilsJsInline: true }) fails gracefully instead
 * of throwing on the missing `fs` module.
 */
function readUtilsBundle(): string {
  try {
    // @ts-ignore — Node.js only; not available in browser
    const fs: typeof import("fs") = require("fs");
    // @ts-ignore — Node.js only
    const path: typeof import("path") = require("path");

    let dir: string;
    try {
      dir = path.dirname(new URL(import.meta.url).pathname);
    } catch {
      // @ts-ignore — __dirname for CJS contexts
      dir = __dirname;
    }

    const distPath = path.resolve(dir, "cue-utils.iife.js");
    return fs.readFileSync(distPath, "utf-8");
  } catch {
    console.warn(
      "[cue] utilsJsInline requires a Node.js environment. " +
        "Use utilsCdnUrl instead for browser builds."
    );
    return "";
  }
}

/**
 * Read the player IIFE bundle from dist/ for inlining.
 * Node.js only — uses dynamic require of fs/path.
 * Returns an empty string when running in the browser so that
 * exportToHtml({ playerJsInline: true }) fails gracefully instead
 * of throwing on the missing `fs` module.
 */
function readPlayerBundle(): string {
  try {
    // @ts-ignore — Node.js only; not available in browser
    const fs: typeof import("fs") = require("fs");
    // @ts-ignore — Node.js only
    const path: typeof import("path") = require("path");

    // Resolve relative to the current file's directory.
    // import.meta.url is available in ESM; fall back to __dirname for CJS.
    let dir: string;
    try {
      dir = path.dirname(new URL(import.meta.url).pathname);
    } catch {
      // @ts-ignore — __dirname for CJS contexts
      dir = __dirname;
    }

    const distPath = path.resolve(dir, "cue-player.iife.js");
    return fs.readFileSync(distPath, "utf-8");
  } catch {
    // Browser or edge environment where fs/path are unavailable.
    console.warn(
      "[cue] playerJsInline requires a Node.js environment. " +
        "Use cdnUrl instead for browser builds."
    );
    return "";
  }
}
