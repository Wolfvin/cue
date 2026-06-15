# Pipeline E2E Test

Automated test suite that validates the full pipeline: `generate()` → `DemoScript` → `exportToHtml()` → HTML output.

Covers the 5 bug fixes from PR #20:

| # | Test Case | Bug Fix Covered |
|---|-----------|-----------------|
| 1 | `generate()` with CTA — `step.cta` is not null | CTA propagation |
| 2 | `generate()` with hotspots — `step.pointer` auto-placed | Pointer auto-placement |
| 3 | `generate()` without hotspot/CTA — `step.pointer` undefined | Pointer not over-set |
| 4 | `exportToHtml()` — HTML contains `autoplay` attribute | autoplay attr |
| 5 | `exportToHtml()` with `loop=true` — HTML contains `loop` attribute | loop attr |
| 6 | `exportToHtml()` with `loop=false` — HTML does NOT contain `loop` attribute | loop attr (negative) |
| 7 | Font string — no `&#39;` escaped single quotes | Font escaping |

## Run

```bash
cd cue
pnpm install
tsx showcase/pipeline-test/run.ts
```

## Results

All 7 tests **PASS** on the current `main` branch. No bugs confirmed.

## Design

- Pure `tsx` + Node.js — no browser, no testing framework.
- Imports from package source via relative paths (workspace resolution, not npm).
- Each test prints `PASS` or `FAIL` with detail; exit code is 1 on any failure.
