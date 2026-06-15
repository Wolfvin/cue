# showcase/ecommerce — ShopFlow Demo

> Demo standalone untuk produk e-commerce fiktif **ShopFlow** — platform jualan online untuk UMKM Indonesia. Dibangun dengan vanilla HTML/CSS/JS tanpa dependensi. Semua teks dalam Bahasa Indonesia.

## Alur Demo

6 langkah yang menunjukkan alur lengkap penjual online:

| Step | Fitur | Hotspot | Pointer | CTA | Durasi |
|------|-------|---------|---------|-----|--------|
| 1 | Dashboard Penjual | 4 (Pendapatan, Pesanan, Produk, Grafik) | (0.25, 0.42) | — | 6000ms |
| 2 | Tambah Produk Baru | 5 (Upload Foto, Nama, Harga, Kategori, Simpan) | (0.42, 0.50) | — | 6000ms |
| 3 | Atur Stok | 4 (Cari, Quick Edit, Peringatan, Update Massal) | (0.72, 0.52) | — | 6000ms |
| 4 | Proses Pesanan | 4 (Inbox, Detail, Status, Konfirmasi) | (0.60, 0.50) | — | 6000ms |
| 5 | Laporan Penjualan | 4 (Grafik, Filter, Terlaris, Export) | (0.50, 0.50) | — | 6000ms |
| 6 | CTA Mulai Gratis | 2 (Gratis, Support) | (0.50, 0.65) | email_capture | 5000ms |

## Cara Menjalankan

```bash
# Langsung buka di browser
open showcase/ecommerce/index.html
# atau
xdg-open showcase/ecommerce/index.html
```

Tidak perlu `npm install`, tidak perlu server. Buka file HTML langsung.

## File

| File | Fungsi |
|------|--------|
| `index.html` | Demo standalone — buka langsung di browser |
| `script.json` | DemoScript JSON sesuai schema `@cue-vin/core` |
| `README.md` | File ini — gap analysis |

---

## Fitur cue SDK yang Dipakai

### Skema DemoScript (`@cue-vin/core`) — ✅ Dipakai

Seluruh data demo distrukturkan mengikuti skema `DemoScript`:

- **`DemoScript`** — `id`, `title`, `steps[]`, `loop`, `theme` dipakai persis sesuai spesifikasi
- **`DemoStep`** — `id`, `duration`, `pointer`, `hotspots`, `annotations`, `caption`, `cta` — semua field diisi lengkap
- **`DemoPointer`** — Koordinat fraksional (0–1) untuk posisi kursor, dikonversi ke piksel di JavaScript
- **`DemoHotspot`** — `id`, `x`, `y`, `label`, `alwaysShow` — dirender sebagai lingkaran berdenyut dengan label
- **`DemoAnnotation`** — `type: "text"` digunakan di step 1 (greeting) dan step 5 (stat labels)
- **`DemoCta`** — `type: "email_capture"` dengan `placeholder`, `submitLabel`, dan `successMessage` di step 6
- **`DemoTheme`** — `accent: "#f59e0b"`, `bg: "#0c0f1a"`, `font` — diterapkan ke CSS custom properties

### Sistem Koordinat Fraksional — ✅ Dipakai

Konversi `px = fraction * containerWidth` dari cue diterapkan untuk pointer dan hotspots, memastikan resolusi independence.

### Perbaikan SDK Terbaru yang Terkonfirmasi

Showcase ini memverifikasi bahwa fix dari commit `a1a9d9d` sudah bekerja di level skema:

- **BUG 2 FIX (step.cta)**: `script.json` step 6 kini punya `cta` dengan `type: "email_capture"`, bukan cuma teks di caption. Data terstruktur ini bisa langsung dipakai oleh `CtaOverlay`.
- **BUG 3 FIX (pointer)**: Setiap step punya `pointer` dengan koordinat fraksional — auto-placement dari `generate()` sekarang mengisi field ini.
- **BUG 4 FIX (loop/autoplay)**: `script.json` punya `loop: true`, dan `exportToHtml()` sekarang meneruskannya ke `<cue-embed loop autoplay>`.

---

## Fitur cue SDK yang TIDAK Bisa Dipakai (Gap)

### 1. `@cue-vin/player` Web Component — ❌ Tetap Tidak Terpakai

Meskipun BUG 1 (crash Node.js) sudah diperbaiki dengan dynamic import, `<cue-embed>` tetap tidak bisa dipakai karena:

- **Tidak bisa render mock UI kustom**: Player hanya menampilkan screenshot (`screen` field) sebagai background slide. Untuk ShopFlow, kami butuh dashboard sidebar, tabel stok, form produk, inbox pesanan — semua harus dirender sebagai HTML/CSS nyata, bukan gambar statis.
- **CTA overlay**: Meskipun `step.cta` sekarang terisi, `CtaOverlay` di player hanya menampilkan button/form sederhana. Untuk CTA yang lebih kaya (benefit cards + email form seperti di step 6), kami perlu kontrol penuh atas HTML.
- **Hotspot rendering**: Hotspot di player muncul sebagai overlay di atas screenshot. Di showcase ini, hotspot diposisikan relatif terhadap elemen UI nyata (tabel, form, chart), bukan gambar.

**Saran perbaikan**: Tambahkan mode "headless" di player yang hanya menyediakan navigasi (prev/next/auto-advance) + pointer + hotspot overlay, sementara konten visual (HTML) disediakan oleh consumer. Mirip dengan apa yang kami bangun manual di `index.html`, tapi sebagai library resmi.

### 2. `generate()` — ❌ Tidak Dipakai

`generate()` dari `@cue-vin/core` sudah diperbaiki (CTA, pointer, exportToHtml attrs), tapi tetap tidak cocok karena:

- **Tidak menghasilkan konten visual**: `generate()` hanya membuat metadata (caption, pointer, hotspots). Untuk demo e-commerce dengan dashboard sidebar, tabel stok, form upload foto, inbox pesanan, dan grafik revenue, kami perlu HTML/CSS yang realistis — bukan hanya metadata.
- **Tidak ada template UI per step**: Tidak ada cara mendeklarasikan "step ini pakai layout dashboard dengan sidebar" atau "step ini pakai layout form 2 kolom" lalu memiliki template bawaan.
- **Tidak ada data mock otomatis**: `generate()` tidak bisa mengisi data dummy (nama produk, harga, stok, pesanan) yang dibutuhkan untuk mock UI yang credible.

**Saran perbaikan**:
1. Tambahkan field `layout` di `GenerateFeature` yang map ke template UI bawaan:
   ```typescript
   interface GenerateFeature {
     // ...existing fields...
     layout?: "dashboard" | "form" | "table" | "inbox" | "chart" | "cta";
     layoutData?: Record<string, unknown>; // data spesifik untuk template
   }
   ```
2. Buat package `@cue-vin/templates` yang menyediakan template HTML+CSS per layout type.
3. Tambahkan field `mockData` di `GenerateFeature` untuk data dummy otomatis.

### 3. Tidak Ada Komponen Mock UI untuk E-Commerce — ❌

`@cue-vin/react` punya `AppWindow`, `FilePickerOverlay`, `ExcelPopup`, tapi tidak ada:

- **Sidebar navigasi** (komponen paling dasar untuk dashboard)
- **Stat card** (card dengan label, value, change indicator)
- **Tabel data** (dengan header, row, badge status, aksi button)
- **Form builder** (input field, dropdown, upload zone)
- **Inbox/list panel** (split view: list + detail)
- **Chart placeholder** (bar chart, line chart dari data array)

**Saran**: Buat `@cue-vin/mocks` — library komponen mock UI yang bisa diparameterisasi dari data DemoScript. Bisa untuk React dan vanilla JS (IIFE bundle).

### 4. Tidak Ada Annotation Rendering Spesifik — ⚠️

`DemoAnnotation` tetap punya `[key: string]: unknown` — tidak ada schema konkret untuk tipe annotation. Di showcase ini, annotation `type: "text"` di script.json tidak dirender secara visual karena tidak jelas properti apa yang harus ditampilkan (fontSize? color? position?).

**Saran**: Definisikan interface konkret:
```typescript
interface TextAnnotation extends DemoAnnotation {
  type: "text";
  x: number; y: number;
  text: string;
  fontSize?: number; color?: string; fontWeight?: string;
}
interface BoxAnnotation extends DemoAnnotation {
  type: "box";
  x: number; y: number; width: number; height: number;
  color?: string; strokeWidth?: number; cornerRadius?: number; label?: string;
}
interface ArrowAnnotation extends DemoAnnotation {
  type: "arrow";
  x1: number; y1: number; x2: number; y2: number;
  color?: string; label?: string;
}
```

### 5. Timeline + Pointer Tidak Tersedia sebagai IIFE — ⚠️

`Timeline` dan `Pointer` dari `@cue-vin/core` hanya tersedia sebagai ES module. Untuk standalone HTML tanpa bundler, kami harus implementasi auto-advance timer sendiri (`setTimeout`) dan pointer movement sendiri (CSS transitions).

**Saran**: Sediakan bundle IIFE untuk `@cue-vin/core` (minimal Timeline + Pointer) yang bisa diload via `<script src>`.

### 6. DemoScript Tidak Mendukung Layout/HTML per Step — ⚠️

`DemoStep` punya `screen` (URL gambar) tapi tidak punya field untuk HTML content. Jika player mendukung rendering HTML per step (misalnya via Shadow DOM slot), maka DemoScript bisa menyertakan HTML string per step dan player bisa merendernya langsung.

**Saran**: Tambahkan field opsional di `DemoStep`:
```typescript
interface DemoStep {
  // ...existing fields...
  html?: string; // HTML content to render instead of screen image
}
```

---

## Ringkasan

| Fitur cue | Dipakai? | Catatan |
|-----------|----------|---------|
| `DemoScript` schema | ✅ Ya | Semua data mengikuti skema resmi |
| `DemoStep` lengkap | ✅ Ya | pointer, hotspots, annotations, caption, cta |
| Koordinat fraksional | ✅ Ya | Dikonversi 0–1 ke piksel |
| `DemoTheme` | ✅ Ya | Amber accent (#f59e0b), dark bg |
| `DemoCta` (email_capture) | ✅ Ya | Dengan placeholder, submitLabel, successMessage |
| Fix step.cta | ✅ Terkonfirmasi | script.json punya cta terstruktur |
| Fix pointer auto-place | ✅ Terkonfirmasi | Semua step punya pointer |
| Fix exportToHtml attrs | ✅ Terkonfirmasi | loop: true tercatat |
| `@cue-vin/player` | ❌ Tidak | Tidak bisa render mock UI kustom |
| `generate()` | ❌ Tidak | Hanya metadata, tidak ada layout/data mock |
| Template UI e-commerce | ❌ Tidak ada | Tidak ada komponen mock bawaan |
| Annotation rendering | ⚠️ Partial | Schema terlalu longgar |
| Timeline/Pointer IIFE | ❌ Tidak | Hanya ESM, butuh bundler |

## Prioritas Perbaikan untuk cue SDK

1. **Mode headless di `@cue-vin/player`** — navigasi + pointer + hotspot saja, tanpa screenshot rendering, biar consumer bisa supply HTML sendiri
2. **Field `layout` + `layoutData` di `GenerateFeature`** — map ke template UI bawaan (dashboard, form, table, inbox, chart)
3. **Package `@cue-vin/mocks`** — komponen mock UI yang bisa diparameterisasi (React + IIFE)
4. **Annotation schema konkret** — typed interfaces untuk arrow, box, text
5. **Field `html` di `DemoStep`** — izinkan HTML content per step, bukan hanya screen URL
6. **IIFE bundle untuk `@cue-vin/core`** — Timeline + Pointer tanpa bundler
