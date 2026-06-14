/**
 * @cue-vin/recorder — Playwright-based capture tool that produces DemoScript JSON.
 *
 * This package provides the `record()` function and `cue-record` CLI for
 * capturing screenshots and interactions from a live web application and
 * producing a DemoScript JSON that can be rendered by `@cue-vin/player` or
 * `@cue-vin/react`.
 */

// Main recording function
export { record } from "./record.js";
export type { RecordOptions, CaptureAction } from "./record.js";

// Screenshot capture helper (advanced usage)
export { captureScreenshot } from "./capture.js";
export type { CaptureScreenshotOptions, CaptureResult } from "./capture.js";
