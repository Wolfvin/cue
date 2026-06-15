import { CueEmbed } from "./WebComponent";

export { CuePlayer } from "./CuePlayer";
export type { CuePlayerProps } from "./CuePlayer";

export { CueEmbed } from "./WebComponent";

export { exportToHtml } from "./export";
export type { ExportOptions } from "./export";

/**
 * Register the <cue-embed> custom element if not already defined.
 * Call this once before using <cue-embed> in your HTML.
 */
export function initCue(): void {
  if (!customElements.get("cue-embed")) {
    customElements.define("cue-embed", CueEmbed);
  }
}

// ─── Auto-register in browser environments ──────────────────────────────
// When this module is loaded as an IIFE via <script src>, the custom
// element must be registered immediately so that any <cue-embed> tags
// already in the DOM are upgraded without requiring an explicit
// initCue() call.
if (typeof customElements !== "undefined") {
  initCue();
}
