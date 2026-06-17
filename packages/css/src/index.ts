/**
 * @cue-vin/css — TypeScript entrypoint
 *
 * Re-exports the curated motion presets. The CSS itself is consumed via
 * `@cue-vin/css/src/cue.css` (see package.json#exports); this module exposes
 * the accompanying preset metadata for agents and tooling that want a
 * taste-curated starting point instead of picking technique classes one
 * by one.
 */

export { presets } from "./presets";
export type { CuePreset } from "./presets";
