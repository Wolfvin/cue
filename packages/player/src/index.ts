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
