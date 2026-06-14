# @cue-vin/core

Framework-agnostic motion engine for the cue Demo Theater SDK. Provides scheduling, pointer animation, state management, demo scripting, analytics, and generation — all with zero runtime dependencies.

## Install

```bash
npm install @cue-vin/core
```

## Quick Start

```typescript
import { Timeline, Pointer, StateMachine } from "@cue-vin/core";

// Build a scripted demo timeline
const pointer = new Pointer({ startX: 100, startY: 100, onChange: (s) => updateCursor(s) });
const sm = new StateMachine({ loop: true, onTransition: (e) => setScene(e.to) });
sm.addScenes([{ id: "idle" }, { id: "upload" }, { id: "results" }]);

const tl = new Timeline({ loop: true, loopDelay: 2000 });
tl.add(1000, () => sm.goTo("idle"));
tl.add(1500, () => pointer.moveTo(300, 250, 600));
tl.add(800, () => pointer.click());
tl.add(1200, () => sm.goTo("upload"));
tl.play();
// Cleanup on unmount: tl.dispose(); pointer.dispose();
```

```typescript
// Generate a DemoScript from feature descriptions
import { generate, validateDemoScript } from "@cue-vin/core";

const script = generate({
  id: "my-saas-demo",
  title: "My SaaS Product Demo",
  features: [
    { name: "Dashboard Overview", description: "See key metrics at a glance.", screenshotPath: "/screens/dashboard.png" },
    { name: "Upload Data", description: "Drag and drop files.", cta: { type: "button", label: "Try Upload" } },
  ],
  defaultDuration: 5000,
});

if (validateDemoScript(script)) {
  console.log(`Generated ${script.steps.length} steps`);
}
```

## Exports

### Classes

| Export | Description |
|--------|-------------|
| `Timeline` | setTimeout-based callback scheduler with loop and cleanup. Constructor: `new Timeline({ loop?, loopDelay?, onComplete? })`. Methods: `add(delay, cb)`, `play()`, `stop()`, `reset()`, `remove(id)`, `dispose()`. |
| `Pointer` | Scripted cursor with x/y/clicking state via onChange callback. Constructor: `new Pointer({ startX?, startY?, defaultDuration?, onChange? })`. Methods: `moveTo(x, y, duration?)`, `click(duration?)`, `play(keyframes[])`, `stop()`, `reset(x?, y?)`, `dispose()`. |
| `StateMachine` | Scene-based state manager with sequential transitions and loop. Constructor: `new StateMachine({ loop?, onTransition? })`. Methods: `addScene(scene)`, `addScenes(scenes[])`, `start()`, `next()`, `prev()`, `goTo(id)`, `reset()`. Getters: `current`, `currentId`, `sceneIds`, `sceneCount`, `isStarted`, `isFinished`. |
| `ScrollTrigger` | IntersectionObserver wrapper with played-guard. Constructor: `new ScrollTrigger({ target, threshold?, rootMargin?, once?, onEnter, onLeave? })`. Methods: `observe()`, `disconnect()`, `reset()`, `dispose()`. |
| `CueAnalytics` | Session event tracker. Constructor: `new CueAnalytics({ demoId, endpoint?, onEvent?, console? })`. Methods: `track(type, extra?)`, `getSession()`, `getSummary()`. |

### Functions

| Export | Signature | Description |
|--------|-----------|-------------|
| `validateDemoScript` | `(script: unknown) => script is DemoScript` | Type guard that validates required fields (`id`, `title`, `steps[]` with `id`). |
| `getDemoStep` | `(script: DemoScript, index: number) => DemoStep \| undefined` | Safe step accessor by index. |
| `generate` | `(options: GenerateOptions) => DemoScript` | Heuristic DemoScript generator from feature list. Each feature becomes one DemoStep. Steps with CTA have `duration: undefined` (manual advance). |
| `screenshotToStep` | `(options: ScreenshotToStepOptions) => Promise<DemoStep>` | Build a DemoStep from a screenshot URL, pointer, hotspots, and caption. |
| `fileToDataUrl` | `(filePath: string, mimeType?) => Promise<string>` | Node.js only — read file to base64 data URI. |
| `interpolatePointer` | `(from, to, steps) => Array<{x,y}>` | Linear interpolation between two pointer positions. |

### Types

| Export | Description |
|--------|-------------|
| `DemoScript` | `{ id, title, steps: DemoStep[], loop?, theme?: DemoTheme }` |
| `DemoStep` | `{ id, duration?, screen?, pointer?: DemoPointer, hotspots?: DemoHotspot[], annotations?: DemoAnnotation[], caption?, cta?: DemoCta }` |
| `DemoHotspot` | `{ id, x: number (0–1), y: number (0–1), label, alwaysShow? }` |
| `DemoPointer` | `{ x: number (0–1), y: number (0–1), clicking? }` |
| `DemoCta` | `{ type: "button" \| "email_capture" \| "link", label, href?, placeholder?, submitLabel?, successMessage? }` |
| `DemoTheme` | `{ accent?, bg?, font? }` |
| `DemoAnnotation` | `{ type: "arrow" \| "box" \| "text", [key: string]: unknown }` |
| `PointerState` | `{ x, y, clicking, transition: string }` |
| `PointerKeyframe` | `{ x, y, duration?, click?, delay? }` |
| `Scene` | `{ id, onEnter? }` |
| `TransitionEvent` | `{ from: string \| null, to: string }` |
| `CueEvent` | `{ type: CueEventType, demoId, step?, hotspotId?, timestamp, sessionId }` |
| `CueSummary` | `{ demoId, sessionId, totalStepsViewed, completionRate, events: CueEvent[] }` |
| `GenerateOptions` | `{ id, title, features: GenerateFeature[], defaultDuration?, theme? }` |

### Event Types (CueEventType)

`"demo_start" | "demo_complete" | "demo_exit" | "step_view" | "step_complete" | "hotspot_click" | "nav_prev" | "nav_next" | "nav_goto"`

## Dependencies

None — zero runtime dependencies.

## Coordinate System

`DemoPointer` and `DemoHotspot` use **fractional coordinates** (0–1) relative to the slide dimensions. Convert to pixels: `px = fraction * slideWidth`. This ensures resolution independence across viewports.
