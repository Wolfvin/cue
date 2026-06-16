/**
 * Tool handler for cue_export_html — export a DemoScript to a self-contained
 * HTML file.
 *
 * We implement the HTML template directly rather than importing from
 * @cue-vin/player because the player's CJS bundle contains browser-specific code
 * (React, customElements, HTMLElement) that cannot run in Node.js. The MCP
 * server runs as a Node.js CLI process, so we need a Node-compatible version
 * of the export logic.
 *
 * The HTML output is functionally identical to @cue-vin/player's exportToHtml()
 * with playerJsInline=false (CDN mode).
 */

import { z } from "zod";
import type { DemoScript } from "@cue-vin/core";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/** Default CDN URL for the IIFE bundle. */
const DEFAULT_CDN_URL =
  "https://unpkg.com/@cue-vin/player/dist/cue-player.iife.js";

/** Zod schema for the cue_export_html tool input. */
export const exportHtmlToolSchema = {
  script: z.record(z.unknown()).describe(
    "A DemoScript JSON object to export. Must conform to the DemoScript interface (id, title, steps)."
  ),
  title: z.string().optional().describe(
    "Page title for the HTML file. Defaults to script.title if not provided."
  ),
  width: z.number().optional().describe(
    "Artboard width in pixels. Default: 840."
  ),
  height: z.number().optional().describe(
    "Artboard height in pixels. Default: 520."
  ),
};

/** Escape HTML special characters to prevent XSS in user-provided strings. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeJsonForScript(json: string): string {
  return json.replace(/<\/script/gi, "<\\/script");
}

function sanitizeCssValue(str: string): string {
  return str
    .replace(/[;{}]/g, "")
    .replace(/<\/style/gi, "")
    .replace(/<script/gi, "");
}

/**
 * Generate a self-contained HTML string from a DemoScript.
 * This is the Node.js-compatible equivalent of @cue-vin/player's exportToHtml().
 */
function generateHtml(
  script: DemoScript,
  title?: string,
  width = 840,
  height = 520
): string {
  const pageTitle = title ?? script.title ?? "cue demo";
  const scriptJson = escapeJsonForScript(JSON.stringify(script));
  const bg = sanitizeCssValue(script.theme?.bg ?? "#0a0a0a");
  const font = sanitizeCssValue(
    script.theme?.font ??
    "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
  );

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
      background: ${bg};
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
  <script src="https://unpkg.com/@cue-vin/player/dist/cue-utils.iife.js"><\/script>
  <script src="${escapeHtml(DEFAULT_CDN_URL)}"><\/script>

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

/**
 * Handle the cue_export_html tool call.
 * Generates a self-contained HTML file from the provided DemoScript.
 */
export async function handleExportHtml(
  args: Record<string, unknown>
): Promise<CallToolResult> {
  try {
    const { script, title, width, height } = args as {
      script: Record<string, unknown>;
      title?: string;
      width?: number;
      height?: number;
    };

    if (!script || typeof script !== "object") {
      return {
        content: [{ type: "text", text: "Error: 'script' is required and must be a DemoScript object." }],
        isError: true,
      };
    }

    const html = generateHtml(
      script as unknown as DemoScript,
      title,
      width,
      height
    );

    return {
      content: [
        {
          type: "text",
          text: html,
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error exporting HTML: ${message}` }],
      isError: true,
    };
  }
}
