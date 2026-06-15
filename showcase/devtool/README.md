# APIForge — Developer Tool Showcase Demo

A standalone interactive demo showcasing the **APIForge** developer API tool, built with pure HTML/CSS/JS using cue's DemoScript format. Terminal/hacker aesthetic with green (#00FF94) and cyan (#00D4FF) accents on a dark background.

## Demo Flow

The demo walks through 5 steps of the APIForge workflow:

| Step | Action | Visual Style |
|------|--------|--------------|
| 1 | `connect` — Connect to database | Typing effect + animated progress ring |
| 2 | `schema` — Analyze schema | ASCII art table diagrams with typed reveal |
| 3 | `generate` — Generate REST endpoints | Code block with per-character typing |
| 4 | `test` — Test endpoint | Typed request + response box with status highlight |
| 5 | `deploy` — Deploy to production | Shimmer button + launch animation + LIVE badge |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `→` | Next step |
| `←` | Previous step |
| `Space` | Pause / Play (toggles cursor blink) |

## Animation Techniques

### 1. Typing Effect (Vanilla JS)

Every step title and code block uses a character-by-character typing animation driven by `setTimeout` chains. Each character is appended to a `textContent` node at ~25ms intervals, creating the illusion of a live terminal session. The `typeText()` and `typeCodeLines()` functions handle plain strings and tokenized code segments respectively.

### 2. Tokenized Code Highlighting

Code lines are defined as arrays of `{t: className, v: text}` tokens. The typing function creates a `<span>` per token with the corresponding CSS class (`.prompt`, `.kw`, `.str`, `.fn`, `.cm`, `.num`, `.ok`), enabling syntax highlighting to appear as each character is typed — not pre-rendered.

### 3. Animated Progress Ring (CSS + SVG)

Step 1 uses an SVG circle with `stroke-dasharray: 138` and a dynamically adjusted `stroke-dashoffset` via JS. The offset transitions from 138 (empty) to 0 (full) using `transition: stroke-dashoffset 0.8s cubic-bezier(.16,1,.3,1)`, creating a smooth circular fill animation. A percentage label updates in sync.

### 4. Matrix Rain Background (CSS Animation)

Fixed-position `<div>` elements with `writing-mode: vertical-rl` contain random Japanese/mixed characters. They animate with `@keyframes fall` from `translateY(-100%)` to `translateY(100vh)` at randomized durations (8–20s), creating the classic "Matrix rain" effect at low opacity (0.06).

### 5. Scanline Overlay (CSS)

A `repeating-linear-gradient` on a fixed overlay creates horizontal scanlines at 4px intervals with `rgba(0,255,148,0.015)`, simulating a CRT monitor effect. The overlay uses `pointer-events: none` to stay non-interactive.

### 6. Shimmer Button (CSS)

The deploy button uses a `::after` pseudo-element with a gradient that slides from `-100%` to `100%` left position using `@keyframes shimmer`, creating a light sweep effect. On "launch", the button transitions to a solid green filled state via class toggle.

### 7. Step Progress Indicator (CSS Transitions)

Dots and connecting lines track progress. Active dots get `box-shadow: 0 0 12px var(--g)` and `transform: scale(1.3)`. Line fills animate width from 0% to 100% using `transition: width 0.6s var(--ease)`.

### 8. Cursor Blink (CSS Step Animation)

The cursor uses `animation: blink 1s step-end infinite` with `50% { opacity: 0 }`, creating the classic terminal cursor blink. Pause/play toggles `animationPlayState`.

## DemoScript Format — Evaluation

### What DemoScript Covers Well

The `DemoScript` JSON format in `@cue/core` provides a solid foundation for describing demo structure:

- **Step sequencing**: The `steps[]` array with `id`, `duration`, `caption` cleanly defines the demo flow.
- **Pointer positions**: Fraction-based (0–1) `pointer` coordinates are viewport-agnostic and easy to author.
- **Hotspots & annotations**: `DemoHotspot` and `DemoAnnotation` allow declarative overlay definitions.
- **Theme support**: `DemoTheme` with `accent`, `bg`, `font` covers basic theming needs.
- **CTA overlays**: `DemoCta` supports button, email capture, and link variants.
- **Validation**: `validateDemoScript()` provides runtime type checking.

### What DemoScript Cannot Express

This demo required several capabilities that the current DemoScript format does not natively support:

| Feature | Current Status | Workaround |
|---------|---------------|------------|
| **Typing animations** | No concept of per-character timing or progressive text reveal | Hardcoded in HTML/JS, not declarable in JSON |
| **Code syntax highlighting** | `caption` is plain text; no token-level markup | Custom CSS classes + JS token system |
| **Multi-phase step content** | Each step is a single frame, not a timeline of sub-events | Sub-events managed entirely in JS with setTimeout |
| **Conditional sub-content** | No way to say "show loading state, then show result" within one step | Manual setTimeout sequencing |
| **Custom visual components** (progress ring, deploy button, matrix rain) | No extension mechanism for step-specific visuals | Entirely custom HTML/CSS/JS outside DemoScript |
| **Keyboard navigation config** | Not part of DemoScript schema | Implemented in vanilla JS |
| **Sound/haptic feedback** | Not in schema | N/A |

### Recommended Extensions

If cue wants to support animated terminal-style demos natively, consider these additions to `DemoStep`:

```typescript
interface DemoStep {
  // ... existing fields ...

  /** Timeline of sub-events within a step. */
  timeline?: StepEvent[];

  /** Custom visual variant for this step. */
  variant?: "default" | "terminal" | "code" | "progress" | string;

  /** Code content with syntax tokens. */
  codeBlock?: {
    lines: CodeToken[][];
    typingSpeed?: number; // ms per character
  };
}

interface StepEvent {
  /** Delay in ms from step start. */
  at: number;
  /** Action to perform. */
  action: "type" | "show" | "hide" | "animate" | "progress";
  /** Target element selector or key. */
  target: string;
  /** Payload for the action. */
  payload?: unknown;
}
```

These extensions would allow the DemoScript JSON to fully describe the animated behavior currently hardcoded in the HTML, making demos portable and renderer-agnostic.

## File Structure

```
showcase/devtool/
├── index.html      # Standalone demo (143 lines, <500 limit)
├── script.json     # DemoScript JSON for cue SDK
└── README.md       # This documentation
```

## Running

Open `index.html` in any modern browser. No build step, no npm, no server required.
