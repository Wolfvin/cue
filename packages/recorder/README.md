# @cue-vin/recorder

Playwright-based capture tool that records browser interactions and produces DemoScript JSON with real screenshots. Use it to turn any web app into a step-by-step product demo.

## Install

```bash
npm install @cue-vin/recorder
npx playwright install chromium
```

Peer dependency: `playwright >=1.40.0`.

## Quick Start

### CLI

```bash
# 1. Create actions.json
cat > actions.json << 'EOF'
[
  { "type": "navigate", "url": "https://my-app.example.com/dashboard", "caption": "Dashboard overview" },
  { "type": "wait", "duration": 1500 },
  { "type": "screenshot", "caption": "Key metrics at a glance", "hotspots": [
    { "label": "Revenue chart", "selector": "#revenue-card", "alwaysShow": true },
    { "label": "User activity", "selector": "#activity-feed" }
  ]},
  { "type": "click", "selector": "button.upload-btn", "caption": "Click Upload" },
  { "type": "screenshot", "caption": "Upload area", "hotspots": [
    { "label": "Drop zone", "selector": ".drop-zone", "alwaysShow": true }
  ]}
]
EOF

# 2. Run recorder
npx cue-record --script actions.json --output demo.json --screenshots ./shots

# 3. Use the output
# demo.json is a valid DemoScript — load it with @cue-vin/player CuePlayer
```

### Programmatic API

```typescript
import { record } from "@cue-vin/recorder";
import type { CaptureAction } from "@cue-vin/recorder";

const actions: CaptureAction[] = [
  { type: "navigate", url: "https://example.com", caption: "Landing page" },
  { type: "wait", duration: 1000 },
  { type: "screenshot", caption: "Hero section" },
  { type: "click", selector: "button.cta", caption: "Click CTA" },
  { type: "screenshot", caption: "After click" },
];

const script = await record({
  actions,
  outputPath: "./demo.json",
  width: 1280,
  height: 800,
  screenshotsDir: "./screenshots",
});

console.log(`Recorded ${script.steps.length} steps, id: ${script.id}`);
```

## CaptureAction Types

| Type | Fields | Description |
|------|--------|-------------|
| `navigate` | `url: string, caption?: string` | Navigate to URL, wait for `networkidle`. |
| `click` | `selector: string, caption?: string` | Click element, wait for `networkidle`. |
| `hover` | `selector: string, caption?: string` | Hover over element, 300ms pause. |
| `type` | `selector: string, text: string, caption?: string` | Fill input with text. |
| `wait` | `duration?: number` | Wait (default: 1000ms). |
| `screenshot` | `caption?: string, duration?: number, hotspots?: { label, selector, alwaysShow? }[]` | Capture screenshot. Hotspot selectors are resolved to viewport-relative fraction coords. |

## CLI Options

```
cue-record --script <path> --output <path> [--screenshots <dir>] [--width 1280] [--height 800]
```

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--script` | Yes | — | Path to JSON file containing CaptureAction array. |
| `--output` | Yes | — | Output path for DemoScript JSON. |
| `--screenshots` | No | `./screenshots` | Directory for screenshot PNG files. |
| `--width` | No | `1280` | Viewport width. |
| `--height` | No | `800` | Viewport height. |

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `record` | Function | `(options: RecordOptions) => Promise<DemoScript>` — main recording orchestrator. |
| `RecordOptions` | Type | `{ actions: CaptureAction[], outputPath: string, width?, height?, screenshotsDir? }` |
| `CaptureAction` | Type | Union of navigate, click, hover, type, wait, screenshot action types. |
| `captureScreenshot` | Function | `(options: CaptureScreensOptions) => Promise<CaptureResult>` — low-level screenshot + coordinate capture. |
| `CaptureScreensOptions` | Type | Options for single screenshot capture. |
| `CaptureResult` | Type | `{ relativePath, absolutePath, pointer: DemoPointer, hotspots: DemoHotspot[] }` |

## Dependencies

- `@cue-vin/core` (workspace) — `DemoScript`, `DemoStep`, `DemoPointer`, `DemoHotspot` types.
- `playwright` (peer) — headless browser automation. Dynamically imported, not bundled.

## Output Format

The output `demo.json` is a valid `DemoScript` (see `@cue-vin/core`). All pointer and hotspot coordinates are **fractional (0–1)** relative to viewport dimensions. Screenshots are captured at 2x DPR (retina).
