# showcase/fintech — BankFlow Demo

> Standalone HTML demo for a fictional Fintech/Banking product **BankFlow**, built by hand-rendering a `DemoScript` JSON with pure vanilla JS and CSS transitions. No npm, no React, no server required.

## What This Demo Shows

A 6-step banking flow: **Login → View Balance → Transfer Funds → Confirm → Success Notification → CTA**.

Each step renders a mock banking UI with hotspots, a scripted pointer, caption bar, progress indicator, and smooth CSS transitions.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Standalone demo — open directly in any browser |
| `script.json` | DemoScript JSON in `@cue-vin/core` schema format |
| `README.md` | This file — gap analysis and findings |

## How to Run

```bash
# No install needed — just open the file
open showcase/fintech/index.html
# or
xdg-open showcase/fintech/index.html
# or serve locally:
npx serve showcase/fintech/
```

## Features Per Step

| Step | Feature | Hotspots | Pointer | CTA | Duration |
|------|---------|----------|---------|-----|----------|
| 1 | Secure Login | 3 (Email, Password, Sign In) | (0.50, 0.58) | — | 6000ms |
| 2 | View Balance | 4 (Total, Savings, Checking, Investment) | (0.35, 0.30) | — | 6000ms |
| 3 | Initiate Transfer | 4 (Amount, Recipient, Bank, Note) | (0.50, 0.52) | — | 6000ms |
| 4 | Confirm Transfer | 3 (Details, No Fees, Confirm) | (0.50, 0.70) | — | 5000ms |
| 5 | Success Notification | 3 (Badge, Reference, ETA) | (0.50, 0.30) | — | 5000ms |
| 6 | Open Account (CTA) | 2 (Zero Fees, APY) | (0.50, 0.65) | button | 5000ms |

---

## What We Used from cue SDK

### DemoScript Schema (`@cue-vin/core`)

We structured all data in `script.json` following the `DemoScript` interface:

- **`DemoScript`** — `id`, `title`, `steps[]`, `loop`, `theme` — used exactly as specified
- **`DemoStep`** — `id`, `duration`, `pointer`, `hotspots`, `annotations`, `caption`, `cta` — all fields utilized
- **`DemoPointer`** — fractional coordinates (0–1) for pointer positioning, converted to pixels in JS
- **`DemoHotspot`** — `id`, `x`, `y`, `label`, `alwaysShow` — rendered as pulsing circles with labels
- **`DemoAnnotation`** — `type: "box"|"arrow"|"text"` with custom properties — used for visual highlights
- **`DemoCta`** — `type: "button"`, `label`, `href` — defined for the final step
- **`DemoTheme`** — `accent: "#2563EB"`, `bg: "#0a0f1a"`, `font` — applied to CSS custom properties

### Coordinate System

The fractional (0–1) coordinate system from cue was used for both `DemoPointer` and `DemoHotspot` positions, converted to absolute pixels at render time: `px = fraction * containerWidth`. This ensures resolution independence.

---

## What We Could NOT Use from cue SDK (Gaps)

### 1. `@cue-vin/player` Web Component — ❌ Cannot Use

The `<cue-embed>` custom element from `@cue-vin/player` was not used because:

- **Node.js import crash**: The barrel export (`@cue-vin/player`) imports `CueEmbed` which extends `HTMLElement`, causing `ReferenceError: HTMLElement is not defined` when imported in Node.js. This makes it impossible to use `exportToHtml()` in a build pipeline.
- **React dependency**: The `CuePlayer` React component requires `react >=18.0.0` and `react-dom`. For a standalone HTML file with zero dependencies, this is a non-starter.
- **CDN IIFE bundle**: While `cue-player.iife.js` is available via unpkg CDN, the demo felt too complex for the web component to handle well — we needed custom mock UI per step (login form, balance cards, transfer form, confirmation dialog), which the player doesn't natively render. The player expects `screen` (screenshot images) for visual content, but we wanted CSS-rendered mock UI.

**Impact**: We had to build a custom vanilla JS renderer from scratch, essentially re-implementing what the player should provide.

**Suggested Fix**:
- Add a `"./export"` sub-path export that's Node.js-safe (only `exportToHtml`, no HTMLElement)
- Consider a "headless" rendering mode where the player can render mock UI from DemoScript annotations/data instead of requiring screenshots
- Provide a standalone IIFE build that doesn't require React

### 2. `generate()` — Not Applicable

`generate()` from `@cue-vin/core` creates a DemoScript from feature descriptions, but:
- It doesn't produce the **mock UI content** (HTML/CSS) for each step — only metadata (caption, pointer, hotspots)
- For a Fintech demo with realistic banking UI, we needed actual visual content (forms, cards, balance displays), which `generate()` can't provide
- The function doesn't support custom HTML templates or component definitions per step

**Suggested Enhancement**: Add a `template` or `layout` field to `GenerateFeature` that maps to predefined UI templates (e.g., `"login-form"`, `"dashboard"`, `"transfer-form"`), which the player could then render automatically.

### 3. No Built-in Mock UI Components — ❌

The cue SDK provides `AppWindow` and `FilePickerOverlay` in `@cue-vin/react`, but these are React-only and limited to generic app chrome. There are no:

- **Fintech-specific mock components**: login forms, balance cards, transfer forms, confirmation dialogs
- **Industry-specific templates**: banking, e-commerce, healthcare, etc.
- **Data-driven UI rendering**: a way to define "show a login form with these fields" in DemoScript and have it rendered automatically

**Suggested Enhancement**: Create a `@cue-vin/templates` package with industry-specific UI templates that can be parameterized from DemoScript data.

### 4. No Annotation Rendering in Player — ⚠️

While `DemoAnnotation` is defined in the schema (`type: "arrow" | "box" | "text"`), the current player implementation doesn't render them visually. Our custom renderer also doesn't fully render annotations (we used CSS pseudo-elements for boxes/text instead of the annotation data).

The `annotations` field in `DemoStep` has `[key: string]: unknown` which is too loosely typed — there's no standard spec for what properties an `arrow` or `box` annotation should have.

**Suggested Fix**: Define concrete annotation schemas:
```typescript
interface ArrowAnnotation extends DemoAnnotation {
  type: "arrow";
  x1: number; y1: number; x2: number; y2: number;
  color?: string; label?: string;
}
interface BoxAnnotation extends DemoAnnotation {
  type: "box";
  x: number; y: number; width: number; height: number;
  color?: string; cornerRadius?: number; label?: string;
}
```

### 5. No Auto-play Timing API in Standalone HTML — ⚠️

The `Timeline` class from `@cue-vin/core` provides `setTimeout`-based scheduling with loop support, but it requires a JS runtime (Node.js or browser module system). For a standalone HTML file with no build step, we had to implement our own auto-advance timer with `setTimeout`.

**Suggested Enhancement**: Expose `Timeline` as a standalone IIFE bundle that can be loaded via `<script>` tag, similar to the player IIFE.

### 6. No Pointer Animation Library for Vanilla JS — ⚠️

The `Pointer` class from `@cue-vin/core` manages cursor movement with `moveTo()`, `click()`, and keyframe-based animation, but it's only available as an ES module. For vanilla HTML, we implemented pointer movement with CSS transitions (`transition: left 0.6s, top 0.6s`) and `simulateClick()` with a CSS class toggle.

**Suggested Enhancement**: Provide a `@cue-vin/player-vanilla` package or IIFE bundle that includes pointer animation without React dependency.

---

## Summary

| cue Feature | Used? | Notes |
|-------------|-------|-------|
| `DemoScript` schema | ✅ Yes | Structured all demo data in script.json |
| `DemoStep` schema | ✅ Yes | All fields utilized (pointer, hotspots, annotations, caption, cta) |
| Fractional coordinate system | ✅ Yes | Converted 0–1 to pixels for pointer and hotspots |
| `DemoTheme` | ✅ Yes | Applied accent/bg/font to CSS |
| `generate()` | ❌ No | Doesn't produce UI content, only metadata |
| `@cue-vin/player` / `<cue-embed>` | ❌ No | Requires React or CDN IIFE; can't render custom mock UI |
| `exportToHtml()` | ❌ No | Barrel export crashes in Node.js; pure string builder not useful with custom UI |
| `Timeline` | ❌ No | Not available as standalone IIFE for vanilla HTML |
| `Pointer` | ❌ No | Not available as standalone IIFE; CSS transitions used instead |
| `CueAnalytics` | ❌ No | No endpoint to send to in standalone demo |

## Priority Fixes for cue

1. **Node.js-safe sub-path export for `@cue-vin/player`** — `import { exportToHtml } from "@cue-vin/player/export"` without HTMLElement crash
2. **Standalone vanilla JS player bundle** — IIFE build that renders DemoScript without React
3. **Mock UI templates in DemoScript** — `layout` field per step that maps to built-in UI templates (login, dashboard, form, etc.)
4. **Concrete annotation schemas** — Replace `[key: string]: unknown` with typed arrow/box/text interfaces
5. **Standalone Timeline + Pointer IIFE** — For use in vanilla HTML demos without module bundler
6. **`generate()` should set `step.cta`** — Currently only appends CTA text to caption; CTA overlay is invisible
