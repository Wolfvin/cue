/**
 * IIFE entry point — loaded via <script src="cue-player.iife.js"> in the browser.
 *
 * This file imports everything synchronously (including CueEmbed which
 * extends HTMLElement) because it is ONLY ever evaluated in a browser context.
 * The barrel `index.ts` avoids top-level HTMLElement references so that
 * Node.js consumers can safely import exportToHtml and CuePlayer.
 */
export { CuePlayer } from "./CuePlayer";
export type { CuePlayerProps } from "./CuePlayer";
export { CueEmbed } from "./WebComponent";
export { exportToHtml } from "./export";
export type { ExportOptions } from "./export";
/**
 * Register the <cue-embed> custom element if not already defined.
 * In the IIFE context this runs synchronously since all code is
 * already bundled and the browser DOM is available.
 */
export declare function initCue(): void;
//# sourceMappingURL=iife.d.ts.map