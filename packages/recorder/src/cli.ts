#!/usr/bin/env node

/**
 * cue-record — CLI entry point for the cue recorder.
 *
 * Usage:
 *   cue-record --script actions.json --output demo.json [--screenshots ./shots] [--width 1280] [--height 800]
 *
 * Reads a JSON file containing an array of CaptureAction objects,
 * runs them through Playwright, and writes a DemoScript JSON file.
 */

import { record } from "./record.js";
import type { CaptureAction } from "./record.js";

// ─── Argument Parsing ──────────────────────────────────────────────────────

interface CliArgs {
  script: string;
  output: string;
  screenshots: string;
  width: number;
  height: number;
}

function parseArgs(argv: string[]): CliArgs {
  const args: Partial<CliArgs> = {};

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--script":
        args.script = argv[++i];
        break;
      case "--output":
        args.output = argv[++i];
        break;
      case "--screenshots":
        args.screenshots = argv[++i];
        break;
      case "--width":
        args.width = Number(argv[++i]);
        break;
      case "--height":
        args.height = Number(argv[++i]);
        break;
      default:
        console.error(`Unknown argument: ${arg}`);
        process.exit(1);
    }
  }

  if (!args.script) {
    console.error('Missing required argument: --script <path>');
    console.error('Usage: cue-record --script actions.json --output demo.json [--screenshots ./shots] [--width 1280] [--height 800]');
    process.exit(1);
  }

  if (!args.output) {
    console.error('Missing required argument: --output <path>');
    console.error('Usage: cue-record --script actions.json --output demo.json [--screenshots ./shots] [--width 1280] [--height 800]');
    process.exit(1);
  }

  return {
    script: args.script!,
    output: args.output!,
    screenshots: args.screenshots ?? "./screenshots",
    width: args.width ?? 1280,
    height: args.height ?? 800,
  };
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const args = parseArgs(process.argv);

  // Read and parse actions file
  const scriptPath = path.resolve(args.script);
  let actions: CaptureAction[] = [];

  try {
    const raw = await fs.readFile(scriptPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error("Error: actions file must contain a JSON array.");
      process.exit(1);
    }
    actions = parsed as CaptureAction[];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error reading actions file: ${message}`);
    process.exit(1);
  }

  if (actions.length === 0) {
    console.error("Error: actions array is empty — nothing to record.");
    process.exit(1);
  }

  console.log(`cue-record: Starting recording with ${actions.length} action(s)...`);
  console.log(`   Viewport: ${args.width}x${args.height}`);
  console.log(`   Screenshots: ${path.resolve(args.screenshots)}`);
  console.log(`   Output: ${path.resolve(args.output)}`);

  try {
    const result = await record({
      actions,
      outputPath: args.output,
      width: args.width,
      height: args.height,
      screenshotsDir: args.screenshots,
    });

    console.log(`\nRecording complete!`);
    console.log(`   Demo ID: ${result.id}`);
    console.log(`   Steps: ${result.steps.length}`);
    console.log(`   Output: ${path.resolve(args.output)}`);
    console.log(`   Screenshots: ${path.resolve(args.screenshots)}/`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nRecording failed: ${message}`);
    process.exit(1);
  }
}

main();
