/**
 * HTML export — generate a self-contained HTML file from a DemoScript.
 *
 * When playerJsInline is true, the cue-player IIFE bundle is inlined
 * so the HTML file works completely offline (Node.js only for the read).
 * When false, the script is loaded from a CDN URL (works in browser/edge).
 */
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
    /** Artboard width. Default: 840. */
    width?: number;
    /** Artboard height. Default: 520. */
    height?: number;
}
/**
 * Generate a self-contained HTML string from a DemoScript.
 * The returned string can be written directly to a .html file.
 *
 * When playerJsInline is true, this function uses fs.readFileSync
 * to read dist/cue-player.iife.js — this mode is Node.js only.
 * When false, no filesystem access is needed (browser/edge safe).
 */
export declare function exportToHtml(options: ExportOptions): string;
//# sourceMappingURL=export.d.ts.map