#!/usr/bin/env node
/**
 * validate.js — Manifest ↔ CSS consistency validator for @cue-vin/css
 *
 * Checks:
 *   a. manifest.json is valid JSON (exit 1 if not)
 *   b. Extract all top-level cue-* class selectors from cue.css
 *   c. Every manifest key (skip $ prefix) must have a matching class in cue.css (exit 1 if orphan)
 *   d. Every cue-* class in cue.css should have a manifest entry (WARNING, not fail)
 *   e. No duplicate keys in manifest.json (manual parse — JSON.parse silently dedupes)
 *   f. cue.css parses without syntax errors via postcss (exit 1 on error with line number)
 *   g. Print summary
 *
 * Exit codes:
 *   0 — all hard checks passed (warnings may exist)
 *   1 — one or more hard checks failed
 *
 * Closes #117
 */

const fs = require('fs');
const path = require('path');

// --- Paths ---
const CSS_PATH = path.join(__dirname, '..', 'src', 'cue.css');
const MANIFEST_PATH = path.join(__dirname, '..', 'src', 'manifest.json');

// --- Colors (ANSI) ---
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let errors = 0;
let warnings = 0;

function err(msg) {
  console.error(`${RED}  ✗ ${msg}${RESET}`);
  errors++;
}
function warn(msg) {
  console.warn(`${YELLOW}  ⚠ ${msg}${RESET}`);
  warnings++;
}
function ok(msg) {
  console.log(`${GREEN}  ✓ ${msg}${RESET}`);
}
function info(msg) {
  console.log(`${DIM}  ${msg}${RESET}`);
}

// =========================================================================
// (a) Parse manifest.json — exit 1 if invalid JSON
// =========================================================================
function loadManifest() {
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (e) {
    err(`manifest.json is not valid JSON: ${e.message}`);
    console.error(`${RED}${BOLD}Cannot continue — manifest.json is unparseable.${RESET}`);
    process.exit(1);
  }
  ok('manifest.json is valid JSON');
  return { manifest, raw };
}

// =========================================================================
// (e) Check for duplicate keys in manifest.json
//     JSON.parse silently takes the last value for duplicate keys, so we
//     need to manually scan the raw text for duplicates.
// =========================================================================
function checkDuplicateKeys(raw) {
  // Simple approach: extract all top-level keys (lines matching "key": {)
  // Top-level keys are at the start of a line with 2-space indent
  const keyRegex = /^  "([^"]+)":\s*\{/gm;
  const keys = [];
  let match;
  while ((match = keyRegex.exec(raw)) !== null) {
    keys.push(match[1]);
  }

  const seen = new Set();
  const dupes = [];
  for (const key of keys) {
    if (seen.has(key)) {
      dupes.push(key);
    }
    seen.add(key);
  }

  if (dupes.length > 0) {
    for (const key of dupes) {
      err(`Duplicate key in manifest.json: "${key}"`);
    }
  } else {
    ok(`No duplicate keys in manifest.json (${keys.length} top-level keys)`);
  }
  return keys;
}

// =========================================================================
// (b) Extract all top-level cue-* class selectors from cue.css
//     Matches the FIRST class name on each selector line (before any space
//     that introduces a descendant or combinator). Handles comma-separated
//     selectors and attribute selectors.
// =========================================================================
function extractCssClasses(cssContent) {
  // Remove comments to avoid false positives
  const noComments = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');

  // For each line starting with `.`, extract the first class name(s)
  // before any space (which would indicate a descendant/combinator).
  // Handles comma-separated selectors on the same line.
  //
  // Examples we match:
  //   .cue-enter {                         → cue-enter
  //   .cue-enter,                          → cue-enter
  //   .cue-equalizer--3 > * {              → cue-equalizer--3 (compound with child)
  //   .cue-dropdown-reveal[data-status] .x → cue-dropdown-reveal (first class only)
  //
  // Examples we do NOT match:
  //   .cue-group:hover .cue-ambient        → cue-group IS matched (it's the selector head)
  //                                           cue-ambient is NOT matched (descendant)

  const classSet = new Set();
  const lines = noComments.split('\n');

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (!trimmed.startsWith('.')) continue;

    // Find the first space that's NOT inside brackets (for attribute selectors)
    let inBrackets = false;
    let firstSpaceIdx = -1;
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === '[') inBrackets = true;
      else if (ch === ']') inBrackets = false;
      else if (ch === ' ' && !inBrackets) {
        firstSpaceIdx = i;
        break;
      }
    }

    // The "selector head" is everything before the first space
    const head = firstSpaceIdx === -1 ? trimmed : trimmed.substring(0, firstSpaceIdx);

    // Split by comma to handle multi-selectors, then extract class name from each
    const parts = head.split(',');
    for (const part of parts) {
      const p = part.trim();
      if (!p.startsWith('.')) continue;
      const match = p.match(/^\.([a-zA-Z][a-zA-Z0-9_-]*)/);
      if (match) {
        const className = match[1];
        if (className.startsWith('cue-') || className.startsWith('fx-')) {
          classSet.add(className);
        }
      }
    }
  }

  return classSet;
}

// =========================================================================
// (f) Parse cue.css with postcss — exit 1 on syntax error
// =========================================================================
async function validateCssSyntax() {
  let postcss;
  try {
    postcss = require('postcss');
  } catch (e) {
    warn('postcss not installed — skipping CSS syntax validation. Run `pnpm install` in packages/css.');
    return false;
  }

  const css = fs.readFileSync(CSS_PATH, 'utf8');
  try {
    const result = postcss.parse(css, { from: CSS_PATH });
    ok(`cue.css parsed successfully (${result.nodes.length} top-level nodes)`);
    return true;
  } catch (e) {
    err(`cue.css syntax error: ${e.message}`);
    if (e.line) {
      const lines = css.split('\n');
      const lineNum = e.line;
      const start = Math.max(0, lineNum - 2);
      const end = Math.min(lines.length, lineNum + 1);
      console.error(`${RED}  Context (around line ${lineNum}):${RESET}`);
      for (let i = start; i < end; i++) {
        const marker = i + 1 === lineNum ? `${RED}>>>${RESET}` : '   ';
        console.error(`  ${marker} ${i + 1}: ${lines[i] || ''}`);
      }
    }
    return false;
  }
}

// =========================================================================
// Main
// =========================================================================
async function main() {
  console.log(`${BOLD}${CYAN}┌─────────────────────────────────────────────────┐${RESET}`);
  console.log(`${BOLD}${CYAN}│  @cue-vin/css — Manifest ↔ CSS Validator        │${RESET}`);
  console.log(`${BOLD}${CYAN}└─────────────────────────────────────────────────┘${RESET}`);
  console.log();

  // (a) Load manifest
  console.log(`${BOLD}(a) Manifest JSON parse${RESET}`);
  const { manifest, raw } = loadManifest();
  console.log();

  // (e) Duplicate keys
  console.log(`${BOLD}(e) Duplicate key check${RESET}`);
  const allKeys = checkDuplicateKeys(raw);
  console.log();

  // (b) Extract CSS classes
  console.log(`${BOLD}(b) CSS class extraction${RESET}`);
  const cssContent = fs.readFileSync(CSS_PATH, 'utf8');
  const cssClasses = extractCssClasses(cssContent);
  ok(`Extracted ${cssClasses.size} unique cue-*/fx-* class selectors from cue.css`);
  console.log();

  // (c) Manifest keys → CSS class check (orphan check)
  console.log(`${BOLD}(c) Manifest → CSS: orphan check${RESET}`);
  const manifestKeys = allKeys.filter(k => !k.startsWith('$'));
  const orphanManifest = [];

  for (const key of manifestKeys) {
    // The manifest key should match a CSS class.
    // Some manifest keys use BEM-style names with __ or -- which are
    // valid CSS class names.
    if (!cssClasses.has(key)) {
      orphanManifest.push(key);
    }
  }

  if (orphanManifest.length > 0) {
    err(`${orphanManifest.length} manifest entries have no matching class in cue.css:`);
    for (const key of orphanManifest) {
      console.error(`${RED}    • "${key}"${RESET}`);
    }
  } else {
    ok(`All ${manifestKeys.length} manifest entries have matching classes in cue.css`);
  }
  console.log();

  // (d) CSS classes → manifest check (missing manifest entries)
  console.log(`${BOLD}(d) CSS → Manifest: missing entry check${RESET}`);
  const manifestKeySet = new Set(manifestKeys);
  const missingManifest = [];

  for (const className of cssClasses) {
    if (!manifestKeySet.has(className)) {
      missingManifest.push(className);
    }
  }

  if (missingManifest.length > 0) {
    warn(`${missingManifest.length} CSS classes have no manifest entry (non-blocking):`);
    for (const className of missingManifest.sort()) {
      console.warn(`${YELLOW}    • .${className}${RESET}`);
    }
  } else {
    ok(`All ${cssClasses.size} CSS classes have manifest entries`);
  }
  console.log();

  // (f) CSS syntax validation
  console.log(`${BOLD}(f) CSS syntax validation (postcss)${RESET}`);
  await validateCssSyntax();
  console.log();

  // (g) Summary
  console.log(`${BOLD}${CYAN}┌─────────────────────────────────────────────────┐${RESET}`);
  console.log(`${BOLD}${CYAN}│  Summary                                        │${RESET}`);
  console.log(`${BOLD}${CYAN}└─────────────────────────────────────────────────┘${RESET}`);
  console.log(`  Manifest entries : ${manifestKeys.length}`);
  console.log(`  CSS classes      : ${cssClasses.size}`);
  console.log(`  Orphan manifest  : ${RED}${orphanManifest.length}${RESET}`);
  console.log(`  Missing manifest : ${YELLOW}${missingManifest.length}${RESET}`);
  console.log(`  Errors           : ${RED}${errors}${RESET}`);
  console.log(`  Warnings         : ${YELLOW}${warnings}${RESET}`);
  console.log();

  if (errors > 0) {
    console.error(`${RED}${BOLD}✗ VALIDATION FAILED — ${errors} error(s)${RESET}`);
    process.exit(1);
  } else {
    console.log(`${GREEN}${BOLD}✓ VALIDATION PASSED${RESET}`);
    if (warnings > 0) {
      console.log(`${YELLOW}  (${warnings} warning(s) — non-blocking)${RESET}`);
    }
    process.exit(0);
  }
}

main().catch(e => {
  console.error(`${RED}Unexpected error: ${e.message}${RESET}`);
  console.error(e.stack);
  process.exit(1);
});
