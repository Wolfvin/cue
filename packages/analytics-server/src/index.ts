/**
 * @cue/analytics-server — self-hostable analytics endpoint for cue.
 *
 * Usage:
 *   import { startServer, query } from "@cue/analytics-server";
 *   await startServer({ port: 3001, dataDir: "./data" });
 *
 * Standalone query (no server needed):
 *   import { query, readAllEvents } from "@cue/analytics-server";
 *   const events = readAllEvents({ dataDir: "./data" });
 *   const stats = query.queryStats("my-demo", events);
 */

export { startServer } from "./server";
export type { ServerConfig } from "./server";

export { appendEvent, readAllEvents, readEventsByDemo, countEvents } from "./store";
export type { StoredEvent, StoreOptions } from "./store";

export { queryStats, listDemoIds, getSessionEvents } from "./query";
export type { DemoStats } from "./query";

// Re-export query functions as a namespace for convenient standalone usage:
//   import { query } from "@cue/analytics-server";
//   query.queryStats(...)
import * as query from "./query";
export { query };

// Also export store functions as a namespace:
import * as store from "./store";
export { store };
