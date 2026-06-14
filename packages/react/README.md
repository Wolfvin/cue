# @cue-vin/react

React components and hooks for the cue Demo Theater SDK. Renders scripted demo theaters with animated pointers, mock UI chrome, hotspot overlays, annotations, progress indicators, and CTA overlays.

## Install

```bash
npm install @cue-vin/react
```

Peer dependencies: `react >=18.0.0`, `react-dom >=18.0.0`.

## Quick Start

```tsx
"use client";
import { useState, useEffect } from "react";
import { DemoTheater, ScriptedPointer, AppWindow, StepProgress, ChapterNav, useDemoController } from "@cue-vin/react";
import { Pointer, StateMachine, Timeline, type PointerState } from "@cue-vin/core";
import "@cue-vin/css/cue.css";

const SCENES = [
  { id: "idle", label: "Dashboard" },
  { id: "upload", label: "Upload" },
  { id: "results", label: "Results" },
];

export default function AutoDemoPage() {
  const [ps, setPs] = useState<PointerState>({ x: 160, y: 180, clicking: false, transition: "400ms" });
  const [sceneId, setSceneId] = useState("idle");
  const ctrl = useDemoController({ steps: SCENES.length, loop: true });

  useEffect(() => {
    const ptr = new Pointer({ startX: 160, startY: 180, onChange: setPs });
    const sm = new StateMachine({ loop: true, onTransition: (e) => setSceneId(e.to) });
    sm.addScenes(SCENES.map((s) => ({ id: s.id })));
    const tl = new Timeline({ loop: true, loopDelay: 2000 });
    tl.add(1000, () => sm.goTo("idle"));
    tl.add(1500, () => ptr.moveTo(300, 250, 600));
    tl.add(800, () => ptr.click());
    tl.add(1200, () => sm.goTo("upload"));
    tl.play();
    return () => { tl.dispose(); ptr.dispose(); };
  }, []);

  return (
    <DemoTheater width={960} height={540} background="#fff">
      <AppWindow title="demo-app" sidebar={<div>{SCENES.map(s => <div key={s.id}>{s.label}</div>)}</div>}>
        <h2>{SCENES.find(s => s.id === sceneId)?.label}</h2>
      </AppWindow>
      <ScriptedPointer state={ps} />
    </DemoTheater>
  );
}
```

## Components

| Export | Props | Description |
|--------|-------|-------------|
| `DemoTheater` | `width?: number (1280), height?: number (720), background?: string, children, className?` | Fixed-size artboard that scales responsively via ResizeObserver. All demo content goes inside. |
| `ScriptedPointer` | `state: PointerState, size?: number (24), color?: string, className?` | SVG cursor with CSS transition. Driven by `Pointer` from `@cue-vin/core`. |
| `AppWindow` | `title?: string, sidebar?: ReactNode, children, sidebarWidth?: number (220), showTitlebar?: boolean, className?` | Mock app chrome with macOS-style titlebar, optional sidebar, and content area. |
| `FilePickerOverlay` | `files: FileEntry[], onSelect: (ids: string[]) => void, multiple?: boolean, className?` | File picker mock with checkboxes. `FileEntry = { id, name, type? }`. |
| `ExcelPopup` | `data: ExcelCell[][], title?: string, footer?: ReactNode, className?` | Spreadsheet popup mock. `ExcelCell = { value, selected? }`. |
| `HotspotOverlay` | `hotspots: Hotspot[], containerWidth: number, containerHeight: number` | Pulsing hotspot dots with hover tooltips. `Hotspot = { id, x, y, label, alwaysShow? }`. Coordinates in **pixels**. |
| `AnnotationLayer` | `annotations: Annotation[]` | SVG overlay for arrows (`{ type:"arrow", x1,y1,x2,y2,color? }`), boxes (`{ type:"box", x,y,w,h,color?,label? }`), text (`{ type:"text", x,y,content,size? }`). |
| `ScreenSlide` | `src: string, alt?, width?: number (840), height?: number (520), objectFit?, children?, className?, style?` | Screenshot/image slide with overlay slot for hotspots, annotations, and pointers. |
| `StepProgress` | `current: number, total: number, variant?: "dots" \| "bar", className?` | Dots or bar progress indicator. Active dot/bar uses accent color `#C91C1C`. |
| `ChapterNav` | `onPrev, onNext, isPrevDisabled, isNextDisabled, prevLabel?, nextLabel?, showLabels?` | Prev/Next navigation buttons. |
| `CtaOverlay` | `cta: DemoCta, onSubmit?: (value: string) => void, onDismiss?: () => void` | CTA overlay with button, email_capture, or link variants. All include "Skip" dismiss. |

## Hooks

| Export | Signature | Description |
|--------|-----------|-------------|
| `useEnter` | `(options?: { delay?, enabled?, variant?: "fade" \| "slide-up" \| "scale", duration? }) => RefObject<HTMLDivElement>` | Applies enter animation to ref element on mount. |
| `useCountUp` | `(options: { target, duration?, enabled?, decimals?, easing? }) => number` | Animates a number from 0 to target using requestAnimationFrame. Easing: `"linear" | "ease-out-cubic" | "ease-out-expo"`. |
| `useStagger` | `(options: { count, interval?, enabled? }) => boolean[]` | Returns array of visibility flags, each becoming true with staggered delay. |
| `useScrollReveal` | `(options?: { threshold?, once?, rootMargin? }) => [RefObject, boolean]` | IntersectionObserver-based scroll reveal. Returns `[ref, isVisible]`. |
| `useDemoController` | `(options: { steps, loop?, onStepChange?, enableKeyboard?, enableSwipe? }) => DemoController` | Step-based navigation controller. Returns `{ currentStep, totalSteps, isFirst, isLast, next, prev, goTo, progress }`. |

## Types Re-exported from `@cue-vin/core`

`DemoCta` — re-exported for convenience when using `CtaOverlay`.

## Dependencies

- `@cue-vin/core` (workspace) — `StateMachine` (used by `useDemoController`), `PointerState` (used by `ScriptedPointer`), `DemoCta` (used by `CtaOverlay`).
