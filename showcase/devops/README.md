# DeployKit — DevOps Showcase Demo

> Standalone HTML demo for a fictional DevOps product **DeployKit** (zero-downtime deployment platform), built with pure vanilla HTML/CSS/JS using cue's DemoScript format. Dark terminal aesthetic with green (#00FF94) and cyan (#00D4FF) accents. No npm, no React, no build step.

## Demo Flow

The demo walks through 6 steps of the DeployKit deployment workflow:

| Step | Action | Visual Style |
|------|--------|--------------|
| 1 | `pipeline` — View service health status | Animated service rows with green/yellow/red status dots |
| 2 | `trigger` — Select service, branch, environment | Form with selectable fields and blinking carets |
| 3 | `build` — Watch build progress | Typewriter-style real-time log output with color-coded levels |
| 4 | `health` — Automated health checks | Checklist items appear one-by-one, transitioning from waiting to passing |
| 5 | `canary` — Canary traffic rollout | Animated progress bar 0% → 100% with live metrics cards |
| 6 | `cta` — Call to action | Shimmer button "Deploy dalam 5 Menit" with subtitle reveal |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `→` | Next step |
| `←` | Previous step |
| `Space` | Pause / Play (toggles cursor blink) |

## Animation Techniques

### 1. Staggered Row Reveal (Pipeline Step)

Service rows use CSS `opacity` and `transform` transitions triggered by adding a `.visible` class via `setTimeout` at staggered intervals (120ms apart). Each row slides in from the left with `translateX(-8px)` → `translateX(0)`.

### 2. Form Field Animation (Trigger Step)

Form rows use a similar stagger reveal with `translateY(6px)` → `translateY(0)`, giving a "typing into the form" feel. Active fields have a blinking cursor caret via the same `step-end` animation as the header cursor.

### 3. Typewriter Log Output (Build Step)

Log lines appear one at a time with 250ms intervals. Each line starts at `opacity: 0` and transitions to `opacity: 1` when the `.visible` class is added. Lines are color-coded by level: green for OK (`✓`), cyan for info (`→`), yellow for warnings (`⚠`), and red for errors (`✗`).

### 4. Health Check Sequential Reveal (Health Step)

Check items appear one at a time (300ms stagger) starting with a "waiting" state (gray dot, `·`). After an additional delay (1.2s per item), each transitions to "pass" state (green circle, `✓`, latency shown). This simulates real health checks completing sequentially.

### 5. Animated Canary Progress Bar (Canary Step)

A CSS-styled progress bar fills from 0% to 100% using JS-driven width updates at randomized intervals (~80–200ms per tick). The fill has a gradient (`linear-gradient(90deg, cyan, green)`) with a `::after` pseudo-element creating a pulsing glow effect. Three metric cards (Error Rate, P99 Latency, Requests/s) update dynamically as the bar progresses.

### 6. Shimmer Button + Subtitle Reveal (CTA Step)

The CTA button uses a `::after` gradient sweep animation (`shimmer` keyframes) for visual appeal. It fades in with `scale(0.9)` → `scale(1)` via CSS transition. The subtitle line appears 400ms later with a separate opacity transition.

### 7. Scanline Overlay (CSS)

A `repeating-linear-gradient` on a fixed overlay creates subtle horizontal scanlines at 4px intervals with `rgba(0,255,148,0.012)`, simulating a CRT/terminal monitor effect.

### 8. Pointer & Hotspots (JS + CSS)

A CSS-rendered pointer (white arrow with green dot) transitions position with `cubic-bezier(.16,1,.3,1)` easing. Hotspots use pulsing ring animations (`hotspotPulse` keyframes) with optional labels, positioned using the same fractional coordinate system as cue's `DemoPointer` and `DemoHotspot`.

### 9. Step Progress Indicator (CSS Transitions)

Dots and connecting lines track progress across the 6 steps. Active dots glow with `box-shadow` and `scale(1.3)`. Lines fill from 0% to 100% width using CSS transitions.

---

## DemoScript Format — Gap Analysis

### What DemoScript Covers Well

The `DemoScript` JSON format in `@cue-vin/core` provides a solid structural foundation:

- **Step sequencing**: The `steps[]` array with `id`, `duration`, `caption` cleanly defines the demo flow.
- **Pointer positions**: Fraction-based (0–1) `pointer` coordinates are viewport-agnostic and easy to author.
- **Hotspots & annotations**: `DemoHotspot` and `DemoAnnotation` allow declarative overlay definitions with labels and visibility toggles.
- **Theme support**: `DemoTheme` with `accent`, `bg`, `font` covers basic theming.
- **CTA overlays**: `DemoCta` supports button, email capture, and link variants for conversion steps.
- **Validation**: `validateDemoScript()` provides runtime structural checking.

### What DemoScript Cannot Express (Gaps)

This DevOps demo exposed several capabilities that the current DemoScript format does not natively support:

| Feature | Current Status | Workaround Used |
|---------|---------------|-----------------|
| **Staggered row animations** | No concept of per-item timing or progressive reveal within a step | JS `setTimeout` with incremental delays + CSS transitions |
| **Typewriter / log output** | No concept of per-character or per-line timing | JS-driven `setTimeout` chains with CSS opacity transitions |
| **State transitions within a step** | Each step is a single frame, not a timeline of sub-events | Manual sequencing with `setTimeout`; health checks go from waiting → passing |
| **Animated progress bars** | No built-in progress bar or metric card component | Entirely custom HTML/CSS with JS-driven width updates |
| **Real-time metric updates** | No way to define dynamic data that changes during a step | JS random number generation with `setTimeout` tick loop |
| **Custom visual components** (service list, form, log, checklist, canary bar) | No extension mechanism for step-specific visuals or layouts | Entirely custom HTML/CSS/JS outside DemoScript |
| **Conditional sub-content** | No way to express "show loading, then show result" within one step | Manual `setTimeout` sequencing with CSS class toggles |
| **Keyboard navigation config** | Not part of DemoScript schema | Implemented in vanilla JS `keydown` listener |
| **Sound/haptic feedback** | Not in schema | N/A |
| **Interactive form elements** | No way to define input fields, selectors, or toggles in DemoScript | Custom HTML form elements with simulated selection state |

### Recommended Extensions

If cue wants to support animated DevOps/terminal-style demos natively, consider these additions to `DemoStep`:

```typescript
interface DemoStep {
  // ... existing fields ...

  /** Timeline of sub-events within a step. */
  timeline?: StepEvent[];

  /** Custom visual variant for this step. */
  variant?: "default" | "terminal" | "pipeline" | "log" | "progress" | string;

  /** Data-driven content definition. */
  content?: StepContent;
}

interface StepEvent {
  /** Delay in ms from step start. */
  at: number;
  /** Action to perform. */
  action: "type" | "show" | "hide" | "animate" | "progress" | "update-metric" | "transition";
  /** Target element selector or key. */
  target: string;
  /** Payload for the action. */
  payload?: unknown;
}

interface StepContent {
  /** For pipeline/health steps: list of items with status. */
  items?: ContentItem[];
  /** For log steps: lines with timestamps and levels. */
  lines?: LogLine[];
  /** For form steps: field definitions. */
  fields?: FormField[];
  /** For progress steps: bar configuration. */
  progress?: ProgressConfig;
  /** For metric cards: live-updating values. */
  metrics?: MetricConfig[];
}
```

These extensions would allow the DemoScript JSON to fully describe the animated behavior currently hardcoded in the HTML, making demos portable, renderer-agnostic, and generatable from code.

---

## File Structure

```
showcase/devops/
├── index.html      # Standalone demo (vanilla HTML/CSS/JS, no dependencies)
├── script.json     # DemoScript JSON for cue SDK
└── README.md       # This documentation with gap analysis
```

## Running

Open `index.html` in any modern browser. No build step, no npm, no server required.

```bash
# No install needed — just open the file
open showcase/devops/index.html
# or
xdg-open showcase/devops/index.html
# or serve locally:
npx serve showcase/devops/
```
