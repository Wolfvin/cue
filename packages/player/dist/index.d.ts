export { CuePlayer } from "./CuePlayer";
export type { CuePlayerProps } from "./CuePlayer";
export { exportToHtml } from "./export";
export type { ExportOptions } from "./export";
/**
 * Register the <cue-embed> custom element if not already defined.
 * Call this once before using <cue-embed> in your HTML.
 *
 * The CueEmbed class is imported lazily via dynamic import() so that
 * importing this barrel file in Node.js does not crash on the missing
 * HTMLElement global. When running in a browser the class is loaded on
 * first call; in Node.js the early `typeof customElements` guard returns
 * before the import is evaluated.
 */
export declare function initCue(): Promise<void>;
//# sourceMappingURL=index.d.ts.map