/**
 * Node.js-only entry point for @cue-vin/player.
 *
 * This module exports only the non-browser functions (exportToHtml, exportToPng)
 * so that CLI/pipeline tools can import "@cue-vin/player/node" without
 * triggering the HTMLElement reference in WebComponent.ts that crashes Node.js.
 *
 * Usage:
 *   import { exportToHtml, exportToPng } from "@cue-vin/player/node";
 */
export { exportToHtml } from "./export";
export type { ExportOptions } from "./export";
export { exportToPng } from "./export-png";
export type { ExportPngOptions } from "./export-png";
//# sourceMappingURL=node.d.ts.map