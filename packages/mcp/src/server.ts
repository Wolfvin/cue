#!/usr/bin/env node

/**
 * @cue-vin/mcp — MCP server that exposes cue capabilities as tools for AI agents.
 *
 * Runs on stdio (standard MCP transport) so it can be used directly by
 * Claude Desktop, Cursor, and any other MCP-compatible AI client.
 *
 * Tools provided:
 *   1. cue_generate    — Generate a DemoScript JSON from a list of features
 *   2. cue_export_html — Export a DemoScript to a self-contained HTML file
 *   3. cue_validate    — Validate a DemoScript JSON object
 *   4. cue_get_stats   — Query analytics stats for a demo
 *   5. cue_style       — Recommend curated cue techniques based on user intent
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRequire } from "node:module";

import { generateToolSchema, handleGenerate } from "./tools/generate.js";
import { exportHtmlToolSchema, handleExportHtml } from "./tools/export.js";
import { validateToolSchema, handleValidate } from "./tools/validate.js";
import { statsToolSchema, handleGetStats } from "./tools/stats.js";
import { styleToolSchema, handleStyle } from "./tools/style.js";

/** Read version from package.json at runtime so it stays in sync automatically.
 *  createRequire() produces a CJS-style require() that resolves relative
 *  to this file — works correctly after tsup bundles to CJS. */
const require = createRequire(import.meta.url);
const pkgVersion: string = require("../package.json").version;

/**
 * Create and configure the MCP server with all cue tools registered.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "@cue-vin/mcp",
    version: pkgVersion,
  });

  // ─── Tool 1: cue_generate ────────────────────────────────────────────────
  server.tool(
    "cue_generate",
    "Generate a DemoScript JSON from a list of features. Use this when you want to create a demo from scratch — provide an id, title, and an array of features, and the tool will produce a valid DemoScript that can be played by cue-player or exported to HTML.",
    generateToolSchema,
    async (args) => {
      return handleGenerate(args as Record<string, unknown>);
    }
  );

  // ─── Tool 2: cue_export_html ─────────────────────────────────────────────
  server.tool(
    "cue_export_html",
    "Export a DemoScript to a self-contained HTML file. Returns the HTML string that can be saved as .html and opened in any browser. Use this after generating a DemoScript to get a shareable, offline-ready demo page.",
    exportHtmlToolSchema,
    async (args) => {
      return handleExportHtml(args as Record<string, unknown>);
    }
  );

  // ─── Tool 3: cue_validate ────────────────────────────────────────────────
  server.tool(
    "cue_validate",
    "Validate a DemoScript JSON object. Returns whether it is valid and any error messages. Use this to check that a DemoScript conforms to the expected structure before attempting to play or export it.",
    validateToolSchema,
    async (args) => {
      return handleValidate(args as Record<string, unknown>);
    }
  );

  // ─── Tool 4: cue_get_stats ───────────────────────────────────────────────
  server.tool(
    "cue_get_stats",
    "Query analytics stats for a demo from a running cue-analytics-server. Provide the demo ID and optionally the server endpoint (default: http://localhost:3001). Returns the stats object with session data, completion rates, and event history.",
    statsToolSchema,
    async (args) => {
      return handleGetStats(args as Record<string, unknown>);
    }
  );

  // ─── Tool 5: cue_style ───────────────────────────────────────────────────
  server.tool(
    "cue_style",
    "Recommend a curated set of cue techniques based on a user's intent (vibe / goal) and optional context. Provide a short description like \"premium landing page like Apple\", \"playful mobile app\", or \"enterprise dashboard\". Returns a JSON object with the chosen preset, techniques to use, techniques to avoid, recommended CSS variables, and a rationale. Always returns valid JSON and falls back to the saas-launch preset when no specific intent is matched.",
    styleToolSchema,
    async (args) => {
      return handleStyle(args as Record<string, unknown>);
    }
  );

  return server;
}

/**
 * Start the MCP server using stdio transport.
 * This is the main entry point when running as a CLI tool.
 */
export async function startMcpServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// When executed directly (not imported), start the server
startMcpServer().catch((error: unknown) => {
  console.error("Fatal error starting @cue-vin/mcp server:", error);
  process.exit(1);
});
