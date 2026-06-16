/**
 * PNG export — render the exported HTML in a headless browser and
 * capture a screenshot.
 *
 * This module is separated from export.ts so that the IIFE browser
 * build never pulls in the puppeteer dependency. Only the Node.js
 * sub-path export ("@cue-vin/player/node") imports this file.
 */
import type { ExportOptions } from "./export";
/** Options for the PNG export function. */
export interface ExportPngOptions extends ExportOptions {
    /** Output file path for the PNG screenshot. Node.js only. */
    outputPath: string;
    /** Device scale factor for the screenshot. Default: 2. */
    scaleFactor?: number;
    /** Timeout in milliseconds for the page render. Default: 10000. */
    timeout?: number;
}
/**
 * Generate a PNG screenshot from a DemoScript by rendering the
 * exported HTML in a headless browser and capturing a screenshot.
 *
 * This function requires `puppeteer` as a peer dependency and
 * only works in Node.js. It will throw if puppeteer is not installed.
 */
export declare function exportToPng(options: ExportPngOptions): Promise<Buffer>;
//# sourceMappingURL=export-png.d.ts.map