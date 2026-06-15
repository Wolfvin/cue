# showcase/saas — Taskly Demo

> Stress-test showcase for `generate()` from `@cue-vin/core` and `exportToHtml()` from `@cue-vin/player`, using a fictional SaaS project management product called **Taskly**.

## What This Demo Does

This showcase builds a 6-step product demo for "Taskly" — a SaaS project management tool — by combining two cue APIs:

1. **`generate()`** from `@cue-vin/core` — converts structured feature descriptions into a `DemoScript`
2. **`exportToHtml()`** from `@cue-vin/player` — converts a `DemoScript` into a self-contained HTML file

### Features Demonstrated (min 5)

| # | Feature | Hotspots | CTA | Duration |
|---|---------|----------|-----|----------|
| 1 | Create Project | 2 (New Project button, Template gallery) | — | 5000ms |
| 2 | Invite Team | 2 (Invite field, Role selector) | button "Send Invite" | manual |
| 3 | Assign Task | 2 (Task card, Assignee avatar) | — | 5000ms |
| 4 | Set Deadline | 2 (Calendar picker, Reminder toggle) | — | 5000ms |
| 5 | Dashboard Overview | 3 (Burndown chart, Completion rate, Team velocity) | — | 5000ms |
| 6 | Get Started | — | email_capture "Start free trial" | manual |

## Run

```bash
cd showcase/saas
npm install
npx tsx generate.ts
# Output: showcase/saas/index.html
```

## Result

- **`generate.ts`** — runs successfully with `tsx`
- **`index.html`** — generated (via manual fallback, see gap analysis below)
- Opening `index.html` in a browser loads the cue-player from the unpkg CDN, which renders the 6-step demo with hotspots, captions, and CTAs

---

## Gap Analysis

### What Works

#### `generate()` from `@cue-vin/core` — ✅ Works Well

| Aspect | Assessment |
|--------|-----------|
| Basic feature-to-step conversion | Each `GenerateFeature` reliably becomes a `DemoStep` with auto-generated slug id |
| Hotspot generation | Custom hotspots are correctly assigned with auto-generated ids (`{stepSlug}-hotspot-{index}`) |
| CTA handling | CTA steps correctly get `duration: undefined` (manual advance); non-CTA steps get `defaultDuration` |
| Caption enrichment | CTA info is appended to caption (`[Send Invite]`, `[Start free trial] ✉️`) |
| Theme propagation | Theme object (`accent`, `bg`, `font`) is passed through to the DemoScript |
| Validation | `validateDemoScript()` correctly validates the output |
| Zero dependencies | Pure heuristic generation — no LLM call, synchronous, fast |

#### `exportToHtml()` logic — ✅ Works (with caveats)

| Aspect | Assessment |
|--------|-----------|
| HTML structure | Clean, self-contained HTML with embedded DemoScript JSON |
| CDN loading | Default unpkg URL works; player loads and registers `<cue-embed>` |
| Theme rendering | `bg` and `font` correctly applied to body style |
| XSS prevention | `escapeHtml()` properly escapes user-provided strings |
| `playerJsInline` option | Falls back gracefully when `fs` unavailable (browser env) |

### What Fails / Is Missing

#### Critical: `@cue-vin/player` barrel export crashes in Node.js — ❌

**Error:** `HTMLElement is not defined`

The barrel `index.ts` imports `CueEmbed` from `./WebComponent` at the top level, which references `HTMLElement` (a browser-only global). When `@cue-vin/player` is imported in a Node.js script, the entire module fails to load — even though `exportToHtml()` itself is a pure string builder with zero browser dependencies.

**Impact:** Any Node.js CLI/pipeline that wants to call `exportToHtml()` cannot import from `@cue-vin/player`. This is a major gap for:
- CI/CD pipelines that generate demo HTML at build time
- Static site generators
- `tsx`/`ts-node` scripts
- The e2e example in this very repo works around it by importing from source directly (`../../packages/player/src/export`), but that's not viable for npm consumers

**Workaround:** We replicate `exportToHtml()` logic manually in `generate.ts` as a fallback.

**Suggested Fix:**

1. **Split the barrel export** — add a sub-path export for Node.js-safe utilities:
   ```jsonc
   // package.json exports
   "exports": {
     ".": { "import": "./dist/index.js", "require": "./dist/cue-player.iife.js" },
     "./export": { "import": "./dist/export.js", "require": "./dist/export.cjs" }
   }
   ```
   Then consumers can do `import { exportToHtml } from "@cue-vin/player/export"`.

2. **Lazy-load the WebComponent** — defer the `HTMLElement` reference behind a runtime check:
   ```typescript
   // Instead of top-level import:
   // import { CueEmbed } from "./WebComponent";
   // Use dynamic import inside initCue():
   export async function initCue() {
     const { CueEmbed } = await import("./WebComponent");
     if (!customElements.get("cue-embed")) customElements.define("cue-embed", CueEmbed);
   }
   ```

3. **Add `"node"` condition to exports** — serve a Node.js-safe entry that excludes browser code.

#### `generate()` — No Pointer Placement — ⚠️

`generate()` creates steps with hotspots but **never populates `DemoPointer`** on any step. The generated DemoScript has no cursor/pointer animation data, which means:

- The auto-playing demo in the player will advance steps but the scripted cursor won't move
- Consumers must manually add `pointer: { x, y }` to each step after generation
- There's no heuristic to position the pointer near hotspots or CTAs

**Suggested Fix:**

Add automatic pointer placement to `generate()`:
- If the step has hotspots, place the pointer at the first hotspot position
- If the step has a CTA, place the pointer at the center (0.5, 0.7)
- Allow override via `GenerateFeature.pointer?: { x, y }`

```typescript
// In generate(), after building the step:
if (feature.hotspots?.length) {
  step.pointer = { x: feature.hotspots[0].x, y: feature.hotspots[0].y };
} else if (feature.cta) {
  step.pointer = { x: 0.5, y: 0.7 };
}
```

#### `generate()` — No Annotation Support — ⚠️

The `GenerateFeature` type doesn't support `DemoAnnotation` (arrows, boxes, text callouts). The `DemoStep` type supports `annotations[]`, but there's no way to pass them through `generate()`.

**Suggested Fix:** Add optional `annotations` to `GenerateFeature`:
```typescript
interface GenerateFeature {
  // ... existing fields ...
  annotations?: GenerateAnnotation[];
}
interface GenerateAnnotation {
  type: "arrow" | "box" | "text";
  [key: string]: unknown;
}
```

#### `generate()` — CTA Data Embedded in Caption String — ⚠️

CTA information is appended to the `caption` string (`[Send Invite]`, `[Start free trial] ✉️`) instead of being set on `step.cta`. The `DemoStep.cta` field remains `undefined` even when the feature has a CTA.

This means:
- The player's `CtaOverlay` won't render any CTA buttons/inputs (it reads from `step.cta`)
- The CTA is only visible as text in the caption bar
- No interactive "Start free trial" email capture form will appear

**Suggested Fix:** Set `step.cta` from `feature.cta`:
```typescript
if (feature.cta) {
  step.cta = {
    type: feature.cta.type,
    label: feature.cta.label,
    href: feature.cta.href,
    // Use defaults for email_capture fields:
    ...(feature.cta.type === "email_capture" ? {
      placeholder: "Enter your email",
      submitLabel: feature.cta.label,
      successMessage: "Thanks! We'll be in touch.",
    } : {}),
  };
}
```

#### `generate()` — No Screenshot/Screen Support Without Manual Path — ⚠️

`generate()` accepts `screenshotPath` but doesn't generate any visual content. For a "generate from features" workflow, there's no:
- Placeholder/mock UI generation for steps without screenshots
- Automatic placeholder images or SVG wireframes
- CSS-based mock UI generation

**Suggested Enhancement:** Add a `placeholderScreen?: boolean` option to `GenerateOptions` that, when true, generates a simple SVG placeholder for steps without `screenshotPath`.

#### `exportToHtml()` — Font Escaping Too Aggressive — ⚠️ Minor

The `escapeHtml()` function HTML-escapes the font string, converting single quotes to `&#39;`. This results in:
```css
font-family: &#39;Inter&#39;, &#39;Segoe UI&#39;, system-ui, sans-serif;
```
While technically valid CSS (browsers decode HTML entities in inline styles), it's unusual and reduces readability. Since the font value comes from the developer's DemoScript (not user input), the escaping may be overly cautious here.

#### `exportToHtml()` — No Loop/AutoPlay Attributes on `<cue-embed>` — ⚠️

The generated `<cue-embed>` tag doesn't include `loop` or `autoplay` attributes even when the DemoScript has `loop: true`. The player component supports these as boolean attributes, but `exportToHtml()` doesn't map from the DemoScript to the HTML attributes.

**Suggested Fix:**
```typescript
const loopAttr = script.loop ? ' loop' : '';
const autoplayAttr = ' autoplay'; // always useful for standalone HTML
return `<cue-embed id="player" width="${width}" height="${height}"${loopAttr}${autoplayAttr}></cue-embed>`;
```

#### `@cue-vin/player` — `playerJsInline` Fails Silently — ⚠️

When `playerJsInline: true` is set in a non-Node environment, `readPlayerBundle()` catches the error, logs a warning, and returns an empty string. This results in an HTML file with an empty `<script>` tag, which will render a blank page in the browser. The failure should be louder — either throw or at minimum produce a visible error in the HTML.

---

## Summary Table

| API | Status | Key Issue |
|-----|--------|-----------|
| `generate()` | ✅ Works | No pointer placement, no annotations, CTA not set on step.cta |
| `validateDemoScript()` | ✅ Works | — |
| `exportToHtml()` (from npm) | ❌ Crashes in Node.js | Barrel export imports HTMLElement |
| `exportToHtml()` (logic) | ✅ Works | Font escaping, missing loop/autoplay attrs |
| `<cue-embed>` player | ✅ Works in browser | Requires CDN or inline JS |

## Priority Fixes for cue SDK

1. **Split `@cue-vin/player` exports** — Node.js-safe sub-path for `exportToHtml()` (blocks all CLI/SSG use)
2. **Set `step.cta` in `generate()`** — CTA overlay is invisible without it
3. **Auto-place pointer in `generate()`** — Demo feels lifeless without cursor movement
4. **Add annotation support to `GenerateFeature`** — arrows/boxes are core demo theater features
5. **Map `loop`/`autoplay` to `<cue-embed>` attributes in `exportToHtml()`**
