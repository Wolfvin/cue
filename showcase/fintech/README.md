# showcase/fintech — BankFlow Demo

> Standalone HTML demo untuk produk Fintech/Banking fiktif **BankFlow**. Demo ini menggunakan **fitur terbaru** dari cue SDK: `CueUtils` IIFE (Timeline + Pointer), `@cue-vin/templates` (5 template UI), `DemoStep.template` schema, dan annotation types terbaru (discriminated union).

## Alur Demo

6 langkah: **Login → Lihat Saldo → Transfer Dana → Konfirmasi → Notifikasi Sukses → CTA**

| Step | Fitur | Template | Annotations | Hotspots |
|------|-------|----------|-------------|----------|
| 1 | Login Aman | `login` | box | 4 |
| 2 | Lihat Saldo | `dashboard` | text | 3 |
| 3 | Transfer Dana | `form` | arrow | 4 |
| 4 | Konfirmasi Transfer | `table` | box | 3 |
| 5 | Notifikasi Sukses | `terminal` | text | 3 |
| 6 | Buka Akun (CTA) | `login` | — | 1 |

## Cara Menjalankan

```bash
# Dari root repo cue — build dulu jika belum:
cd packages/templates && npx tsup src/index.ts --format cjs,esm --dts --clean
cd ../player && pnpm run build:utils

# Lalu buka langsung di browser:
open showcase/fintech/index.html
```

Tidak perlu `npm install` di folder ini. Tidak perlu server.

## File

| File | Fungsi |
|------|--------|
| `index.html` | Demo standalone — menggunakan CueUtils IIFE + @cue-vin/templates ESM |
| `script.json` | DemoScript JSON dengan `DemoStep.template`, annotations, dan CTA |
| `README.md` | File ini — gap analysis |

---

## Fitur cue SDK yang Dipakai

### `CueUtils` IIFE (Timeline + Pointer) — ✅ Dipakai

Versi sebelumnya harus implementasi auto-advance timer (`setTimeout`) dan pointer movement (CSS transitions) manual. Sekarang menggunakan **resmi SDK API**:

- **`window.CueUtils.Pointer`** — Pointer bergerak via `moveTo()` dengan callback `onChange` yang meng-update posisi SVG cursor. Mendukung `click()` untuk simulasi klik.
- **`window.CueUtils.Timeline`** — Auto-advance timer via `tl.add(duration, callback)`. Mendukung `play()` dan `dispose()` untuk cleanup.
- **Bundle size**: 2.65 kB (minified), loaded via `<script src="../../packages/player/dist/cue-utils.iife.js">`

**Ini menutup gap #5 dari showcase fintech sebelumnya** (Timeline + Pointer tidak tersedia sebagai IIFE).

### `@cue-vin/templates` — ✅ Dipakai

Setiap step menggunakan template resmi dari `@cue-vin/templates`:

| Template | Step | Data |
|----------|------|------|
| `login` | Login (step 1), CTA (step 6) | brand, title, subtitle, fields[], submitLabel, footerLinks[] |
| `dashboard` | Lihat Saldo (step 2) | greeting, columns, metrics[] (label, value, change, icon) |
| `form` | Transfer (step 3) | title, description, fields[] (name, type, label, value, options), layout |
| `table` | Konfirmasi (step 4) | columns[], rows[] (cells, status), showRowNumbers |
| `terminal` | Notifikasi (step 5) | cwd, prompt, lines[] (text, type: command/output/success/error) |

Import via ESM: `import { renderTemplate } from "../../packages/templates/dist/index.mjs"`
Setiap template dipanggil: `renderTemplate({ type, ...data }, theme)`

**Ini menutup gap #3 dari showcase fintech sebelumnya** (tidak ada mock UI templates).

### `DemoStep.template` Schema — ✅ Dipakai

`script.json` menggunakan field `template` di setiap `DemoStep`:

```json
{
  "id": "secure-login",
  "template": { "type": "login", "data": { "brand": "BankFlow", ... } },
  "pointer": { "x": 0.50, "y": 0.62 },
  "hotspots": [...],
  "annotations": [...]
}
```

**Ini menutup gap #6 dari showcase fintech sebelumnya** (tidak ada field `html` atau `template` di DemoStep).

### Concrete Annotation Types — ✅ Dipakai

Menggunakan **3 annotation types baru** (discriminated union):

- **`BoxAnnotation`** — `type: "box"`, `x`, `y`, `width`, `height`, `color`, `cornerRadius`, `label`
- **`ArrowAnnotation`** — `type: "arrow"`, `x1`, `y1`, `x2`, `y2`, `color`, `label`
- **`TextAnnotation`** — `type: "text"`, `x`, `y`, `text`, `color`, `fontSize`, `align`

Rendered secara visual di HTML: box annotation sebagai border overlay, arrow sebagai garis+panah, text sebagai positioned label.

**Ini menutup gap #4 dari showcase fintech sebelumnya** (annotation schema terlalu longgar).

### Skema DemoScript Lengkap — ✅ Dipakai

- `DemoScript` — `id`, `title`, `steps[]`, `loop: true`, `theme`
- `DemoStep` — `id`, `duration`, `template`, `pointer`, `hotspots`, `annotations`, `caption`, `cta`
- `DemoPointer` — fractional coordinates (0–1)
- `DemoHotspot` — `id`, `x`, `y`, `label`, `alwaysShow`
- `DemoCta` — `type: "email_capture"` dengan `placeholder`, `submitLabel`, `successMessage`
- `DemoTheme` — `accent: "#2563EB"`, `bg: "#0a0f1a"`, `font`

### Node.js-Safe Player Export — ✅ Terverifikasi

`@cue-vin/player` sekarang punya sub-path `"./node"` yang aman untuk import di Node.js tanpa crash HTMLElement. Barrel export juga sudah menggunakan dynamic import untuk `CueEmbed`.

**Ini menutup gap #1 dari showcase fintech sebelumnya** (player crash di Node.js).

---

## Gap yang Masih Ada

### 1. Templates Tidak Ada di CDN — ⚠️

`@cue-vin/templates` belum dipublikasikan ke npm/CDN, jadi harus di-load via relative path ke `packages/templates/dist/index.mjs`. Ini berarti showcase hanya bisa jalan dari dalam repo, tidak standalone.

**Saran**: Publikasikan `@cue-vin/templates` ke npm dan sediakan CDN URL di unpkg.

### 2. Templates Tidak Support Custom Per-Step Styling — ⚠️

Template menghasilkan HTML yang sudah distyle, tapi tidak ada cara untuk menambahkan elemen kustom di atas template (misalnya: badge "GRATIS" di step konfirmasi, atau success icon animasi di step notifikasi). Semua konten harus sesuai dengan template schema.

**Saran**: Tambahkan field `extraHtml` di template config untuk injeksi HTML kustom.

### 3. Annotation Rendering Tidak Otomatis — ⚠️

SDK punya annotation types yang bagus, tapi **player/renderernya harus dibuat sendiri**. `@cue-vin/player` React component sudah render annotations, tapi untuk vanilla HTML demo, kita harus implementasi rendering sendiri (box borders, arrow lines, text labels).

**Saran**: Sediakan `renderAnnotations()` di `@cue-vin/templates` atau di CueUtils IIFE.

### 4. CueUtils IIFE Tidak Ada di CDN — ⚠️

`cue-utils.iife.js` harus di-load via relative path ke `packages/player/dist/`. Tidak ada CDN URL yang stabil.

**Saran**: Publikasikan `@cue-vin/player` versi terbaru ke npm, sehingga `https://unpkg.com/@cue-vin/player/dist/cue-utils.iife.js` bisa dipakai.

### 5. Tidak Ada Template "CTA" atau "Success" — ⚠️

Template yang tersedia: `login`, `dashboard`, `form`, `table`, `terminal`. Tidak ada template untuk:
- **CTA/success page** dengan benefit cards + email capture
- **Confirmation dialog** dengan action button
- **Chart/visualization** placeholder

Untuk step CTA, kami pakai template `login` yang kurang ideal (fields vs email capture CTA).

**Saran**: Tambahkan template types: `"cta"`, `"confirm"`, `"chart"`.

### 6. `generate()` Masih Tidak Menghasilkan `DemoStep.template` — ⚠️

`generate()` masih tidak punya field `layout` atau `template` di `GenerateFeature`, sehingga tidak bisa menghasilkan DemoScript yang menggunakan template.

**Saran**: Tambahkan field di `GenerateFeature`:
```typescript
interface GenerateFeature {
  // ...existing fields...
  layout?: "login" | "dashboard" | "form" | "table" | "terminal";
  layoutData?: Record<string, unknown>;
}
```

---

## Ringkasan: Perbaikan dari Showcase Sebelumnya

| Gap Sebelumnya | Status Sekarang | Solusi |
|----------------|-----------------|--------|
| Player crash di Node.js | ✅ Fixed | Dynamic import + `./node` sub-path |
| Tidak ada mock UI templates | ✅ Fixed | `@cue-vin/templates` (5 template types) |
| Tidak ada field template di DemoStep | ✅ Fixed | `DemoStep.template?: DemoTemplate` |
| Annotation schema terlalu longgar | ✅ Fixed | Discriminated union (Arrow/Box/Text) |
| Timeline/Pointer tidak ada IIFE | ✅ Fixed | `cue-utils.iife.js` (2.65 kB) |
| Font over-escaping di exportToHtml | ✅ Fixed | Font string dipakai langsung di CSS |

## Prioritas Perbaikan Selanjutnya

1. **Publikasikan `@cue-vin/templates` ke npm** — agar bisa di-load via CDN
2. **Tambahkan `renderAnnotations()` di CueUtils IIFE** — rendering otomatis untuk vanilla HTML
3. **Tambahkan template types: `cta`, `confirm`, `chart`**
4. **Field `layout` + `layoutData` di `GenerateFeature`** — agar `generate()` bisa menghasilkan DemoScript dengan template
5. **Field `extraHtml` di template config** — untuk injeksi konten kustom per step
