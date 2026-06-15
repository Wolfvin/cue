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
├─ "Punya screenshot file?" → Recipe 4 (Screenshot-Based Demo) — gunakan fileToDataUrl + screenshotToStep
├─ "Mau embed di HTML / landing page?" → Recipe 5 (Embeddable Player) — gunakan initCue + <cue-embed>
├─ "Perlu track analytics?" → Recipe 6 (Analytics Tracking) — gunakan CueAnalytics
├─ "Capture app nyata jadi DemoScript?" → Recipe 7 (Record Browser Session) — gunakan cue-record CLI
├─ "Generate demo dari deskripsi fitur?" → Recipe 8 (Generate DemoScript) — gunakan generate()
├─ "Self-hosted analytics server?" → Recipe 9 (Analytics Server) — gunakan cue-analytics
├─ "Konten untuk IG/TikTok/Reels?" → Recipe 10 (Promo Canvas) — gunakan IIFE + aspect-ratio container
└─ "Gabungan" → Combine sesuai kebutuhan
```

## Quick Start for AI Agents

Pilih jalur berdasarkan kebutuhan:

### Path A: Zero-Install (IIFE) — **Recommended untuk demo cepat**

**Gunakan ketika:** Kamu butuh demo yang jalan di satu HTML file tanpa npm, tanpa build step, tanpa React. Cocok untuk one-file demo, email embed, landing page embed, atau promo canvas.

**Cara kerja:** Load `cue-player.iife.js` via `<script>` tag, definisikan DemoScript di `window.__CUE_SCRIPT__`, lalu render `<cue-embed>` custom element.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>cue Demo — Zero Install</title>
</head>
<body style="margin:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;min-height:100vh">

  <!-- 1. Load the IIFE player -->
  <script src="https://unpkg.com/@cue-vin/player@latest/dist/cue-player.iife.js"></script>

  <!-- 2. Define your DemoScript -->
  <script>
    window.__CUE_SCRIPT__ = {
      id: "my-demo",
      title: "My Product Demo",
      steps: [
        {
          id: "welcome",
          caption: "Welcome to our product",
          duration: 4000,
          pointer: { x: 0.5, y: 0.4 }
        },
        {
          id: "feature",
          caption: "Key feature highlighted here",
          duration: 4000,
          pointer: { x: 0.6, y: 0.5 },
          hotspots: [
            { id: "h1", x: 0.6, y: 0.5, label: "Feature", alwaysShow: true }
          ]
        },
        {
          id: "cta",
          caption: "Get started today",
          cta: { type: "button", label: "Try Now", href: "#" }
        }
      ],
      loop: true,
      theme: { accent: "#3b82f6", bg: "#0a0a0a" }
    };
  </script>

  <!-- 3. Place the custom element -->
  <cue-embed></cue-embed>

</body>
</html>
```

**Keuntungan:**
- Zero npm install — hanya satu HTML file
- `window.Cue` global tersedia untuk programmatic control
- `<cue-embed>` auto-renders dari `window.__CUE_SCRIPT__`
- Bisa di-host di GitHub Pages, S3, atau mana saja

**Juga tersedia — cue-utils.iife.js (2.6 kB):**
Jika kamu hanya butuh `Timeline` + `Pointer` tanpa full player:
```html
<script src="https://unpkg.com/@cue-vin/player@latest/dist/cue-utils.iife.js"></script>
<script>
  const { Timeline, Pointer } = window.CueUtils;
  const tl = new Timeline({ loop: true });
  tl.add(0, () => renderStep(0));
  tl.add(3000, () => renderStep(1));
  tl.play();
</script>
```

### Path B: Full SDK (React) — **Untuk integrasi dalam Next.js app**

**Gunakan ketika:** Kamu membangun Next.js app dan perlu komponen React (`DemoTheater`, `ScriptedPointer`, `AppWindow`, hooks, dll).

**Cara kerja:** Install packages via npm/pnpm, import React components dan core classes.

```bash
pnpm add @cue-vin/core @cue-vin/react @cue-vin/css
```

```tsx
"use client";
import { DemoTheater, ScriptedPointer } from "@cue-vin/react";
import { Pointer, Timeline, type PointerState } from "@cue-vin/core";
import "@cue-vin/css/cue.css";
// ... lihat Recipe 1 untuk contoh lengkap
```

**Keuntungan:**
- Full React component library (DemoTheater, AppWindow, hooks)
- Type-safe dengan TypeScript
- Tree-shakeable ES modules
- Integrasi seamless dengan Next.js App Router

## Recipe 1: Auto-Demo Theater (scroll-triggered, loops otomatis)

**Gunakan ketika:** User minta "product demo yang auto-play" atau "landing page dengan animated demo".

**Prinsip:** DemoTheater mengunci canvas ke fixed size, ScriptedPointer digerakkan oleh `Pointer` dari `@cue-vin/core`, StateMachine mengatur scene, Timeline mengatur timing.

```tsx
// page.tsx — Auto-Demo Theater
"use client";

import { useState, useEffect, useCallback } from "react";
import { DemoTheater, ScriptedPointer, AppWindow } from "@cue-vin/react";
import { Pointer, StateMachine, Timeline, type PointerState } from "@cue-vin/core";
import "@cue-vin/css/cue.css";

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
import { DemoTheater, AppWindow, FilePickerOverlay, ExcelPopup, type FileEntry } from "@cue-vin/react";
import { StateMachine } from "@cue-vin/core";
import type { ExcelCell } from "@cue-vin/react";
import "@cue-vin/css/cue.css";

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

**Prinsip:** Import `cue.css`, tambah class ke elemen yang ada. Tidak perlu install `@cue-vin/react` atau `@cue-vin/core`.

```html
<!-- index.html — CSS Primitives Only -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cue CSS Primitives Demo</title>
  <link rel="stylesheet" href="./node_modules/@cue-vin/css/src/cue.css">
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

import { useScrollReveal, useStagger } from "@cue-vin/react";
import "@cue-vin/css/cue.css";

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

### @cue-vin/core

```ts
import { Timeline, Pointer, StateMachine, ScrollTrigger } from "@cue-vin/core";

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

### @cue-vin/react

```tsx
import {
  DemoTheater, ScriptedPointer, AppWindow, FilePickerOverlay, ExcelPopup,
  useEnter, useCountUp, useStagger, useScrollReveal,
} from "@cue-vin/react";

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

### @cue-vin/css

```css
@import "@cue-vin/css/cue.css";

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

---

## Recipe 4: Screenshot-Based Demo (Supademo style)

**Gunakan ketika:** Agent punya screenshot file (PNG/JPG) dan ingin membuat step-by-step demo tanpa membuat UI mock dari nol. Cocok untuk "product tour dari screenshot".

**Prinsip:** Setiap screenshot jadi satu `DemoStep` dalam `DemoScript`. Hotspot dan caption ditambahkan di atas screenshot via `ScreenSlide` + `HotspotOverlay` + `AnnotationLayer`. Pointer bisa di-interpolate antar step.

```tsx
// page.tsx — Screenshot-Based Demo
"use client";

import { useState, useEffect } from "react";
import {
  DemoTheater, ScriptedPointer, ScreenSlide,
  HotspotOverlay, AnnotationLayer, StepProgress, ChapterNav,
  useDemoController,
} from "@cue-vin/react";
import {
  Pointer, type PointerState, type DemoScript,
  validateDemoScript, getDemoStep,
} from "@cue-vin/core";
import "@cue-vin/css/cue.css";

// ── Helper: convert File to data URL (browser-side) ──
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Helper: build a DemoStep from a screenshot ──
function screenshotToStep(params: {
  id: string;
  screenUrl: string;
  caption: string;
  hotspots?: { id: string; x: number; y: number; label: string; alwaysShow?: boolean }[];
  pointer?: { x: number; y: number; clicking?: boolean };
  duration?: number;
}) {
  return {
    id: params.id,
    screen: params.screenUrl,
    caption: params.caption,
    hotspots: params.hotspots?.map((h) => ({
      id: h.id,
      x: h.x,    // fraction 0–1 of slide width
      y: h.y,    // fraction 0–1 of slide height
      label: h.label,
      alwaysShow: h.alwaysShow,
    })),
    pointer: params.pointer,
    duration: params.duration,
  };
}

// ── Helper: interpolate pointer between two steps ──
function interpolatePointer(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number // 0–1
): { x: number; y: number } {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

// ── Demo Script (agent generates this) ──
const DEMO_SCRIPT: DemoScript = {
  id: "product-tour",
  title: "Product Tour — 3 Steps",
  steps: [
    screenshotToStep({
      id: "step-1",
      screenUrl: "/screenshots/dashboard.png", // or data: URL from fileToDataUrl
      caption: "Welcome to the dashboard. See your key metrics at a glance.",
      hotspots: [
        { id: "h1", x: 0.25, y: 0.3, label: "Revenue chart", alwaysShow: true },
        { id: "h2", x: 0.7, y: 0.4, label: "User activity" },
      ],
      pointer: { x: 0.25, y: 0.3, clicking: true },
      duration: 5000,
    }),
    screenshotToStep({
      id: "step-2",
      screenUrl: "/screenshots/upload.png",
      caption: "Upload your data files to get started with analysis.",
      hotspots: [
        { id: "h3", x: 0.5, y: 0.5, label: "Upload area", alwaysShow: true },
      ],
      pointer: { x: 0.5, y: 0.5 },
      duration: 5000,
    }),
    screenshotToStep({
      id: "step-3",
      screenUrl: "/screenshots/results.png",
      caption: "View analysis results with interactive charts and insights.",
      hotspots: [
        { id: "h4", x: 0.6, y: 0.35, label: "Key insight", alwaysShow: true },
      ],
      pointer: { x: 0.6, y: 0.35 },
    }),
  ],
  loop: true,
  theme: { accent: "#C91C1C", bg: "#0a0a0a" },
};

// Validate the script
if (!validateDemoScript(DEMO_SCRIPT)) {
  throw new Error("Invalid DemoScript structure");
}

const SLIDE_W = 840;
const SLIDE_H = 520;

export default function ScreenshotDemoPage() {
  const controller = useDemoController({
    steps: DEMO_SCRIPT.steps.length,
    loop: DEMO_SCRIPT.loop,
  });

  const step = getDemoStep(DEMO_SCRIPT, controller.currentStep);
  if (!step) return null;

  // Convert fraction-based pointer to pixel coords for ScriptedPointer
  const pointerPx: PointerState = step.pointer
    ? {
        x: step.pointer.x * SLIDE_W,
        y: step.pointer.y * SLIDE_H,
        clicking: step.pointer.clicking ?? false,
        transition: "500ms",
      }
    : { x: 0, y: 0, clicking: false, transition: "500ms" };

  // Convert fraction-based hotspots to px for HotspotOverlay
  const hotspotsPx = (step.hotspots ?? []).map((h) => ({
    id: h.id,
    x: h.x * SLIDE_W,
    y: h.y * SLIDE_H,
    label: h.label,
    alwaysShow: h.alwaysShow,
  }));

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <DemoTheater width={SLIDE_W + 40} height={SLIDE_H + 40} background="#0a0a0a">
        <ScreenSlide src={step.screen ?? ""} width={SLIDE_W} height={SLIDE_H}>
          <HotspotOverlay hotspots={hotspotsPx} containerWidth={SLIDE_W} containerHeight={SLIDE_H} />
          <AnnotationLayer
            annotations={step.annotations?.map((a) => ({
              ...a,
              type: a.type as "arrow" | "box" | "text",
            })) ?? []}
          />
          <ScriptedPointer state={pointerPx} />
        </ScreenSlide>
      </DemoTheater>

      {/* Caption */}
      <p style={{ color: "#f5f5f5", fontSize: 14, maxWidth: 600, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        {step.caption}
      </p>

      {/* Progress + Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <StepProgress current={controller.currentStep} total={controller.totalSteps} variant="dots" />
        <ChapterNav
          onPrev={controller.prev}
          onNext={controller.next}
          isPrevDisabled={controller.isFirst && !DEMO_SCRIPT.loop}
          isNextDisabled={controller.isLast && !DEMO_SCRIPT.loop}
          prevLabel="← Back"
          nextLabel="Next →"
        />
      </div>
    </div>
  );
}
```

## Recipe 5: Embeddable Demo Player (HowdyGo style)

**Gunakan ketika:** Agent generate DemoScript dan perlu embed di landing page — bisa di HTML biasa (web component) atau di React app.

### Cara A: Web Component via `<cue-embed>` (HTML snippet)

```html
<!-- index.html — Embed demo in any HTML page -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cue Embed Demo</title>
  <!-- Load cue player from CDN-style script -->
  <script type="module" src="https://cdn.cue.dev/player/cue-embed.js"></script>
</head>
<body style="margin: 0; background: #0a0a0a;">
  <div style="max-width: 900px; margin: 40px auto; padding: 0 24px;">
    <h1 style="color: #f5f5f5; font-family: 'DM Sans', sans-serif;">See it in action</h1>

    <!-- Embed the demo — point to a DemoScript JSON -->
    <cue-embed
      src="/demos/product-tour.json"
      width="840"
      height="520"
      loop
      autoplay
      accent="#C91C1C"
    ></cue-embed>

    <p style="color: #9ca3af; font-family: 'DM Sans', sans-serif; font-size: 14px; margin-top: 16px;">
      Click anywhere or use arrow keys to navigate.
    </p>
  </div>

  <!-- Or initialize programmatically -->
  <script type="module">
    // initCue is the programmatic entry point
    // import { initCue } from "https://cdn.cue.dev/player/cue-embed.js";

    // const player = initCue({
    //   container: document.getElementById("my-demo"),
    //   script: { id: "demo", title: "Tour", steps: [...] },
    //   loop: true,
    //   onStepChange: (step) => console.log("Step:", step),
    // });
    // player.play();
    // player.next();
    // player.destroy();
  </script>
</body>
</html>
```

### Cara B: React `<CuePlayer>` import

```tsx
// page.tsx — Embed demo in React/Next.js
"use client";

import { useRef, useState, useEffect } from "react";
import {
  DemoTheater, ScreenSlide, HotspotOverlay, AnnotationLayer,
  ScriptedPointer, StepProgress, ChapterNav, useDemoController,
} from "@cue-vin/react";
import { type DemoScript, type DemoStep, type PointerState, validateDemoScript, getDemoStep } from "@cue-vin/core";
import "@cue-vin/css/cue.css";

interface CuePlayerProps {
  /** DemoScript object or URL to fetch JSON from. */
  script: DemoScript | string;
  /** Whether the demo loops. Overrides script.loop if set. */
  loop?: boolean;
  /** Auto-play on mount. Default: false. */
  autoPlay?: boolean;
  /** Slide width. Default: 840. */
  width?: number;
  /** Slide height. Default: 520. */
  height?: number;
  /** Callback on step change. */
  onStepChange?: (index: number) => void;
}

export function CuePlayer({
  script: scriptProp,
  loop: loopOverride,
  autoPlay = false,
  width = 840,
  height = 520,
  onStepChange,
}: CuePlayerProps) {
  const [loadedScript, setLoadedScript] = useState<DemoScript | null>(
    typeof scriptProp !== "string" ? scriptProp : null
  );

  // Fetch script if URL provided
  useEffect(() => {
    if (typeof scriptProp !== "string") return;
    fetch(scriptProp)
      .then((r) => r.json())
      .then((data) => {
        if (validateDemoScript(data)) setLoadedScript(data);
        else console.error("Invalid DemoScript from URL:", scriptProp);
      });
  }, [scriptProp]);

  const script = loadedScript;
  if (!script) return <div style={{ color: "#9ca3af" }}>Loading demo...</div>;

  const loop = loopOverride ?? script.loop ?? false;
  // (In production, CuePlayer would be a full implementation — this is the pattern)
  return (
    <CuePlayerInner script={script} loop={loop} width={width} height={height} onStepChange={onStepChange} />
  );
}

function CuePlayerInner({ script, loop, width, height, onStepChange }: {
  script: DemoScript; loop: boolean; width: number; height: number; onStepChange?: (i: number) => void;
}) {
  const controller = useDemoController({ steps: script.steps.length, loop, onStepChange });
  const step = getDemoStep(script, controller.currentStep);
  if (!step) return null;

  const pointerPx: PointerState = step.pointer
    ? { x: step.pointer.x * width, y: step.pointer.y * height, clicking: step.pointer.clicking ?? false, transition: "500ms" }
    : { x: 0, y: 0, clicking: false, transition: "500ms" };

  const hotspotsPx = (step.hotspots ?? []).map((h) => ({
    id: h.id, x: h.x * width, y: h.y * height, label: h.label, alwaysShow: h.alwaysShow,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <DemoTheater width={width + 40} height={height + 40} background="#0a0a0a">
        <ScreenSlide src={step.screen ?? ""} width={width} height={height}>
          <HotspotOverlay hotspots={hotspotsPx} containerWidth={width} containerHeight={height} />
          <AnnotationLayer annotations={step.annotations?.map((a) => ({ ...a, type: a.type as "arrow" | "box" | "text" })) ?? []} />
          <ScriptedPointer state={pointerPx} />
        </ScreenSlide>
      </DemoTheater>
      <p style={{ color: "#f5f5f5", fontSize: 14, textAlign: "center", maxWidth: 600, fontFamily: "'DM Sans', sans-serif" }}>
        {step.caption}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <StepProgress current={controller.currentStep} total={controller.totalSteps} />
        <ChapterNav
          onPrev={controller.prev} onNext={controller.next}
          isPrevDisabled={controller.isFirst && !loop}
          isNextDisabled={controller.isLast && !loop}
        />
      </div>
    </div>
  );
}

// ── Usage: drop into any page ──
// import { CuePlayer } from "./CuePlayer";
// <CuePlayer script={demoScript} loop autoPlay width={840} height={520} />
```

## Recipe 6: Analytics Tracking

**Gunakan ketika:** Agent perlu track demo views, step completions, dan user interactions. Dua mode: POST ke endpoint, atau callback ke custom handler.

```ts
// lib/cue-analytics.ts — Analytics module (add to @cue-vin/core or use standalone)

/** Analytics event types emitted by the demo player. */
type CueEventType =
  | "demo_start"
  | "demo_complete"
  | "step_enter"
  | "step_exit"
  | "hotspot_click"
  | "pointer_click";

/** A single analytics event. */
interface CueEvent {
  type: CueEventType;
  demoId: string;
  stepIndex?: number;
  timestamp: number;
  meta?: Record<string, unknown>;
}

/** Summary of demo analytics after playback. */
interface CueSummary {
  demoId: string;
  totalSteps: number;
  stepsViewed: number;
  completionRate: number;   // 0–1
  duration: number;         // ms since first event
  events: CueEvent[];
}

/** Options for CueAnalytics. */
interface CueAnalyticsOptions {
  /** Demo identifier. */
  demoId: string;
  /** Mode A: POST events to this URL. */
  endpoint?: string;
  /** Mode B: callback fired for every event. */
  onEvent?: (event: CueEvent) => void;
  /** Total steps in the demo (for completion tracking). Default: 0. */
  totalSteps?: number;
}

/** Analytics tracker for cue demo playback. Supports POST endpoint or onEvent callback. */
class CueAnalytics {
  private demoId: string;
  private endpoint?: string;
  private onEvent?: (event: CueEvent) => void;
  private totalSteps: number;
  private events: CueEvent[] = [];
  private stepsSeen: Set<number> = new Set();
  private startTime = 0;

  constructor(options: CueAnalyticsOptions) {
    this.demoId = options.demoId;
    this.endpoint = options.endpoint;
    this.onEvent = options.onEvent;
    this.totalSteps = options.totalSteps ?? 0;
  }

  /** Record an analytics event. */
  track(type: CueEventType, stepIndex?: number, meta?: Record<string, unknown>): void {
    const event: CueEvent = {
      type,
      demoId: this.demoId,
      stepIndex,
      timestamp: Date.now(),
      meta,
    };

    if (this.events.length === 0) {
      this.startTime = event.timestamp;
    }

    this.events.push(event);

    // Track unique steps viewed
    if (stepIndex !== undefined) {
      this.stepsSeen.add(stepIndex);
    }

    // Dispatch
    this.onEvent?.(event);
    if (this.endpoint) {
      this.postEvent(event);
    }
  }

  /** Get a summary of all tracked analytics. */
  getSummary(): CueSummary {
    const duration = this.events.length > 0
      ? this.events[this.events.length - 1].timestamp - this.startTime
      : 0;

    return {
      demoId: this.demoId,
      totalSteps: this.totalSteps,
      stepsViewed: this.stepsSeen.size,
      completionRate: this.totalSteps > 0 ? this.stepsSeen.size / this.totalSteps : 0,
      duration,
      events: [...this.events],
    };
  }

  /** Reset all tracked data. */
  reset(): void {
    this.events = [];
    this.stepsSeen.clear();
    this.startTime = 0;
  }

  private postEvent(event: CueEvent): void {
    fetch(this.endpoint!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }).catch(() => {
      // Silently fail — analytics should never break the demo
    });
  }
}

export { CueAnalytics, type CueEvent, type CueEventType, type CueSummary, type CueAnalyticsOptions };
```

### Usage: Mode A — POST endpoint

```ts
const analytics = new CueAnalytics({
  demoId: "product-tour",
  endpoint: "https://api.example.com/cue/events",
  totalSteps: 3,
});

// Track demo lifecycle
analytics.track("demo_start");
analytics.track("step_enter", 0);
// ... user navigates ...
analytics.track("step_enter", 1);
analytics.track("hotspot_click", 1, { hotspotId: "h3" });
analytics.track("step_enter", 2);
analytics.track("demo_complete");

// Get summary after demo ends
const summary = analytics.getSummary();
console.log(summary);
// {
//   demoId: "product-tour",
//   totalSteps: 3,
//   stepsViewed: 3,
//   completionRate: 1,
//   duration: 15234,
//   events: [...]
// }
```

### Usage: Mode B — onEvent callback

```ts
const analytics = new CueAnalytics({
  demoId: "product-tour",
  totalSteps: 3,
  onEvent: (event) => {
    // Send to your own analytics provider
    if (event.type === "step_enter") {
      gtag("event", "demo_step_view", { demo_id: event.demoId, step: event.stepIndex });
    }
    if (event.type === "demo_complete") {
      gtag("event", "demo_completed", { demo_id: event.demoId });
    }
  },
});

analytics.track("demo_start");
analytics.track("step_enter", 0);
analytics.track("demo_complete");

const summary = analytics.getSummary();
// CueSummary format:
// {
//   demoId: string;
//   totalSteps: number;
//   stepsViewed: number;
//   completionRate: number;   // 0–1
//   duration: number;         // ms
//   events: CueEvent[];
// }
```

### Integration with React demo

```tsx
// Add analytics to any Recipe — example with Recipe 4
const analyticsRef = useRef<CueAnalytics | null>(null);

useEffect(() => {
  analyticsRef.current = new CueAnalytics({
    demoId: DEMO_SCRIPT.id,
    endpoint: "/api/cue/events",  // or use onEvent
    totalSteps: DEMO_SCRIPT.steps.length,
  });
  analyticsRef.current.track("demo_start");
  return () => {
    const summary = analyticsRef.current?.getSummary();
    console.log("Demo session summary:", summary);
  };
}, []);

// In onStepChange callback:
const handleStepChange = (stepIndex: number) => {
  analyticsRef.current?.track("step_enter", stepIndex);
};
```

---

## Recipe 7: Record Browser Session → DemoScript (cue-record CLI)

**Gunakan ketika:** Agent punya URL app yang bisa dibuka Playwright dan ingin capture real browser session menjadi DemoScript JSON dengan screenshot nyata. Cocok untuk "record app live → jadi demo".

**Prinsip:** `cue-record` CLI membaca file `actions.json` berisi array `CaptureAction`, menjalankan tiap action di Playwright headless browser, capture screenshot + pointer position + hotspot positions, lalu menghasilkan DemoScript JSON siap pakai.

### Step 1 — Buat actions.json

```json
[
  {
    "type": "navigate",
    "url": "https://my-app.example.com/dashboard",
    "caption": "Welcome to the dashboard"
  },
  {
    "type": "wait",
    "duration": 1500
  },
  {
    "type": "screenshot",
    "caption": "Dashboard overview — see your key metrics at a glance",
    "hotspots": [
      { "label": "Revenue chart", "selector": "#revenue-card", "alwaysShow": true },
      { "label": "User activity", "selector": "#activity-feed" }
    ]
  },
  {
    "type": "click",
    "selector": "button.upload-btn",
    "caption": "Click Upload to start adding your data files"
  },
  {
    "type": "screenshot",
    "caption": "Upload area — drag and drop or browse your files",
    "hotspots": [
      { "label": "Drop zone", "selector": ".drop-zone", "alwaysShow": true }
    ]
  },
  {
    "type": "type",
    "selector": "input.search-input",
    "text": "Q4 revenue report.xlsx",
    "caption": "Search and select your file"
  },
  {
    "type": "click",
    "selector": "button.analyze-btn",
    "caption": "Hit Analyze to process your data"
  },
  {
    "type": "screenshot",
    "caption": "Analysis results with interactive charts and insights",
    "duration": 6000,
    "hotspots": [
      { "label": "Key insight", "selector": ".insight-card", "alwaysShow": true }
    ]
  }
]
```

### Step 2 — Jalankan recorder

```bash
# Install Playwright browser (hanya sekali)
npx playwright install chromium

# Run recorder
npx cue-record --script actions.json --output demo.json --screenshots ./shots

# Dengan custom viewport
npx cue-record --script actions.json --output demo.json --screenshots ./shots --width 1440 --height 900
```

### Step 3 — Output

File `demo.json` berisi DemoScript yang valid dan bisa langsung di-feed ke CuePlayer:

```json
{
  "id": "demo-1700000000000",
  "title": "Recorded Demo",
  "steps": [
    {
      "id": "step-0",
      "screen": "shots/step-000.png",
      "pointer": { "x": 0.5, "y": 0.5, "clicking": false },
      "caption": "Welcome to the dashboard"
    },
    {
      "id": "step-1",
      "screen": "shots/step-001.png",
      "pointer": { "x": 0.5, "y": 0.5, "clicking": false },
      "caption": "Dashboard overview — see your key metrics at a glance",
      "hotspots": [
        { "id": "h-1-0", "x": 0.25, "y": 0.30, "label": "Revenue chart", "alwaysShow": true },
        { "id": "h-1-1", "x": 0.70, "y": 0.40, "label": "User activity" }
      ]
    },
    {
      "id": "step-2",
      "screen": "shots/step-002.png",
      "pointer": { "x": 0.45, "y": 0.55, "clicking": true },
      "caption": "Click Upload to start adding your data files"
    }
  ],
  "loop": false
}
```

**Kapan pakai:** Saat punya URL app yang bisa dibuka Playwright dan ingin demo dengan screenshot real — bukan mock UI. Output DemoScript bisa langsung dipakai Recipe 4 (Screenshot-Based Demo) atau Recipe 5 (Embeddable Player).

---

## Recipe 8: Generate DemoScript dari Deskripsi Fitur (generate())

**Gunakan ketika:** Agent ingin membuat demo dari deskripsi fitur tanpa screenshot real. Cocok untuk "describe fitur → auto-generate DemoScript siap pakai". Tidak memanggil LLM — pure heuristic/template based.

**Prinsip:** Fungsi `generate()` dari `@cue-vin/core` menerima structured input (id, title, array of features) dan menghasilkan valid DemoScript. Setiap feature jadi satu DemoStep. Steps dengan CTA tidak auto-advance (duration undefined), step tanpa CTA menggunakan `defaultDuration`.

```ts
// generate-demo.ts — Generate DemoScript from feature descriptions
import { generate, validateDemoScript } from "@cue-vin/core";
import { writeFileSync } from "node:fs";

const script = generate({
  id: "my-saas-demo",
  title: "My SaaS Product Demo",
  features: [
    {
      name: "Dashboard Overview",
      description: "See all your key metrics at a glance with real-time data.",
      screenshotPath: "/screenshots/dashboard.png",
      hotspots: [
        { label: "Revenue chart", x: 0.25, y: 0.3 },
        { label: "User activity", x: 0.7, y: 0.4 },
      ],
    },
    {
      name: "Upload Data",
      description: "Drag and drop your files to start analysis.",
      screenshotPath: "/screenshots/upload.png",
      hotspots: [
        { label: "Upload area", x: 0.5, y: 0.5 },
      ],
      cta: {
        type: "button",
        label: "Try Upload",
      },
    },
    {
      name: "View Results",
      description: "View analysis results with interactive charts and insights.",
      screenshotPath: "/screenshots/results.png",
      hotspots: [
        { label: "Key insight", x: 0.6, y: 0.35 },
      ],
    },
    {
      name: "Get Started",
      description: "Ready to transform your workflow?",
      cta: {
        type: "email_capture",
        label: "Start Free Trial",
      },
    },
  ],
  defaultDuration: 5000,
  theme: { accent: "#3b82f6", bg: "#0a0a0a" },
});

// Validate before saving
if (!validateDemoScript(script)) {
  throw new Error("Generated DemoScript is invalid");
}

// Save to file
writeFileSync("demo.json", JSON.stringify(script, null, 2), "utf-8");
console.log(`Generated demo: ${script.id} with ${script.steps.length} steps`);
```

### Output DemoScript (snippet)

```json
{
  "id": "my-saas-demo",
  "title": "My SaaS Product Demo",
  "steps": [
    {
      "id": "dashboard-overview",
      "caption": "See all your key metrics at a glance with real-time data.",
      "screen": "/screenshots/dashboard.png",
      "hotspots": [
        { "id": "dashboard-overview-hotspot-0", "x": 0.25, "y": 0.3, "label": "Revenue chart" },
        { "id": "dashboard-overview-hotspot-1", "x": 0.7, "y": 0.4, "label": "User activity" }
      ],
      "duration": 5000
    },
    {
      "id": "upload-data",
      "caption": "Drag and drop your files to start analysis.\n[Try Upload]",
      "screen": "/screenshots/upload.png",
      "hotspots": [
        { "id": "upload-data-hotspot-0", "x": 0.5, "y": 0.5, "label": "Upload area" }
      ],
      "duration": undefined
    }
  ],
  "loop": false,
  "theme": { "accent": "#3b82f6", "bg": "#0a0a0a" }
}
```

### Helper: slugify()

Fungsi `slugify()` diexport bersama `generate()` — berguna jika agent perlu generate step id sendiri:

```ts
import { slugify } from "@cue-vin/core";

slugify("Upload File");       // "upload-file"
slugify("API Integration");   // "api-integration"
slugify("2FA Login!");        // "2fa-login"
```

**Kapan pakai:** Saat tidak punya screenshot real atau URL app — generate demo sintetis dari deskripsi fitur. Bisa di-combine dengan Recipe 7 (Record) jika sebagian fitur punya screenshot dan sebagian tidak. Output DemoScript bisa langsung dipakai Recipe 4 atau Recipe 5.

---

## Recipe 9: Analytics Server — Track + Query (cue-analytics)

**Gunakan ketika:** Agent ingin tahu siapa nonton demo, sampai mana viewer melihat, dan hotspot mana yang diklik. Self-hosted analytics server — zero external dependencies, data disimpan lokal di NDJSON.

**Prinsip:** `cue-analytics` server menyediakan 3 endpoint: `POST /event` untuk menerima events dari CuePlayer, `GET /stats/:demoId` untuk query aggregate stats, dan `GET /health` untuk health check. Data disimpan append-only di NDJSON file.

### Start server

```bash
# Start dengan default port 3001
npx cue-analytics

# Custom port
npx cue-analytics --port 3001

# Custom data directory (default: ./data)
npx cue-analytics --port 3001 --data ./my-analytics-data
```

### POST events dari CuePlayer

CuePlayer sudah otomatis mengirim analytics events jika `analyticsEndpoint` di-set di player config. Jika tidak menggunakan CuePlayer, kirim event manual via curl:

```bash
# Demo start event
curl -X POST http://localhost:3001/event \
  -H "Content-Type: application/json" \
  -d '{
    "demoId": "my-saas-demo",
    "sessionId": "sess-abc123",
    "event": "start",
    "step": 0,
    "totalSteps": 4,
    "ts": 1700000000000
  }'

# Step enter event
curl -X POST http://localhost:3001/event \
  -H "Content-Type: application/json" \
  -d '{
    "demoId": "my-saas-demo",
    "sessionId": "sess-abc123",
    "event": "step_enter",
    "step": 1,
    "totalSteps": 4,
    "ts": 1700000005000
  }'

# Hotspot click event
curl -X POST http://localhost:3001/event \
  -H "Content-Type: application/json" \
  -d '{
    "demoId": "my-saas-demo",
    "sessionId": "sess-abc123",
    "event": "hotspot_click",
    "step": 1,
    "totalSteps": 4,
    "hotspotId": "upload-data-hotspot-0",
    "ts": 1700000007000
  }'

# Demo complete event
curl -X POST http://localhost:3001/event \
  -H "Content-Type: application/json" \
  -d '{
    "demoId": "my-saas-demo",
    "sessionId": "sess-abc123",
    "event": "complete",
    "step": 3,
    "totalSteps": 4,
    "ts": 1700000015000
  }'
```

### Query stats

```bash
# Get aggregate stats for a demo
curl http://localhost:3001/stats/my-saas-demo

# Health check
curl http://localhost:3001/health
```

### Response JSON + interpretasi

```json
{
  "demoId": "my-saas-demo",
  "totalViews": 42,
  "completionRate": 0.71,
  "avgStepsReached": 3.2,
  "stepDropoff": [42, 38, 35, 30],
  "hotspotClicks": {
    "upload-data-hotspot-0": 18,
    "dashboard-overview-hotspot-0": 12
  }
}
```

**Interpretasi untuk agent:**
- `totalViews: 42` → 42 unique sessions menonton demo ini
- `completionRate: 0.71` → 71% viewers menyelesaikan sampai akhir (event "complete")
- `avgStepsReached: 3.2` → rata-rata viewer sampai step 3 dari 4 total
- `stepDropoff: [42, 38, 35, 30]` → 42 viewers di step 0, 38 di step 1, 35 di step 2, 30 di step 3 — dropoff terbesar di step 0→1, mungkin perlu perbaikan caption atau CTA
- `hotspotClicks` → hotspot "upload-data-hotspot-0" diklik 18 kali, paling populer — area ini menarik perhatian viewer

**Kapan pakai:** Selalu — analytics gratis dan self-hosted. Setelah demo di-deploy, jalankan `cue-analytics` dan set `analyticsEndpoint` di CuePlayer. Review stats secara berkala untuk optimasi demo (caption, CTA placement, step ordering).

---

## Recipe 10: Square/Vertical Promo Canvas (IG, TikTok, Reels)

**Gunakan ketika:** User minta konten visual untuk social media — Instagram post (1080x1080), Reels/TikTok (1080x1920), atau Story (1080x1920). Cue sebagai "demo theater" SDK sangat natural untuk konten visual dengan aspect ratio 1:1 atau 9:16.

**Prinsip:** Gunakan Path A (IIFE) untuk zero-install, set DemoScript theme dan viewport, bungkus `<cue-embed>` dalam container dengan fixed aspect ratio menggunakan CSS `container-type: size` + `aspect-ratio`.

### Kapan pakai format ini

| Platform | Size | Aspect Ratio | Contoh Use Case |
|----------|------|--------------|-----------------|
| Instagram Post | 1080×1080 | 1:1 | Product showcase, feature highlight |
| Instagram Reels | 1080×1920 | 9:16 | App demo, step-by-step tutorial |
| TikTok | 1080×1920 | 9:16 | Product demo, walkthrough |
| IG Story | 1080×1920 | 9:16 | Promo, limited-time offer |
| YouTube Shorts | 1080×1920 | 9:16 | Quick tip, feature reveal |
| LinkedIn Post | 1200×1200 | 1:1 | Professional product demo |

### Contoh minimal: 1:1 Square Canvas (Instagram Post)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Promo Canvas — 1:1 Square</title>
  <style>
    /* Container locks the player to 1:1 aspect ratio */
    .promo-canvas {
      container-type: size;
      width: 100vw;
      max-width: 1080px;
      aspect-ratio: 1 / 1;
      margin: 0 auto;
      background: #0a0a0a;
    }
    cue-embed {
      display: block;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body style="margin:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;min-height:100vh">

  <div class="promo-canvas">
    <!-- Load IIFE player -->
    <script src="https://unpkg.com/@cue-vin/player@latest/dist/cue-player.iife.js"></script>

    <!-- Define DemoScript optimized for square canvas -->
    <script>
      window.__CUE_SCRIPT__ = {
        id: "promo-square",
        title: "Product Highlight",
        steps: [
          {
            id: "hook",
            caption: "Your problem → solved",
            duration: 3000,
            pointer: { x: 0.5, y: 0.3 },
            annotations: [
              { type: "text", x: 0.5, y: 0.15, text: "Tired of slow demos?", fontSize: 32, color: "#ffffff", fontWeight: "bold" }
            ]
          },
          {
            id: "feature",
            caption: "One-click setup, instant results",
            duration: 3000,
            pointer: { x: 0.5, y: 0.55 },
            hotspots: [
              { id: "h1", x: 0.5, y: 0.5, label: "One Click", alwaysShow: true }
            ]
          },
          {
            id: "cta",
            caption: "Start free today",
            cta: { type: "button", label: "Get Started", href: "#" }
          }
        ],
        loop: true,
        theme: { accent: "#3b82f6", bg: "#0a0a0a" }
      };
    </script>

    <cue-embed></cue-embed>
  </div>

</body>
</html>
```

### Contoh: 9:16 Vertical Canvas (Reels/TikTok)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Promo Canvas — 9:16 Vertical</title>
  <style>
    .promo-canvas {
      container-type: size;
      width: 100vw;
      max-width: 420px;  /* phone-width preview on desktop */
      aspect-ratio: 9 / 16;
      margin: 0 auto;
      background: #0a0a0a;
    }
    cue-embed {
      display: block;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body style="margin:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;min-height:100vh">

  <div class="promo-canvas">
    <script src="https://unpkg.com/@cue-vin/player@latest/dist/cue-player.iife.js"></script>

    <script>
      window.__CUE_SCRIPT__ = {
        id: "promo-vertical",
        title: "App Walkthrough",
        steps: [
          {
            id: "splash",
            caption: "Open the app",
            duration: 2500,
            pointer: { x: 0.5, y: 0.35 }
          },
          {
            id: "action",
            caption: "Tap to start",
            duration: 2500,
            pointer: { x: 0.5, y: 0.65 },
            hotspots: [
              { id: "h-tap", x: 0.5, y: 0.65, label: "Tap here", alwaysShow: true }
            ]
          },
          {
            id: "result",
            caption: "Instant results",
            duration: 2500,
            pointer: { x: 0.5, y: 0.5 }
          },
          {
            id: "download",
            caption: "Download now — it's free",
            cta: { type: "button", label: "Download App", href: "#" }
          }
        ],
        loop: true,
        theme: { accent: "#8b5cf6", bg: "#0f0f23" }
      };
    </script>

    <cue-embed></cue-embed>
  </div>

</body>
</html>
```

### Tips untuk Promo Canvas

1. **Step count:** 3–5 step optimal untuk attention span social media (under 15 detik total)
2. **Durasi:** 2500–3500ms per step — cukup lama untuk dibaca, cukup cepat untuk tidak boring
3. **Caption:** Pendek dan punchy — bukan paragraf, tapi tagline
4. **Pointer:** Gunakan untuk direct attention — gerak ke elemen kunci sebelum hotspot muncul
5. **CTA:** Selalu di step terakhir — jangan buat user scroll untuk menemukan action button
6. **Aspect ratio CSS:** Gunakan `container-type: size` + `aspect-ratio` untuk lock ratio tanpa JS
7. **Font size:** Untuk 1080px canvas, gunakan `fontSize: 24–36` pada annotations agar readable

### Export ke Video

Untuk mengubah promo canvas menjadi video file:

1. **Per-step PNG export:** Gunakan `exportToPng()` dari `@cue-vin/player` untuk capture setiap step sebagai PNG
2. **Combine dengan ffmpeg:** Gabungkan PNG frames menjadi video

```bash
# Export frames (jalankan di Node.js dengan puppeteer)
# Setiap step → step-0.png, step-1.png, dst.

# Combine menjadi 15fps video, 3 detik per frame
ffmpeg -framerate 1/3 -i step-%d.png -c:v libx264 -pix_fmt yuv420p -r 15 promo.mp4
```

**Note:** `exportToPng()` membutuhkan puppeteer (Node.js) — tidak bisa dijalankan di browser. Untuk browser-only export, gunakan screenshot per step secara manual atau integrasikan dengan html2canvas.

---

## Quick Reference — All Exports (Phase 1 + 2 + 3 + 4)

### @cue-vin/core

| Export | Kind | Phase | Description |
|--------|------|-------|-------------|
| `Timeline` | Class | 1 | setTimeout-based scheduler with loop and cleanup |
| `TimelineEntry` | Type | 1 | Timeline event entry |
| `TimelineOptions` | Type | 1 | Timeline constructor options |
| `Pointer` | Class | 1 | Scripted pointer with x/y/clicking state |
| `PointerState` | Type | 1 | Pointer position and click state |
| `PointerKeyframe` | Type | 1 | Single keyframe in pointer script |
| `PointerOptions` | Type | 1 | Pointer constructor options |
| `StateMachine` | Class | 1 | Scene-based state manager with loop |
| `Scene` | Type | 1 | Named scene with onEnter callback |
| `TransitionEvent` | Type | 1 | Transition event with from/to |
| `StateMachineOptions` | Type | 1 | StateMachine constructor options |
| `ScrollTrigger` | Class | 1 | IntersectionObserver wrapper with played-guard |
| `ScrollTriggerOptions` | Type | 1 | ScrollTrigger constructor options |
| `DemoScript` | Type | 2 | JSON-driven demo configuration |
| `DemoStep` | Type | 2 | Single step in a demo script |
| `DemoHotspot` | Type | 2 | Hotspot overlay on a demo step |
| `DemoAnnotation` | Type | 2 | Annotation overlay on a demo step |
| `DemoPointer` | Type | 2 | Pointer position in a demo step (fraction 0–1) |
| `DemoTheme` | Type | 2 | Visual theme for demo script |
| `validateDemoScript` | Fn | 2 | Validate unknown value as DemoScript |
| `getDemoStep` | Fn | 2 | Get DemoStep by index |
| `CueAnalytics` | Class | 3 | Analytics tracker (POST or onEvent) |
| `CueEvent` | Type | 3 | Single analytics event |
| `CueEventType` | Type | 3 | Event type union |
| `CueSummary` | Type | 3 | Analytics summary output |
| `CueAnalyticsOptions` | Type | 3 | CueAnalytics constructor options |
| `screenshotToStep` | Fn | 3 | Build DemoStep from screenshot params |
| `fileToDataUrl` | Fn | 3 | Convert File to data URL (browser) |
| `interpolatePointer` | Fn | 3 | Linear interpolation between two pointer positions |
| `generate` | Fn | 4 | Generate DemoScript from structured feature descriptions |
| `slugify` | Fn | 4 | Slugify text into kebab-case identifier |
| `GenerateOptions` | Type | 4 | Options for generate() function |

### @cue-vin/react

| Export | Kind | Phase | Description |
|--------|------|-------|-------------|
| `DemoTheater` | Component | 1 | Fixed-size artboard with responsive scale |
| `DemoTheaterProps` | Type | 1 | DemoTheater props |
| `ScriptedPointer` | Component | 1 | SVG cursor with CSS transition |
| `ScriptedPointerProps` | Type | 1 | ScriptedPointer props |
| `AppWindow` | Component | 1 | Mock app chrome (titlebar, sidebar, content) |
| `AppWindowProps` | Type | 1 | AppWindow props |
| `FilePickerOverlay` | Component | 1 | File picker mock with checkboxes |
| `FilePickerOverlayProps` | Type | 1 | FilePickerOverlay props |
| `FileEntry` | Type | 1 | Single file entry |
| `ExcelPopup` | Component | 1 | Spreadsheet popup mock |
| `ExcelPopupProps` | Type | 1 | ExcelPopup props |
| `ExcelCell` | Type | 1 | Single cell in spreadsheet |
| `useEnter` | Hook | 1 | Fade-in enter animation on mount |
| `UseEnterOptions` | Type | 1 | useEnter options |
| `useCountUp` | Hook | 1 | Animate number from 0 to target |
| `UseCountUpOptions` | Type | 1 | useCountUp options |
| `useStagger` | Hook | 1 | Staggered visibility flags |
| `UseStaggerOptions` | Type | 1 | useStagger options |
| `useScrollReveal` | Hook | 1 | IntersectionObserver-based reveal |
| `UseScrollRevealOptions` | Type | 1 | useScrollReveal options |
| `HotspotOverlay` | Component | 2 | Pulsing hotspot dots with tooltips |
| `HotspotOverlayProps` | Type | 2 | HotspotOverlay props |
| `Hotspot` | Type | 2 | Single hotspot definition |
| `AnnotationLayer` | Component | 2 | SVG overlay for arrows, boxes, text |
| `AnnotationLayerProps` | Type | 2 | AnnotationLayer props |
| `Annotation` | Type | 2 | Union type for all annotation variants |
| `AnnotationArrow` | Type | 2 | Arrow annotation |
| `AnnotationBox` | Type | 2 | Highlight box annotation |
| `AnnotationText` | Type | 2 | Text callout annotation |
| `ScreenSlide` | Component | 2 | Screenshot/image slide with overlay slot |
| `ScreenSlideProps` | Type | 2 | ScreenSlide props |
| `useDemoController` | Hook | 2 | Step-based demo navigation controller |
| `UseDemoControllerOptions` | Type | 2 | useDemoController options |
| `DemoController` | Type | 2 | Controller interface (next/prev/goTo/progress) |
| `StepProgress` | Component | 2 | Dots or bar progress indicator |
| `StepProgressProps` | Type | 2 | StepProgress props |
| `ChapterNav` | Component | 2 | Prev/Next navigation buttons |
| `ChapterNavProps` | Type | 2 | ChapterNav props |
| `CuePlayer` | Component | 3 | Full demo player (script-driven, embeddable) |
| `initCue` | Fn | 3 | Programmatic init for web component / non-React |

### @cue-vin/css

| Class/Variable | Kind | Phase | Description |
|----------------|------|-------|-------------|
| `--cue-ease-out` | Var | 1 | cubic-bezier(0.16, 1, 0.3, 1) |
| `--cue-ease-spring` | Var | 1 | cubic-bezier(0.34, 1.56, 0.64, 1) |
| `--cue-ease-in-out` | Var | 1 | cubic-bezier(0.83, 0, 0.17, 1) |
| `--cue-ease-bounce` | Var | 1 | cubic-bezier(0.68, -0.6, 0.32, 1.6) |
| `--cue-duration-fast` | Var | 1 | 150ms |
| `--cue-duration-normal` | Var | 1 | 300ms |
| `--cue-duration-slow` | Var | 1 | 500ms |
| `--cue-duration-glacial` | Var | 1 | 800ms |
| `--cue-color-accent` | Var | 1 | #3b82f6 |
| `--cue-color-glow` | Var | 1 | rgba(59, 130, 246, 0.4) |
| `.cue-enter` | Class | 1 | slide-up animation |
| `.cue-enter-fade` | Class | 1 | fade-in animation |
| `.cue-enter-scale` | Class | 1 | scale-in animation |
| `.cue-enter-slide-down` | Class | 1 | slide from top |
| `.cue-enter-slide-left` | Class | 1 | slide from right |
| `.cue-enter-slide-right` | Class | 1 | slide from left |
| `.cue-enter-bounce` | Class | 1 | bounce-in animation |
| `.cue-hover-lift` | Class | 1 | translateY(-4px) + shadow |
| `.cue-hover-scale` | Class | 1 | scale(1.05) |
| `.cue-hover-glow` | Class | 1 | blue glow shadow |
| `.cue-stagger-1`–`.cue-stagger-8` | Class | 1 | Animation delay 50ms–400ms |
| `.cue-spinner` | Class | 1 | Infinite spin |
| `.cue-glow` | Class | 1 | Pulse glow |
| `.cue-pulse` | Class | 1 | Opacity pulse |
| `.cue-shake` | Class | 1 | Shake animation |
| `.cue-hidden` | Class | 1 | opacity: 0, pointer-events: none |
| `.cue-visible` | Class | 1 | opacity: 1, pointer-events: auto |
