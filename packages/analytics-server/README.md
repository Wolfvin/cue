# @cue-vin/analytics-server

Self-hostable analytics endpoint for the cue Demo Theater SDK. Receives demo events via HTTP, stores them in append-only NDJSON, and serves aggregate stats. Zero runtime dependencies — uses only Node.js built-ins.

## Install

```bash
npm install @cue-vin/analytics-server
```

## Quick Start

### CLI

```bash
# Start server on default port 3001
npx cue-analytics

# Custom port and data directory
npx cue-analytics --port 3001 --data ./my-analytics-data
```

### Programmatic API

```typescript
import { startServer, query, store, readAllEvents } from "@cue-vin/analytics-server";

// Start the HTTP server
const server = await startServer({ port: 3001, dataDir: "./data" });

// Later: query stats offline (no server needed)
const events = readAllEvents({ dataDir: "./data" });
const stats = query.queryStats("my-saas-demo", events);
console.log(`Views: ${stats.totalViews}, Completion: ${stats.completionRate}`);
```

### Send Events from CuePlayer

```typescript
import { CueAnalytics } from "@cue-vin/core";

const analytics = new CueAnalytics({
  demoId: "product-tour",
  endpoint: "http://localhost:3001/event",
  totalSteps: 3,
});

analytics.track("demo_start");
analytics.track("step_view", { step: 0 });
analytics.track("step_view", { step: 1 });
analytics.track("hotspot_click", { step: 1, hotspotId: "h3" });
analytics.track("demo_complete");
```

## HTTP Endpoints

### POST /event

Ingest an analytics event. Required fields: `demoId`, `sessionId`, `event`, `ts`.

```bash
curl -X POST http://localhost:3001/event \
  -H "Content-Type: application/json" \
  -d '{"demoId":"my-demo","sessionId":"sess-abc","event":"start","step":0,"totalSteps":4,"ts":1700000000000}'
```

Response: `{ "ok": true }`

### GET /stats/:demoId

Query aggregate stats for a demo.

```bash
curl http://localhost:3001/stats/my-demo
```

Response:
```json
{
  "demoId": "my-demo",
  "totalViews": 42,
  "completionRate": 0.71,
  "avgStepsReached": 3.2,
  "stepDropoff": [42, 38, 35, 30],
  "hotspotClicks": { "upload-hotspot-0": 18 }
}
```

### GET /health

Health check returning total event count.

```bash
curl http://localhost:3001/health
```

Response: `{ "ok": true, "events": 150 }`

All endpoints include CORS headers (`Access-Control-Allow-Origin: *`).

## Exports

### Server

| Export | Kind | Description |
|--------|------|-------------|
| `startServer` | Function | `(config?: ServerConfig) => Promise<Server>` — start the HTTP server. Returns Node.js `http.Server` instance. |
| `ServerConfig` | Type | `{ port?, dataDir? }`. Defaults: port from `CUE_PORT` env or `3001`, dataDir from `CUE_DATA_DIR` env or `"data"`. |

### Store

| Export | Kind | Description |
|--------|------|-------------|
| `appendEvent` | Function | `(event: StoredEvent, options?) => void` — append event to `events.ndjson`. Sync I/O. |
| `readAllEvents` | Function | `(options?) => StoredEvent[]` — read and parse all events. Skips malformed lines. |
| `readEventsByDemo` | Function | `(demoId: string, options?) => StoredEvent[]` — filter events by demo ID. |
| `countEvents` | Function | `(options?) => number` — count non-empty lines (fast, no full parse). |
| `store` | Namespace | All store functions re-exported as a namespace for `import { store } from "@cue-vin/analytics-server"`. |

### Query

| Export | Kind | Description |
|--------|------|-------------|
| `queryStats` | Function | `(demoId: string, events: StoredEvent[]) => DemoStats` — pure aggregation. No I/O. |
| `listDemoIds` | Function | `(events: StoredEvent[]) => string[]` — unique demo IDs from event log. |
| `getSessionEvents` | Function | `(sessionId: string, events: StoredEvent[]) => StoredEvent[]` — events for one session, sorted by timestamp. |
| `query` | Namespace | All query functions re-exported as a namespace. |

### Types

| Export | Description |
|--------|-------------|
| `StoredEvent` | `{ demoId, sessionId, event: string, step?, totalSteps?, hotspotId?, ts: number }` |
| `DemoStats` | `{ demoId, totalViews, completionRate, avgStepsReached, stepDropoff: number[], hotspotClicks: Record<string, number> }` |
| `StoreOptions` | `{ dataDir? }` |

## Dependencies

None — uses only Node.js built-ins (`http`, `fs`, `path`).
