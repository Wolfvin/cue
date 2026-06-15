# showcase/mobile — PaketKu Mobile App Demo

> Standalone HTML demo for a fictional mobile package-tracking app **PaketKu**, rendered inside a smartphone silhouette frame within a landscape canvas (840x520). Pure vanilla JS + CSS, zero npm dependencies.

## What This Demo Shows

A 5-step mobile app flow: **Splash + Login → Home (Paket List) → Detail Paket (Timeline) → Notifikasi (Push) → CTA (Download)**.

Each step renders a mock mobile UI inside a phone-shaped frame, with hotspots, a scripted pointer, caption bar, and step-specific animations (typing, card highlights, push notification slide-in).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Standalone demo — open directly in any browser |
| `script.json` | DemoScript JSON in `@cue-vin/core` schema format |
| `README.md` | This file — portrait support analysis and findings |

## How to Run

```bash
# No install needed — just open the file
open showcase/mobile/index.html
# or
xdg-open showcase/mobile/index.html
```

## Features Per Step

| Step | Feature | Hotspots | Pointer | CTA | Duration |
|------|---------|----------|---------|-----|----------|
| 1 | Splash + Login (input HP) | 2 (Input, Masuk button) | (0.50, 0.62) | — | 7000ms |
| 2 | Home — Paket List | 3 (OTP, Transit, Delivered) | (0.50, 0.50) | — | 6000ms |
| 3 | Detail Paket — Timeline | 2 (ETA, Active step) | (0.50, 0.55) | — | 7000ms |
| 4 | Push Notification | 1 (Push notif) | (0.50, 0.18) | — | 6000ms |
| 5 | CTA — Download | 2 (App Store, Google Play) | (0.50, 0.70) | button | 5000ms |

## Design Approach

### Smartphone Frame

The demo renders inside a CSS-drawn smartphone silhouette (`phone-frame` class) centered in the landscape 840x520 canvas. Key design choices:

- **Phone dimensions**: 272x560px with rounded corners (36px border-radius), notch (CSS `::before`), camera dot (`::after`), and home indicator bar
- **Portrait container**: The actual phone screen is 264x~520px (portrait aspect ratio ~9:18) embedded inside the landscape canvas
- **Visual context**: The phone sits centered in a dark canvas with subtle radial gradient glow, clearly communicating "this is a mobile app demo"

### Step Animations

| Step | Animation Technique |
|------|-------------------|
| 1 (Login) | Character-by-character typing into phone input field (80ms per char, 1200ms delay) |
| 2 (Home) | Sequential card highlight with border-color + scale transform (800ms intervals) |
| 3 (Timeline) | Static CSS — active step highlighted with indigo dot + glow, done steps in green |
| 4 (Notif) | Push notification slides down from top with `transform: translateY(-120%)` → `translateY(0)` |
| 5 (CTA) | Static CSS — two store buttons with hover scale effect |

---

## Portrait Support Analysis

### The Core Question

**Does the cue DemoScript coordinate system support portrait layouts?**

The answer is nuanced: **the coordinate system itself is aspect-ratio-agnostic, but every layer above it assumes landscape.**

### 1. Coordinate System: Fractional 0–1 — Theoretically Aspect-Ratio-Agnostic

The `DemoPointer` and `DemoHotspot` interfaces use fractional coordinates (0–1) for both X and Y:

```typescript
interface DemoPointer {
  x: number; // 0–1 fraction of width
  y: number; // 0–1 fraction of height
}
```

This is **theoretically neutral** — the same (0.5, 0.5) means "center" regardless of whether the container is 840x520 (landscape) or 360x640 (portrait). The fractional system doesn't encode aspect ratio.

**However**, the practical issue is: **what is the container?** In the existing showcases (devtool, fintech, saas), the container is always the full landscape theater (840x520 or similar). The coordinates are authored against that specific aspect ratio.

### 2. The Problem: Portrait Content Inside a Landscape Canvas

In this demo, we encountered a fundamental layout mismatch:

- **Canvas**: 840x520 (landscape, the standard cue theater size)
- **Phone screen content**: 264x520 (portrait, ~9:18 aspect ratio)

The phone screen occupies only a narrow vertical strip within the wider canvas. This creates two sub-problems:

#### 2a. Pointer and Hotspot Positioning

When `DemoPointer.x = 0.50, y = 0.62`, this means "50% across the full canvas width, 62% down the full canvas height." But our interactive content lives inside the phone screen, which is offset from the canvas origin.

**Workaround used**: We remap pointer/hotspot coordinates by calculating the phone screen's offset within the canvas:

```javascript
const offsetX = screenRect.left - canvasRect.left;
const offsetY = screenRect.top - canvasRect.top;
const px = offsetX + step.pointer.x * screenRect.width;
const py = offsetY + step.pointer.y * screenRect.height;
```

This works, but it means the coordinates in `script.json` are authored relative to the **phone screen** (portrait), not the **canvas** (landscape). If a future cue player interprets them as canvas-relative (which the SDK currently does), the pointer and hotspots will appear in the wrong position.

#### 2b. Annotation Positioning

`DemoAnnotation` coordinates (e.g., `x`, `y`, `x1`, `y1`, `width`, `height` for `box` type) suffer the same problem. In this demo, we defined annotations relative to the phone screen, but the cue player would render them relative to the full canvas.

### 3. What's Missing in the SDK for First-Class Portrait Support

| Gap | Current State | What's Needed |
|-----|---------------|---------------|
| **No `viewport` or `container` concept in DemoScript** | Coordinates are implicitly relative to the player's root container | Add a `viewport` field to `DemoScript` or `DemoStep` that defines the coordinate reference frame (e.g., `{ x: 0, y: 0, width: 1, height: 1 }` for full-canvas, or `{ x: 0.34, y: 0, width: 0.32, height: 1 }` for a phone-shaped sub-region) |
| **No `aspectRatio` or `orientation` field** | All existing demos assume landscape | Add `orientation: "landscape" \| "portrait"` to `DemoScript`, which the player uses to set the theater dimensions |
| **No device frame component** | `AppWindow` in `@cue-vin/react` renders a laptop/desktop window chrome | Add a `PhoneFrame` component (or generic `DeviceFrame` with variants: phone, tablet, laptop) that the player can wrap portrait content in |
| **Pointer coordinates are container-relative, not viewport-relative** | `Pointer` class positions cursor relative to the theater element | Add an optional `viewport` parameter or `coordinateSpace` that the pointer respects |
| **Hotspot coordinates share the same problem** | `HotspotOverlay` positions relative to the theater | Same viewport/coordinateSpace solution as pointer |
| **No `screen` mode for rendered UI** | The `screen` field expects a screenshot URL; no way to say "render this HTML template" | Add a `template` or `content` field to `DemoStep` that provides HTML/CSS to render inside the viewport, enabling data-driven mock UI |

### 4. Recommended SDK Changes

#### 4a. Add `viewport` to DemoScript

```typescript
interface DemoScript {
  // ... existing fields ...

  /** Defines the coordinate reference frame for pointer/hotspot/annotation positions.
   *  Defaults to full canvas (0,0,1,1). Set a sub-region for phone-in-landscape layouts. */
  viewport?: {
    x: number; // 0-1, left edge
    y: number; // 0-1, top edge
    width: number; // 0-1
    height: number; // 0-1
  };

  /** Device frame to render around the viewport. */
  deviceFrame?: "none" | "phone" | "tablet" | "laptop";

  /** Aspect ratio of the viewport content (e.g., "9:16" for phone portrait). */
  aspectRatio?: string;
}
```

With this, the player can:
1. Calculate the phone screen position within the landscape canvas
2. Remap all coordinates relative to the `viewport` instead of the full canvas
3. Render a `PhoneFrame` chrome around the viewport area

#### 4b. Add `DeviceFrame` Component

```typescript
// In @cue-vin/react or @cue-vin/player
interface DeviceFrameProps {
  variant: "phone" | "tablet" | "laptop";
  children: React.ReactNode;
  orientation?: "portrait" | "landscape";
}
```

This would be the player's built-in equivalent of our hand-drawn `.phone-frame` CSS, auto-sizing based on `DemoScript.aspectRatio` and `DemoScript.viewport`.

#### 4c. Make Pointer/Hotspot Viewport-Aware

The `Pointer` and `HotspotOverlay` components should accept a `viewport` parameter and remap coordinates:

```typescript
// Internal remapping logic
const absoluteX = viewport.x + pointer.x * viewport.width;
const absoluteY = viewport.y + pointer.y * viewport.height;
```

This ensures that `pointer: { x: 0.5, y: 0.5 }` always means "center of the viewport" — whether the viewport is the full canvas or a phone-shaped sub-region.

### 5. Practical Verdict

| Question | Answer |
|----------|--------|
| Does the 0–1 fractional coordinate system support portrait? | **Yes, in principle** — the math is aspect-ratio-agnostic |
| Does the cue SDK render portrait content correctly? | **No, not without workarounds** — there's no concept of a sub-viewport or device frame |
| Can you render a phone demo in cue today? | **Yes, with significant custom work** — you must hand-draw the phone frame, remap all coordinates manually, and build a custom renderer (as we did here) |
| What's the minimum SDK change for first-class support? | Add `viewport` + `deviceFrame` + `aspectRatio` to `DemoScript`, and make `Pointer`/`HotspotOverlay` viewport-aware |

### 6. Comparison with Existing Showcases

| Aspect | devtool / fintech / saas | mobile (this demo) |
|--------|--------------------------|-------------------|
| Canvas | 840x520 landscape | 840x520 landscape (same) |
| Content frame | Full canvas (laptop window) | Phone-shaped sub-region (272x560) |
| Coordinate reference | Full canvas | Phone screen (manual remap) |
| Device chrome | `AppWindow` (laptop) | Hand-drawn CSS phone frame |
| Pointer mapping | Direct: `frac * canvasSize` | Remapped: `offset + frac * screenSize` |
| Annotation mapping | Direct | Remapped (same as pointer) |

---

## Summary

| cue Feature | Used? | Notes |
|-------------|-------|-------|
| `DemoScript` schema | ✅ Yes | Structured all demo data in script.json |
| `DemoStep` schema | ✅ Yes | All fields utilized (pointer, hotspots, annotations, caption, cta) |
| Fractional coordinate system | ⚠️ Partial | Coordinates authored relative to phone screen; manual remap needed for canvas positioning |
| `DemoTheme` | ✅ Yes | Applied accent/bg/font to CSS |
| `DemoCta` | ✅ Yes | Button CTA on final step |
| `generate()` | ❌ No | Doesn't produce UI content or device frame |
| `@cue-vin/player` / `<cue-embed>` | ❌ No | No device frame support; can't render phone-shaped viewport |
| `AppWindow` (React) | ❌ No | Laptop chrome only, not phone frame |
| `exportToHtml()` | ❌ No | Barrel export crashes in Node.js |
| `Timeline` | ❌ No | Not available as standalone IIFE |
| `Pointer` | ❌ No | Not viewport-aware; CSS transitions used instead |

## Priority Fixes for cue (Portrait/Mobile Support)

1. **Add `viewport`, `deviceFrame`, and `aspectRatio` to `DemoScript`** — Enables declarative phone-in-landscape layouts without manual coordinate remapping
2. **Add `PhoneFrame` / `DeviceFrame` component** — Built-in device chrome for mobile and tablet demos
3. **Make `Pointer` and `HotspotOverlay` viewport-aware** — Remap coordinates based on `DemoScript.viewport`
4. **Add `orientation` field to `DemoScript`** — Explicit signal for portrait vs landscape layout
5. **Concrete annotation schemas** — Replace `[key: string]: unknown` with typed arrow/box/text interfaces
6. **Mock UI templates per step** — `layout: "login-form"` / `"list"` / `"timeline"` / `"cta"` that the player can auto-render inside the viewport
