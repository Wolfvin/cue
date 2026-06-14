# cue

**Motion Primitives & Demo Theater SDK for AI Agents**

`cue` is an open-source SDK that lets AI agents (Claude, GPT, etc.) produce master-level frontend demos without deep CSS/JS animation knowledge. Think of it as **Tailwind for motion and demo theater** — no need to know `cubic-bezier` or `IntersectionObserver` internals. Just import the primitives and go.

Inspired by [HowdyGo](https://www.howygo.com/), [Arcade](https://www.arcade.software/), and [Supademo](https://www.supademo.com/) — but open-source and composable.

---

## Quick Start

```bash
# Install the packages you need
pnpm add @cue/react @cue/css

# Core is framework-agnostic (optional)
pnpm add @cue/core
```

```tsx
import { DemoTheater, ScriptedPointer, useCountUp } from "@cue/react";
import "@cue/css/cue.css";
```

---

## Packages

### `@cue/core` — Framework-agnostic engine

Zero runtime dependencies. Vanilla TypeScript.

| Export | Description |
|--------|-------------|
| `Timeline` | Scheduler that sequences callbacks with `setTimeout` and cleanup |
| `Pointer` | Scripted pointer state: position (x,y), clicking, transition |
| `StateMachine` | Scene-based state manager (idle → scene1 → scene2 → … → loop) |
| `ScrollTrigger` | `IntersectionObserver` wrapper with threshold & played-guard |

```ts
import { Timeline, Pointer, StateMachine, ScrollTrigger } from "@cue/core";
```

### `@cue/react` — React components & hooks

Peer dependency: `react >= 18`.

**Components:**

| Export | Description |
|--------|-------------|
| `DemoTheater` | Wrapper artboard (fixed size + responsive scale via ResizeObserver) |
| `ScriptedPointer` | SVG cursor with smooth CSS transition |
| `AppWindow` | Shell app chrome (titlebar, sidebar, content area) |
| `FilePickerOverlay` | File picker mock with checkboxes |
| `ExcelPopup` | Spreadsheet popup mock |

**Hooks:**

| Export | Description |
|--------|-------------|
| `useEnter` | Fade-in enter animation on mount |
| `useCountUp` | Animate a number counting up from 0 to target |
| `useStagger` | Staggered visibility flags for list animations |
| `useScrollReveal` | IntersectionObserver-based reveal trigger |

```tsx
import {
  DemoTheater, ScriptedPointer, AppWindow,
  FilePickerOverlay, ExcelPopup,
  useEnter, useCountUp, useStagger, useScrollReveal,
} from "@cue/react";
```

### `@cue/css` — Pure CSS animation primitives

Zero JS dependency. Single file: `cue.css`.

**Keyframes:** `cue-fade-in`, `cue-slide-up`, `cue-scale-in`, `cue-spin`, `cue-glow-pulse`

**Utilities:** `.cue-enter`, `.cue-enter-fade`, `.cue-enter-scale`, `.cue-hover-lift`, `.cue-stagger-{1-8}`, `.cue-spinner`, `.cue-glow`

**Custom Properties:** `--cue-ease-out`, `--cue-ease-spring`, `--cue-ease-in-out`, `--cue-duration-fast`, `--cue-duration-normal`, `--cue-duration-slow`

```css
@import "@cue/css/cue.css";
```

---

## Examples

| Example | Description |
|---------|-------------|
| `examples/auto-demo` | Auto-playing demo with scripted pointer + DemoTheater |
| `examples/interactive` | Interactive demo with FilePickerOverlay |
| `examples/primitives` | Showcase of all hooks and CSS primitives |

```bash
cd examples/auto-demo
pnpm dev
```

---

## Monorepo Structure

```
cue/
├── packages/
│   ├── core/        # Framework-agnostic engine
│   ├── react/       # React components & hooks
│   └── css/         # Pure CSS animation primitives
├── examples/
│   ├── auto-demo/   # Auto-playing scripted demo
│   ├── interactive/ # Interactive file picker demo
│   └── primitives/  # Hook & CSS primitive showcase
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## Development

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Type-check all packages
pnpm typecheck
```

---

## License

MIT
