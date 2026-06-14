#!/usr/bin/env node

/**
 * cue-analytics — CLI entry point for the cue analytics server.
 *
 * Usage:
 *   cue-analytics [--port 3001] [--data ./data]
 */

import { startServer } from "./server.js";

function parseArgs(argv: string[]): { port?: number; dataDir?: string } {
  const config: { port?: number; dataDir?: string } = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--port" && argv[i + 1]) {
      config.port = parseInt(argv[i + 1], 10);
      i++;
    } else if (arg === "--data" && argv[i + 1]) {
      config.dataDir = argv[i + 1];
      i++;
    }
  }
  return config;
}

async function main(): Promise<void> {
  const config = parseArgs(process.argv);
  await startServer(config);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
