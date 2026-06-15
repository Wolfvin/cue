/**
 * IIFE entry point for cue-utils — exposes Timeline and Pointer
 * as window.CueUtils for use in vanilla HTML demos via <script> tag.
 *
 * This is a minimal bundle: only Timeline + Pointer (no React, no analytics,
 * no DemoScript validation). Target size: < 15kb minified.
 *
 * Usage:
 *   <script src="cue-utils.iife.js"></script>
 *   <script>
 *     const { Timeline, Pointer } = window.CueUtils;
 *   </script>
 */

export { Timeline } from "./Timeline";
export type { TimelineEntry, TimelineOptions } from "./Timeline";

export { Pointer } from "./Pointer";
export type { PointerState, PointerKeyframe, PointerOptions } from "./Pointer";
