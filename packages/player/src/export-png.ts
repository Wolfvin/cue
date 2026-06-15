/**
 * PNG export — render the exported HTML in a headless browser and
 * capture a screenshot.
 *
 * This module is separated from export.ts so that the IIFE browser
 * build never pulls in the puppeteer dependency. Only the Node.js
 * sub-path export ("@cue-vin/player/node") imports this file.
 */

import { exportToHtml } from "./export";
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
export async function exportToPng(options: ExportPngOptions): Promise<Buffer> {
  const {
    outputPath,
    scaleFactor = 2,
    timeout = 10000,
  } = options;

  // Generate the HTML first (inline the player bundle for offline use)
  const html = exportToHtml({ ...options, playerJsInline: true });

  // Dynamically import puppeteer — peer dependency, not bundled
  let puppeteer: typeof import("puppeteer");
  try {
    puppeteer = await import("puppeteer");
  } catch {
    throw new Error(
      "[cue] exportToPng requires puppeteer as a peer dependency. " +
        "Install it with: npm install puppeteer"
    );
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: options.width ?? 840,
      height: options.height ?? 520,
      deviceScaleFactor: scaleFactor,
    });

    await page.setContent(html, {
      waitUntil: "load" as const,
      timeout,
    });

    // Wait for the cue-embed custom element to render
    await page.waitForSelector("cue-embed", { timeout });

    const buffer = await page.screenshot({
      type: "png",
      path: outputPath,
      fullPage: false,
    });

    return Buffer.from(buffer as unknown as ArrayBuffer);
  } finally {
    await browser.close();
  }
}
