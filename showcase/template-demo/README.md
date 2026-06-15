# Template Demo — Build Demos Without Screenshots

> Standalone HTML demo showcasing `@cue-vin/templates` integration with the cue DemoScript schema. Demonstrates that agents can build complete product demos using `step.template` instead of `step.screen` — no screenshots required.

## What This Demo Shows

A 4-step demo using 4 different template types from `@cue-vin/templates`:

| Step | Template | Data Highlights |
|------|----------|-----------------|
| 1 | **login** | Brand name, email/password fields, submit button |
| 2 | **dashboard** | Greeting, 4 metric cards with change indicators |
| 3 | **form** | Multi-field form with text, select, and textarea inputs |
| 4 | **terminal** | Color-coded log lines: command, output, success |

## New Schema Field: `DemoStep.template`

This showcase introduces the `template` field on `DemoStep`:

```typescript
interface DemoTemplate {
  type: "login" | "dashboard" | "form" | "table" | "terminal";
  data?: Record<string, unknown>;
  theme?: DemoTheme;
}

interface DemoStep {
  // ... existing fields ...
  template?: DemoTemplate;  // NEW
}
```

### Priority Logic

- If `step.screen` is present → render screenshot (existing behavior)
- Else if `step.template` is present → render template via `@cue-vin/templates`
- Else → show placeholder "No screen for this step"

This ensures full backward compatibility — existing demos with screenshots are unaffected.

## How CuePlayer Renders Templates

When `step.template` is present and `step.screen` is absent:

1. Build a `TemplateConfig` from `template.type` + `template.data`
2. Merge themes: script-level `theme` ← step-level `template.theme` (step overrides script)
3. Call `renderTemplate(config, mergedTheme)` from `@cue-vin/templates`
4. Inject the returned HTML string into a `div` via `dangerouslySetInnerHTML`
5. Overlay pointer, hotspots, and annotations on top (same as screenshot steps)

## Files

| File | Purpose |
|------|---------|
| `index.html` | Standalone demo — open directly in browser (imports `@cue-vin/templates` ESM) |
| `script.json` | DemoScript JSON with `template` fields on each step |
| `README.md` | This documentation |

## Running

This demo imports `@cue-vin/templates` as an ES module, so it requires a local server:

```bash
# From repo root, build the templates package first
pnpm --filter @cue-vin/templates build

# Then serve the showcase directory
npx serve .
# Or from repo root:
npx serve showcase/template-demo/
```

Open the served URL in your browser. No additional npm packages are installed.

## What Changed in cue SDK

### `packages/core/src/DemoScript.ts`
- Added `DemoTemplate` interface with `type`, `data?`, `theme?` fields
- Added `template?: DemoTemplate` field to `DemoStep`

### `packages/core/src/index.ts`
- Export `DemoTemplate` type

### `packages/player/src/CuePlayer.tsx`
- Import `renderTemplate` from `@cue-vin/templates`
- New `renderStepTemplate()` helper that builds `TemplateConfig` and merges themes
- When `step.screen` is absent but `step.template` is present, render template HTML in a div
- Pointer, hotspots, and annotations overlay works on template steps same as screenshot steps

### `packages/player/package.json`
- Added `@cue-vin/templates: "workspace:*"` as dependency

### `packages/player/vite.config.es.ts`
- Added `@cue-vin/core`, `@cue-vin/react`, `@cue-vin/templates` to ES build externals
