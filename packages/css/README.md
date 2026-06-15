# @cue-vin/css

Pure CSS animation primitives for the cue SDK — zero JS dependency.

## Installation

```bash
npm install @cue-vin/css
```

Or via CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@cue-vin/css/src/cue.css" />
```

## Usage

Import the stylesheet once at the root of your project:

```js
import '@cue-vin/css';
```

## Classes & Custom Properties

### Animation Utilities

The stylesheet exposes CSS custom properties for durations and easings used across the cue SDK:

| Property | Description |
|---|---|
| `--cue-duration-fast` | Fast transition duration |
| `--cue-duration-normal` | Normal transition duration |
| `--cue-ease-out` | Ease-out timing function |
| `--cue-ease-spring` | Spring-like timing function |

---

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

## License

MIT
