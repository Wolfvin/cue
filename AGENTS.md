# AGENTS.md — Panduan untuk AI Agent

## Kapan pakai cue

Pakai `cue` ketika:
- Kamu diminta "buat demo theater" atau "animasikan product demo"
- Kamu perlu scripted pointer yang bergerak otomatis di atas UI mock
- Kamu perlu auto-playing demo yang loop tanpa interaksi user
- Kamu perlu enter/exit animations tanpa menulis CSS/JS dari nol
- Kamu perlu mock UI (app window, file picker, spreadsheet) sebagai demo prop

JANGAN pakai `cue` ketika:
- Kamu butuh production UI components (pakai shadcn/ui, Radix, dll)
- Kamu butuh physics-based animation (pakai Framer Motion, react-spring)
- Kamu butuh 3D/WebGL animation (pakai Three.js, R3F)
- Target output bukan React/Next.js

## Quick Decision Tree

```
User minta apa?
├─ "Auto demo yang jalan sendiri" → Recipe 1 (Auto-Demo Theater)
├─ "Demo yang user bisa klik-klik" → Recipe 2 (Interactive Demo)
├─ "Animasi di section yang sudah ada" → Recipe 3 (CSS Primitives)
└─ "Gabungan" → Combine Recipe 1 + 3, atau 2 + 3
```

## Recipe 1: Auto-Demo Theater (scroll-triggered, loops otomatis)

**Gunakan ketika:** User minta "product demo yang auto-play" atau "landing page dengan animated demo".

**Prinsip:** DemoTheater mengunci canvas ke fixed size, ScriptedPointer digerakkan oleh `Pointer` dari `@cue/core`, StateMachine mengatur scene, Timeline mengatur timing.

```tsx
// page.tsx — Auto-Demo Theater
"use client";

import { useState, useEffect, useCallback } from "react";
import { DemoTheater, ScriptedPointer, AppWindow } from "@cue/react";
import { Pointer, StateMachine, Timeline, type PointerState } from "@cue/core";
import "@cue/css/cue.css";

const SCENES = [
  { id: "idle", label: "Dashboard" },
  { id: "upload", label: "Upload File" },
  { id: "analyze", label: "Analyze" },
  { id: "results", label: "Results" },
];

export default function AutoDemoPage() {
  const [pointerState, setPointerState] = useState<PointerState>({
    x: 160, y: 180, clicking: false, transition: "400ms",
  });
  const [sceneId, setSceneId] = useState("idle");

  useEffect(() => {
    const pointer = new Pointer({ startX: 160, startY: 180, onChange: setPointerState });
    const sm = new StateMachine({
      loop: true,
      onTransition: (e) => setSceneId(e.to),
    });
    sm.addScenes(SCENES.map((s) => ({ id: s.id })));

    const tl = new Timeline({ loop: true, loopDelay: 2000 });

    // Scene idle → upload
    tl.add(1000, () => sm.goTo("idle"));
    tl.add(1500, () => pointer.moveTo(300, 250, 600));
    tl.add(800, () => pointer.click());

    // Scene upload
    tl.add(1200, () => sm.goTo("upload"));
    tl.add(1000, () => pointer.moveTo(500, 300, 500));
    tl.add(600, () => pointer.click());

    // Scene analyze
    tl.add(1200, () => sm.goTo("analyze"));
    tl.add(1000, () => pointer.moveTo(700, 350, 400));
    tl.add(800, () => pointer.moveTo(400, 200, 500));

    // Scene results
    tl.add(1200, () => sm.goTo("results"));
    tl.add(1500, () => pointer.moveTo(160, 180, 600));

    tl.play();

    return () => {
      tl.dispose();
      pointer.dispose();
    };
  }, []);

  const sceneLabel = SCENES.find((s) => s.id === sceneId)?.label ?? "Dashboard";

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0f172a" }}>
      <DemoTheater width={960} height={540} background="#ffffff">
        <AppWindow
          title="demo-app — " + sceneLabel
          sidebar={
            <div style={{ fontSize: 13, color: "#6b7280", display: "flex", flexDirection: "column", gap: 8 }}>
              {SCENES.map((s) => (
                <div key={s.id} style={{
                  padding: "6px 10px",
                  borderRadius: 4,
                  background: s.id === sceneId ? "#dbeafe" : "transparent",
                  color: s.id === sceneId ? "#1d4ed8" : "#6b7280",
                  fontWeight: s.id === sceneId ? 600 : 400,
                  transition: "all 0.2s ease",
                }}>
                  {s.label}
                </div>
              ))}
            </div>
          }
        >
          <div style={{ padding: 20 }}>
            <h2 style={{ color: "#1e293b", fontSize: 20, marginBottom: 8 }}>{sceneLabel}</h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              {sceneId === "idle" && "Welcome to the dashboard. Your data at a glance."}
              {sceneId === "upload" && "Drag files here or click to browse."}
              {sceneId === "analyze" && "Processing your data..."}
              {sceneId === "results" && "Analysis complete. Here are your insights."}
            </p>
          </div>
        </AppWindow>
        <ScriptedPointer state={pointerState} />
      </DemoTheater>
    </div>
  );
}
```

## Recipe 2: Interactive Demo (user-driven)

**Gunakan ketika:** User minta "clickable demo" atau "interactive product walkthrough" di mana user mengontrol alur.

**Prinsip:** Tidak ada Timeline/Pointer otomatis. User klik tombol untuk advance scene. StateMachine tetap dipakai untuk track state, tapi transisi manual via `next()`.

```tsx
// page.tsx — Interactive Demo
"use client";

import { useState, useCallback } from "react";
import { DemoTheater, AppWindow, FilePickerOverlay, ExcelPopup, type FileEntry } from "@cue/react";
import { StateMachine } from "@cue/core";
import type { ExcelCell } from "@cue/react";
import "@cue/css/cue.css";

const FILES: FileEntry[] = [
  { id: "1", name: "sales-q4.csv", type: "spreadsheet" },
  { id: "2", name: "chart.png", type: "image" },
  { id: "3", name: "report.pdf", type: "doc" },
];

const SHEET_DATA: ExcelCell[][] = [
  [{ value: "Month" }, { value: "Revenue" }, { value: "Growth" }],
  [{ value: "Oct" }, { value: "$42K" }, { value: "+12%" }],
  [{ value: "Nov" }, { value: "$48K" }, { value: "+14%" }],
  [{ value: "Dec", selected: true }, { value: "$56K", selected: true }, { value: "+17%", selected: true }],
];

export default function InteractiveDemoPage() {
  const [step, setStep] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showSheet, setShowSheet] = useState(false);

  const nextStep = useCallback(() => {
    setStep((prev) => {
      const next = prev + 1;
      if (next === 1) setShowPicker(true);
      if (next === 2) { setShowPicker(false); setShowSheet(true); }
      return next;
    });
  }, []);

  const handleFileSelect = useCallback((ids: string[]) => {
    setSelectedFiles(ids);
    setShowPicker(false);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0f172a" }}>
      <DemoTheater width={960} height={540} background="#ffffff">
        <AppWindow
          title="interactive-demo.app"
          sidebar={
            <div style={{ fontSize: 13, color: "#6b7280", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>Steps</div>
              <div style={{ color: step >= 0 ? "#1d4ed8" : "#9ca3af" }}>1. Open file picker</div>
              <div style={{ color: step >= 1 ? "#1d4ed8" : "#9ca3af" }}>2. Select files</div>
              <div style={{ color: step >= 2 ? "#1d4ed8" : "#9ca3af" }}>3. View results</div>
            </div>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ color: "#1e293b", fontSize: 18 }}>Interactive Demo</h2>
            {step === 0 && (
              <button
                onClick={nextStep}
                style={{
                  padding: "10px 24px", background: "#3b82f6", color: "#fff",
                  border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14,
                }}
              >
                Open File Picker
              </button>
            )}
            {step === 1 && selectedFiles.length === 0 && (
              <p style={{ color: "#64748b", fontSize: 13 }}>Pick a file to continue...</p>
            )}
            {step >= 1 && selectedFiles.length > 0 && (
              <div>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>
                  Selected: {selectedFiles.join(", ")}
                </p>
                {step < 2 && (
                  <button
                    onClick={nextStep}
                    style={{
                      padding: "8px 20px", background: "#22c55e", color: "#fff",
                      border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13,
                    }}
                  >
                    Analyze
                  </button>
                )}
              </div>
            )}
            {step === 2 && <p style={{ color: "#22c55e", fontSize: 14, fontWeight: 600 }}>Analysis complete!</p>}
          </div>
          {showPicker && (
            <FilePickerOverlay files={FILES} onSelect={handleFileSelect} />
          )}
          {showSheet && (
            <ExcelPopup
              data={SHEET_DATA}
              title="Sales Analysis"
              style={{ top: 120, left: 300 }}
              footer={<span style={{ fontSize: 12, color: "#6b7280" }}>3 rows selected</span>}
            />
          )}
        </AppWindow>
      </DemoTheater>
    </div>
  );
}
```

## Recipe 3: CSS Primitives Only (masuk ke section yang sudah ada)

**Gunakan ketika:** User sudah punya halaman/section dan minta "tambah animasi" tanpa mengubah struktur React. Atau user minta "animate these elements on scroll" di project non-React.

**Prinsip:** Import `cue.css`, tambah class ke elemen yang ada. Tidak perlu install `@cue/react` atau `@cue/core`.

```html
<!-- index.html — CSS Primitives Only -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cue CSS Primitives Demo</title>
  <link rel="stylesheet" href="./node_modules/@cue/css/src/cue.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #0f172a; color: #e2e8f0; }
    .container { max-width: 800px; margin: 0 auto; padding: 80px 24px; }
    .card { padding: 24px; background: #1e293b; border-radius: 12px; border: 1px solid #334155; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px; }
    .badge { display: inline-block; padding: 4px 12px; background: #334155; border-radius: 6px; font-size: 13px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="cue-enter" style="margin-bottom: 24px;">
      <h1 style="font-size: 32px; margin: 0 0 8px;">CSS Primitives</h1>
      <p style="color: #94a3b8;">Zero JS. Just classes.</p>
    </div>

    <div class="cue-enter-scale cue-stagger-2 card" style="margin-bottom: 16px;">
      <h3 style="margin: 0 0 8px;">Scale In + Stagger 2</h3>
      <p style="color: #94a3b8; font-size: 14px;">This card scales in with a 100ms delay.</p>
    </div>

    <div class="grid">
      <div class="cue-enter cue-stagger-3 card cue-hover-lift">
        <span class="badge">.cue-enter</span>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 8px;">Slide up + hover lift</p>
      </div>
      <div class="cue-enter-fade cue-stagger-4 card cue-hover-lift">
        <span class="badge">.cue-enter-fade</span>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 8px;">Fade in + hover lift</p>
      </div>
      <div class="cue-enter-bounce cue-stagger-5 card cue-hover-scale">
        <span class="badge">.cue-enter-bounce</span>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 8px;">Bounce in + hover scale</p>
      </div>
    </div>

    <div style="margin-top: 32px; display: flex; gap: 12px;">
      <button class="cue-enter-slide-left cue-stagger-6" style="padding: 10px 24px; background: #3b82f6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
        Slide Left
      </button>
      <button class="cue-enter-slide-right cue-stagger-7 cue-hover-glow" style="padding: 10px 24px; background: transparent; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 6px; cursor: pointer; font-size: 14px;">
        Slide Right + Glow
      </button>
    </div>
  </div>
</body>
</html>
```

### React version (useScrollReveal + CSS classes)

```tsx
// ScrollRevealSection.tsx — Drop into existing React page
"use client";

import { useScrollReveal, useStagger } from "@cue/react";
import "@cue/css/cue.css";

const FEATURES = [
  { title: "Fast", desc: "Sub-100ms response time" },
  { title: "Secure", desc: "End-to-end encryption" },
  { title: "Scalable", desc: "Millions of requests" },
];

export function ScrollRevealSection() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.2 });
  const visible = useStagger({ count: FEATURES.length, interval: 120, enabled: isVisible });

  return (
    <section ref={ref} style={{ padding: "80px 24px", maxWidth: 800, margin: "0 auto" }}>
      <h2 className={isVisible ? "cue-enter" : "cue-hidden"} style={{ fontSize: 28, marginBottom: 32 }}>
        Features
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className={`cue-enter-scale cue-hover-lift ${visible[i] ? "" : "cue-hidden"}`}
            style={{
              padding: 24, background: "#f8fafc", borderRadius: 12,
              border: "1px solid #e2e8f0", transitionDelay: `${i * 120}ms`,
            }}
          >
            <h3 style={{ fontSize: 16, color: "#1e293b" }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: "#64748b" }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

## Koordinat System untuk ScriptedPointer

```
DemoTheater artboard:
┌──────────────────────────────────────┐
│ (0,0)                          (W,0) │
│                                      │
│   x → bertambah ke kanan             │
│   y → bertambah ke bawah             │
│                                      │
│ (0,H)                          (W,H) │
└──────────────────────────────────────┘

Default DemoTheater: W=1280, H=720

Region koordinat penting:
  AppWindow titlebar: y = 0..36
  Sidebar area:       x = 0..220, y = 36..720
  Content area:       x = 220..1280, y = 36..720
  Center content:     x ≈ 700, y ≈ 360

Tips posisi pointer:
  - "Klik tombol":    x ≈ 350..600, y ≈ 280..350
  - "Klik sidebar":   x ≈ 60..180, y ≈ 80..400
  - "Klik titlebar":  y ≈ 12..24, x ≈ 200..600
  - "Area bawah":     y ≈ 450..650
```

## Timing Cheat Sheet

```
| Teknik            | Kapan pakai                              | Precision | Cleanup        |
|-------------------|------------------------------------------|-----------|----------------|
| setTimeout        | Delayed one-shot (Timeline, Pointer)     | ~4ms      | clearTimeout   |
| requestAnimationFrame | Smooth number animations (useCountUp) | ~16ms     | cancelAnimationFrame |
| CSS transition    | Element position/opacity/transform       | Sub-frame | Remove class   |
| CSS animation     | Repeating or complex keyframed motion    | Sub-frame | Remove class   |
| ResizeObserver    | Responsive scaling (DemoTheater)         | Event     | disconnect()   |
| IntersectionObs   | Scroll-triggered reveals                 | Event     | disconnect()   |

Durasi standar:
  Fast:     150ms  — hover, micro-feedback
  Normal:   300ms  — enter animations, transitions
  Slow:     500ms  — scale-in, bounce, complex moves
  Glacial:  800ms  — full-page transitions, hero animations

Easing standar:
  --cue-ease-out:     cubic-bezier(0.16, 1, 0.3, 1)    ← default untuk hampir semua
  --cue-ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1) ← overshoot, bounce feel
  --cue-ease-bounce:  cubic-bezier(0.68, -0.6, 0.32, 1.6) ← extreme bounce
  --cue-ease-in-out:  cubic-bezier(0.83, 0, 0.17, 1)    ← smooth两端
```

## Pantangan (hal yang TIDAK boleh dilakukan)

1. **JANGAN** animasikan `width`/`height` — pakai `transform: scale()` atau `max-width`/`max-height` transition
2. **JANGAN** pakai `setInterval` untuk animasi — selalu `requestAnimationFrame` atau CSS
3. **JANGAN** lupa cleanup: `dispose()` untuk Timeline/Pointer, `disconnect()` untuk observer
4. **JANGAN** hardcode timing — pakai CSS custom properties dari `cue.css`
5. **JANGAN** pakai `!important` — cue classes di-design untuk bisa di-override
6. **JANGAN** mix Recipe 1 dan 2 dalam satu DemoTheater — pilih auto ATAU interactive
7. **JANGAN** set `pointer-events: auto` pada ScriptedPointer — itu overlay, bukan interactive element
8. **JANGAN** gunakan `useCountUp` untuk target < 10 — terlihat aneh, pakai fade-in saja
9. **JANGAN** pakai `cue-stagger` tanpa `cue-enter` — stagger hanya mengatur delay, bukan animasi
10. **JANGAN** lupa `will-change: transform` pada elemen yang animasi berat (tapi remove setelah selesai)

## Contoh Output Lengkap

### Recipe 1 Output: File `app/page.tsx`
→ Lihat kode lengkap di section Recipe 1 di atas. Copy-paste langsung ke Next.js App Router page.

### Recipe 2 Output: File `app/page.tsx`
→ Lihat kode lengkap di section Recipe 2 di atas. Copy-paste langsung ke Next.js App Router page.

### Recipe 3 Output: File HTML atau React component
→ Untuk HTML murni: copy dari Recipe 3 HTML version.
→ Untuk React: copy `ScrollRevealSection` component dan import ke page manapun.

---

## API Reference (Quick)

### @cue/core

```ts
import { Timeline, Pointer, StateMachine, ScrollTrigger } from "@cue/core";

// Timeline — chain setTimeout with cleanup
const tl = new Timeline({ loop: true, loopDelay: 2000, onComplete: () => {} });
tl.add(1000, () => console.log("1s"));
tl.add(500, () => console.log("1.5s"));
tl.play();   // start
tl.stop();   // pause
tl.reset();  // reset + stop
tl.dispose(); // cleanup

// Pointer — scripted cursor
const ptr = new Pointer({ startX: 100, startY: 100, onChange: (state) => {} });
ptr.moveTo(300, 200, 600);           // move with 600ms duration
ptr.click();                          // simulate click (150ms hold)
ptr.play([{ x: 300, y: 200 }, { x: 500, y: 300, click: true }]);
ptr.dispose();

// StateMachine — scene transitions
const sm = new StateMachine({ loop: true, onTransition: (e) => {} });
sm.addScenes([{ id: "idle" }, { id: "active" }, { id: "done" }]);
sm.start();    // → idle
sm.next();     // → active
sm.goTo("done");
sm.prev();     // → active
sm.reset();

// ScrollTrigger — IntersectionObserver
const st = new ScrollTrigger({ target: "#hero", threshold: 0.2, onEnter: () => {} });
st.observe();
st.disconnect();
st.reset();
```

### @cue/react

```tsx
import {
  DemoTheater, ScriptedPointer, AppWindow, FilePickerOverlay, ExcelPopup,
  useEnter, useCountUp, useStagger, useScrollReveal,
} from "@cue/react";

// DemoTheater — fixed-size artboard with responsive scale
<DemoTheater width={960} height={540} background="#fff">
  {children}
</DemoTheater>

// ScriptedPointer — SVG cursor
<ScriptedPointer state={pointerState} size={24} color="#1a1a1a" />

// AppWindow — mock app chrome
<AppWindow title="My App" sidebar={<nav />} sidebarWidth={220} showTitlebar>
  <main />
</AppWindow>

// FilePickerOverlay — file picker mock
<FilePickerOverlay files={[{ id: "1", name: "doc.pdf", type: "doc" }]} onSelect={(ids) => {}} multiple />

// ExcelPopup — spreadsheet mock
<ExcelPopup data={[[{ value: "A1" }, { value: "B1" }]]} title="Sheet1" />

// Hooks
const enterRef = useEnter({ delay: 200, variant: "slide-up", duration: 400 });
const count = useCountUp({ target: 1234, duration: 1500, easing: "ease-out-expo" });
const visible = useStagger({ count: 5, interval: 100 });
const [scrollRef, isVisible] = useScrollReveal({ threshold: 0.2, once: true });
```

### @cue/css

```css
@import "@cue/css/cue.css";

/* Enter animations — add to element on mount */
.cue-enter              /* slide-up */
.cue-enter-fade         /* fade-in */
.cue-enter-scale        /* scale-in */
.cue-enter-slide-down   /* slide from top */
.cue-enter-slide-left   /* slide from right */
.cue-enter-slide-right  /* slide from left */
.cue-enter-bounce       /* bounce-in */

/* Hover effects */
.cue-hover-lift   /* translateY(-4px) + shadow on hover */
.cue-hover-scale  /* scale(1.05) on hover */
.cue-hover-glow   /* blue glow on hover */

/* Stagger delays (pair with .cue-enter-*) */
.cue-stagger-1 through .cue-stagger-8

/* Effects */
.cue-spinner  /* infinite spin */
.cue-glow     /* pulse glow */
.cue-pulse    /* opacity pulse */
.cue-shake    /* shake animation */

/* Display */
.cue-hidden   /* opacity: 0, pointer-events: none */
.cue-visible  /* opacity: 1, pointer-events: auto */
```
