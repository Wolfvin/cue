/**
 * Minimal HTTP analytics server for cue — zero dependencies, Node.js built-in http only.
 * Provides POST /event, GET /stats/:demoId, GET /health endpoints with CORS.
 */

import http from "http";
import type { IncomingMessage, ServerResponse, Server } from "http";
import { appendEvent, countEvents, readEventsByDemo } from "./store";
import { queryStats } from "./query";
import type { StoredEvent } from "./store";

/** Configuration for starting the analytics server. */
export interface ServerConfig {
  /** Port to listen on. Default: process.env.CUE_PORT || 3001 */
  port?: number;
  /** Data directory for NDJSON storage. Default: process.env.CUE_DATA_DIR || "data" */
  dataDir?: string;
}

/** CORS headers applied to every response. */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** Send a JSON response with CORS headers. */
function jsonRes(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    ...CORS_HEADERS,
  });
  res.end(payload);
}

/** Read the request body as a string. */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => {
      data += chunk.toString();
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/** Parse CLI arguments into a config object. */
function parseCliArgs(argv: string[]): ServerConfig {
  const config: ServerConfig = {};
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

/**
 * Start the cue analytics HTTP server.
 * Returns the Node.js http.Server instance so callers can close it programmatically.
 */
export async function startServer(config?: ServerConfig): Promise<Server> {
  const port = config?.port ?? parseInt(process.env.CUE_PORT ?? "3001", 10);
  const dataDir = config?.dataDir ?? process.env.CUE_DATA_DIR ?? "data";

  const server = http.createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const url = req.url ?? "/";
      const method = req.method ?? "GET";

      // Handle CORS preflight
      if (method === "OPTIONS") {
        res.writeHead(204, CORS_HEADERS);
        res.end();
        return;
      }

      try {
        // ─── POST /event ──────────────────────────────────────────────
        if (method === "POST" && url === "/event") {
          const body = await readBody(req);
          let parsed: unknown;
          try {
            parsed = JSON.parse(body);
          } catch {
            jsonRes(res, 400, { ok: false, error: "Invalid JSON" });
            return;
          }

          // Validate required fields
          if (
            typeof parsed !== "object" ||
            parsed === null ||
            typeof (parsed as Record<string, unknown>).demoId !== "string" ||
            typeof (parsed as Record<string, unknown>).sessionId !== "string" ||
            typeof (parsed as Record<string, unknown>).event !== "string" ||
            typeof (parsed as Record<string, unknown>).ts !== "number"
          ) {
            jsonRes(res, 400, {
              ok: false,
              error: "Missing required fields: demoId, sessionId, event, ts",
            });
            return;
          }

          const event: StoredEvent = {
            demoId: (parsed as Record<string, unknown>).demoId as string,
            sessionId: (parsed as Record<string, unknown>).sessionId as string,
            event: (parsed as Record<string, unknown>).event as string,
            step: (parsed as Record<string, unknown>).step as number | undefined,
            totalSteps: (parsed as Record<string, unknown>).totalSteps as number | undefined,
            hotspotId: (parsed as Record<string, unknown>).hotspotId as string | undefined,
            ts: (parsed as Record<string, unknown>).ts as number,
          };

          appendEvent(event, { dataDir });
          jsonRes(res, 200, { ok: true });
          return;
        }

        // ─── GET /stats/:demoId ───────────────────────────────────────
        if (method === "GET" && url.startsWith("/stats/")) {
          const demoId = decodeURIComponent(url.slice("/stats/".length));
          if (!demoId) {
            jsonRes(res, 400, { ok: false, error: "Missing demoId" });
            return;
          }

          const events = readEventsByDemo(demoId, { dataDir });
          const stats = queryStats(demoId, events);
          jsonRes(res, 200, stats);
          return;
        }

        // ─── GET /health ──────────────────────────────────────────────
        if (method === "GET" && url === "/health") {
          const events = countEvents({ dataDir });
          jsonRes(res, 200, { ok: true, events });
          return;
        }

        // ─── 404 ──────────────────────────────────────────────────────
        jsonRes(res, 404, { ok: false, error: "Not found" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        jsonRes(res, 500, { ok: false, error: message });
      }
    }
  );

  return new Promise((resolve) => {
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`[cue-analytics] listening on http://localhost:${port} (data: ${dataDir})`);
      resolve(server);
    });
  });
}

// ─── CLI entry point ─────────────────────────────────────────────────────────
// When executed directly (node dist/server.js or via bin), start the server.

async function main(): Promise<void> {
  const config = parseCliArgs(process.argv);
  await startServer(config);
}

// Detect if this file is being run directly
if (
  typeof process !== "undefined" &&
  process.argv[1]?.includes("analytics-server")
) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
