# @cue-vin/css

Pure CSS animation primitives for the cue Demo Theater SDK. Zero JavaScript dependency. Add classes to elements for enter animations, hover effects, stagger delays, and utility effects.

## Install

```bash
npm install @cue-vin/css
```

## Quick Start

### HTML

```html
<link rel="stylesheet" href="./node_modules/@cue-vin/css/src/cue.css">

<div class="cue-enter">
  <h1>Slides up on mount</h1>
</div>

<div class="cue-enter-scale cue-stagger-flow card">Scale-in with staggered delay</div>
<div class="cue-enter-fade cue-stagger-flow card" style="--cue-stagger-base-delay: 150ms">Fade-in with 150ms delay</div>

<button class="cue-hover-lift">Lifts on hover</button>
<button class="cue-hover-glow">Glows on hover</button>
```

### React / Next.js

```tsx
import "@cue-vin/css/cue.css";

// Then use className on any element
<div className="cue-enter">Slides up</div>
<div className="cue-enter-scale cue-hover-lift">Scale in + hover lift</div>
```

## Custom Properties

Override in your own CSS to change defaults globally:

| Variable | Default | Description |
|----------|---------|-------------|
| `--cue-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default easing for most animations |
| `--cue-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoot bounce feel |
| `--cue-ease-in-out` | `cubic-bezier(0.83, 0, 0.17, 1)` | Smooth both ends |
| `--cue-ease-bounce` | `cubic-bezier(0.68, -0.6, 0.32, 1.6)` | Extreme bounce |
| `--cue-duration-fast` | `150ms` | Micro-feedback, hover |
| `--cue-duration-normal` | `300ms` | Enter animations, transitions |
| `--cue-duration-slow` | `500ms` | Scale-in, bounce |
| `--cue-duration-glacial` | `800ms` | Full-page transitions |
| `--cue-color-accent` | `#3b82f6` | Primary accent blue |
| `--cue-color-glow` | `rgba(59, 130, 246, 0.4)` | Glow shadow color |
| `--cue-color-success` | `#22c55e` | Success green |
| `--cue-color-warning` | `#f59e0b` | Warning amber |

## Classes

### Enter Animations (apply on mount)

| Class | Animation |
|-------|-----------|
| `.cue-enter` | Slide up + fade in |
| `.cue-enter-fade` | Fade in only |
| `.cue-enter-scale` | Scale in from 0.92 |
| `.cue-enter-slide-down` | Slide from top |
| `.cue-enter-slide-left` | Slide from right |
| `.cue-enter-slide-right` | Slide from left |
| `.cue-enter-bounce` | Bounce in |

### Hover Effects

| Class | Effect |
|-------|--------|
| `.cue-hover-lift` | `translateY(-4px)` + box shadow |
| `.cue-hover-scale` | `scale(1.05)` |
| `.cue-hover-glow` | Blue glow box shadow |

### Stagger Flow (parameterized — pair with `.cue-enter-*`)

Use `.cue-stagger-flow` for CSS-var-driven staggered list reveals. The
animation delay is computed automatically per `:nth-of-type()` position,
so a single class scales to any list length. Tune the cadence with
`--cue-stagger-step` (default `100ms`) and the base offset with
`--cue-stagger-base-delay` (default `0ms`).

```html
<div class="cue-enter-fade cue-stagger-flow">Item 1 — delay 0ms</div>
<div class="cue-enter-fade cue-stagger-flow">Item 2 — delay 100ms</div>
<div class="cue-enter-fade cue-stagger-flow">Item 3 — delay 200ms</div>
<!-- ...up to 10 children supported by default :nth-of-type rules -->
```

For finer control, set the CSS vars on the parent and let all children
inherit:

```html
<ul style="--cue-stagger-step: 60ms; --cue-stagger-base-delay: 200ms">
  <li class="cue-enter-fade cue-stagger-flow">Staggered at 200/260/320ms…</li>
  <li class="cue-enter-fade cue-stagger-flow">…</li>
</ul>
```

### Effects

| Class | Effect |
|-------|--------|
| `.cue-spinner` | Infinite spin (0.8s linear) |
| `.cue-glow` | Pulsing glow shadow |
| `.cue-pulse` | Opacity pulse |
| `.cue-shake` | One-shot shake |

### Display

| Class | Effect |
|-------|--------|
| `.cue-hidden` | `opacity: 0; pointer-events: none` |
| `.cue-visible` | `opacity: 1; pointer-events: auto` |

### Canvas — Fixed Aspect Ratio Containers

`.cue-canvas` creates a responsive container with a fixed aspect ratio. It uses `container-type: size` so child elements can use container query units (`cqw`, `cqh`). Width follows the parent; height is derived from the ratio.

Use `data-ratio` to pick the preset:

| `data-ratio` | Aspect Ratio | Use Case |
|--------------|--------------|----------|
| `"1:1"` | 1 / 1 | Instagram post / square |
| `"4:5"` | 4 / 5 | Instagram portrait |
| `"9:16"` | 9 / 16 | Reels / TikTok / Story |
| `"16:9"` | 16 / 9 | Landscape / widescreen (default) |

If no `data-ratio` is set, the canvas defaults to **16:9**.

```html
<!-- Square canvas for IG post -->
<div class="cue-canvas" data-ratio="1:1" style="width: 400px">
  <cue-embed ...></cue-embed>
</div>

<!-- 9:16 canvas for Reels / TikTok, full-width -->
<div class="cue-canvas" data-ratio="9:16">
  <cue-embed ...></cue-embed>
</div>

<!-- Using container query units inside a canvas -->
<div class="cue-canvas" data-ratio="1:1" style="width: 400px">
  <div style="font-size: 5cqw;">Scales with canvas</div>
</div>
```

#### `.cue-canvas-center` — Full-Screen Centering

Wrap a `.cue-canvas` in `.cue-canvas-center` to center it vertically and horizontally in the viewport. Set `--cue-canvas-center-bg` to add a background color.

```html
<div class="cue-canvas-center" style="--cue-canvas-center-bg: #111">
  <div class="cue-canvas" data-ratio="9:16" style="max-width: 420px">
    <cue-embed ...></cue-embed>
  </div>
</div>
```


### Standalone Cursor — `.cue-pointer`

A standalone, absolute-positioned cursor element for vanilla JS demos and showcases. Visually matches the `ScriptedPointer` component from `@cue-vin/react`.

```html
<div style="position: relative;">
  <div class="cue-pointer" id="cursor"></div>
</div>
```

```js
const cursor = document.getElementById('cursor');

// Move the cursor
cursor.style.left = '120px';
cursor.style.top = '80px';

// Simulate a click
cursor.classList.add('cue-pointer-clicking');
setTimeout(() => cursor.classList.remove('cue-pointer-clicking'), 150);
```

#### Classes

| Class | Description |
|---|---|
| `.cue-pointer` | Renders the arrow cursor with smooth movement transitions |
| `.cue-pointer-clicking` | Scales down slightly to simulate a click press |

#### Custom Property

| Property | Description |
|---|---|
| `--cue-cursor-url` | Data URI of the embedded cursor SVG. Override to use a custom cursor image. |

```css
/* Override with a custom cursor */
:root {
  --cue-cursor-url: url('./my-custom-cursor.svg');
}
```

The SVG is embedded as a base64 data URI so **no extra file request** is needed when loaded from a CDN.


## Dependencies

None — pure CSS, zero JavaScript.
