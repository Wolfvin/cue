# @cue-vin/mcp

MCP server exposing cue capabilities as tools for AI agents. Runs on stdio transport, compatible with Claude Desktop, Cursor, and any MCP-compatible client. Provides tools to generate, validate, export, and query demo analytics.

## Install

```bash
npm install @cue-vin/mcp
```

## Quick Start

### Claude Desktop / Cursor Integration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "cue": {
      "command": "npx",
      "args": ["cue-mcp"]
    }
  }
}
```

### Programmatic Usage

```typescript
import { createServer, startMcpServer } from "@cue-vin/mcp";

// Start on stdio (for MCP client integration)
await startMcpServer();

// Or create a configured server instance
const server = createServer();
```

## Tools

### cue_generate

Generate a DemoScript JSON from a list of features. Delegates to `@cue-vin/core`'s `generate()` function.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the demo. |
| `title` | `string` | Yes | Display title of the demo. |
| `features` | `array` | Yes | Ordered list of features. Each becomes one DemoStep. |
| `features[].name` | `string` | Yes | Feature name (slugified into step id). |
| `features[].description` | `string` | Yes | Short description — becomes step caption. |
| `features[].screenshotPath` | `string` | No | Path or URL to a screenshot image. |
| `defaultDuration` | `number` | No | Auto-advance duration per step in ms. Default: 4000. |

**Returns:** DemoScript JSON string.

### cue_validate

Validate a DemoScript JSON object. Returns `{ valid: boolean, errors: string[] }`.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `script` | `object` | Yes | DemoScript JSON to validate. Must have `id`, `title`, `steps[]` with `id`. |

**Returns:** JSON with `{ valid, errors }`.

### cue_export_html

Export a DemoScript to a self-contained HTML file that embeds the cue player.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `script` | `object` | Yes | DemoScript JSON object. |
| `title` | `string` | No | Page title. Defaults to `script.title`. |
| `width` | `number` | No | Artboard width. Default: 840. |
| `height` | `number` | No | Artboard height. Default: 520. |

**Returns:** Complete HTML string that can be written to a `.html` file.

### cue_get_stats

Query analytics stats for a demo from a running `@cue-vin/analytics-server`.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `demoId` | `string` | Yes | Demo identifier to query. |
| `endpoint` | `string` | No | Analytics server URL. Default: `http://localhost:3001`. |

**Returns:** `DemoStats` JSON (totalViews, completionRate, avgStepsReached, stepDropoff, hotspotClicks).

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `createServer` | Function | `() => McpServer` — create and configure the MCP server with all tools registered. |
| `startMcpServer` | Function | `() => Promise<void>` — create server and connect on stdio transport. |

## Dependencies

- `@cue-vin/core` — `generate()`, `validateDemoScript()`, `DemoScript` type
- `@cue-vin/player` — referenced for HTML template (CDN URL), not directly imported
- `@modelcontextprotocol/sdk` — MCP server SDK
- `zod` — tool parameter schema validation
