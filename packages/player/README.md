# @cue-vin/player

Standalone embeddable demo player for the cue SDK. Renders a `DemoScript` as a complete interactive player with screenshot slides, animated pointer, hotspots, annotations, caption, progress indicator, and navigation. Available as a React component or a web component (`<cue-embed>`).

## Install

```bash
npm install @cue-vin/player
```

Peer dependencies: `react >=18.0.0`, `react-dom >=18.0.0`.

## Quick Start

### React Component

```tsx
import { CuePlayer } from "@cue-vin/player";
import type { DemoScript } from "@cue-vin/core";

const script: DemoScript = {
  id: "product-tour",
  title: "Product Tour",
  steps: [
    { id: "step-1", screen: "/screens/dashboard.png", caption: "Dashboard overview", pointer: { x: 0.25, y: 0.3 }, duration: 5000, hotspots: [{ id: "h1", x: 0.25, y: 0.3, label: "Revenue", alwaysShow: true }] },
    { id: "step-2", screen: "/screens/upload.png", caption: "Upload your data", pointer: { x: 0.5, y: 0.5 }, hotspots: [{ id: "h2", x: 0.5, y: 0.5, label: "Drop zone" }] },
  ],
  loop: true,
  theme: { accent: "#3b82f6", bg: "#0a0a0a" },
};

export default function DemoPage() {
  return (
    <CuePlayer
      script={script}
      width={840}
      height={520}
      autoPlay
      loop
      onStepChange={(step, total) => console.log(`Step ${step + 1}/${total}`)}
      onComplete={() => console.log("Demo complete")}
    />
  );
}
```

### Web Component (HTML snippet)

```html
<script type="module" src="https://unpkg.com/@cue-vin/player/dist/cue-player.iife.js"></script>

<cue-embed src="/demos/product-tour.json" width="840" height="520" loop autoplay></cue-embed>

<script type="module">
  const player = document.querySelector("cue-embed");
  player.addEventListener("stepchange", (e) => console.log(e.detail));
</script>
```

### Programmatic Init

```typescript
import { initCue } from "@cue-vin/player";
initCue(); // registers <cue-embed> custom element
```

### Export to Standalone HTML

```typescript
import { exportToHtml } from "@cue-vin/player";
import { writeFileSync } from "fs";

const html = exportToHtml({ script, title: "My Demo", width: 840, height: 520 });
writeFileSync("demo.html", html);
// Or with inline JS for offline use:
// exportToHtml({ script, playerJsInline: true })
```

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `CuePlayer` | Component | React component that renders a DemoScript. |
| `CuePlayerProps` | Type | `{ script: DemoScript, width?, height?, autoPlay?, loop?, onComplete?, onStepChange? }` |
| `CueEmbed` | Class | Custom Element class (`<cue-embed>`). Attributes: `src` (URL), `data` (inline JSON), `width`, `height`, `autoplay`, `loop`. Dispatches `stepchange` and `complete` events. |
| `initCue` | Function | Registers `<cue-embed>` custom element. Call once before using `<cue-embed>` in HTML. |
| `exportToHtml` | Function | `(options: ExportOptions) => string` — generates a self-contained HTML file. Options: `{ script, title?, playerJsInline?, cdnUrl?, width?, height? }`. |
| `ExportOptions` | Type | Options for `exportToHtml`. |

## CuePlayer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `script` | `DemoScript` | required | DemoScript configuration to render. |
| `width` | `number` | `840` | Slide width in pixels. |
| `height` | `number` | `520` | Slide height in pixels. |
| `autoPlay` | `boolean` | `false` | Auto-advance steps using `step.duration`. |
| `loop` | `boolean` | `false` | Loop back to step 0 after last step. |
| `onComplete` | `() => void` | — | Fired when demo reaches last step and cannot advance. |
| `onStepChange` | `(step: number, total: number) => void` | — | Fired when current step changes. |

## `<cue-embed>` Attributes

| Attribute | Description |
|-----------|-------------|
| `src` | URL to fetch DemoScript JSON from. |
| `data` | Inline DemoScript JSON string. |
| `width` | Artboard width (default: 840). |
| `height` | Artboard height (default: 520). |
| `autoplay` | Boolean attribute — auto-advance steps. |
| `loop` | Boolean attribute — loop after last step. |

## Dependencies

- `@cue-vin/core` — `DemoScript`, `DemoStep`, `DemoHotspot`, `DemoAnnotation`, `PointerState`, `validateDemoScript`
- `@cue-vin/react` — `ScreenSlide`, `ScriptedPointer`, `HotspotOverlay`, `AnnotationLayer`, `StepProgress`, `ChapterNav`, `Annotation`
