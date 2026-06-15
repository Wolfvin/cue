# cue

**Motion Primitives & Demo Theater SDK for AI Agents**

`cue` is an open-source SDK that lets AI agents (Claude, GPT, etc.) produce master-level frontend demos without deep CSS/JS animation knowledge. Think of it as **Tailwind for motion and demo theater** — no need to know `cubic-bezier` or `IntersectionObserver` internals. Just import the primitives and go.

Inspired by [HowdyGo](https://www.howygo.com/), [Arcade](https://www.arcade.software/), and [Supademo](https://www.supademo.com/) — but open-source and composable.

---

## Quick Start

```bash
# Install the packages you need
pnpm add @cue-vin/react @cue-vin/css

# Core is framework-agnostic (optional)
pnpm add @cue-vin/core
```

```tsx
import { DemoTheater, ScriptedPointer, useCountUp } from "@cue-vin/react";
import "@cue-vin/css/cue.css";
```

---

## Quick Start (for AI Agents)

```bash
# Clone dan install
git clone https://github.com/Wolfvin/cue
cd cue && pnpm install

# Build semua packages
pnpm run build

# Jalankan contoh end-to-end
cd examples/e2e && pnpm start
# → Generates demo.html, open di browser
```

### Pakai sebagai MCP Tool di Claude

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "cue": {
      "command": "npx",
      "args": ["@cue-vin/mcp"]
    }
  }
}
```

Claude sekarang bisa panggil: `cue_generate`, `cue_export_html`, `cue_validate`, `cue_get_stats`

---

## Packages

### `@cue-vin/core` — Framework-agnostic engine

Zero runtime dependencies. Vanilla TypeScript.

| Export | Description |
|--------|-------------|
| `Timeline` | Scheduler that sequences callbacks with `setTimeout` and cleanup |
| `Pointer` | Scripted pointer state: position (x,y), clicking, transition |
| `StateMachine` | Scene-based state manager (idle → scene1 → scene2 → … → loop) |
| `ScrollTrigger` | `IntersectionObserver` wrapper with threshold & played-guard |

```ts
import { Timeline, Pointer, StateMachine, ScrollTrigger } from "@cue-vin/core";
```

### `@cue-vin/react` — React components & hooks

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
} from "@cue-vin/react";
```

### `@cue-vin/css` — Pure CSS animation primitives

Zero JS dependency. Single file: `cue.css`.

**Keyframes:** `cue-fade-in`, `cue-slide-up`, `cue-scale-in`, `cue-spin`, `cue-glow-pulse`

**Utilities:** `.cue-enter`, `.cue-enter-fade`, `.cue-enter-scale`, `.cue-hover-lift`, `.cue-stagger-{1-8}`, `.cue-spinner`, `.cue-glow`

**Custom Properties:** `--cue-ease-out`, `--cue-ease-spring`, `--cue-ease-in-out`, `--cue-duration-fast`, `--cue-duration-normal`, `--cue-duration-slow`

```css
@import "@cue-vin/css/cue.css";
```

---

## Examples

| Example | Description |
|---------|-------------|
| `examples/e2e` | End-to-end: generate → validate → export HTML (no build step) |
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
│   ├── e2e/         # End-to-end: generate → validate → export HTML
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
