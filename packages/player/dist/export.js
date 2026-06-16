import { validateDemoScript as _ } from "@cue-vin/core";
const b = "https://unpkg.com/@cue-vin/player/dist/cue-player.iife.js", C = "https://unpkg.com/@cue-vin/player/dist/cue-utils.iife.js";
function v(t) {
  var a, o;
  if (t == null || typeof t != "object")
    throw new Error(
      "exportToHtml: script is required and must be a valid DemoScript"
    );
  const {
    script: e,
    title: i,
    playerJsInline: r = !1,
    cdnUrl: c = b,
    utilsJsInline: d = !1,
    utilsCdnUrl: u = C,
    width: p = 840,
    height: m = 520
  } = t;
  if (!_(e))
    throw new Error(
      "exportToHtml: script is required and must be a valid DemoScript"
    );
  const f = i ?? e.title ?? "cue demo", y = JSON.stringify(e), h = ((a = e.theme) == null ? void 0 : a.bg) ?? "#0a0a0a", w = ((o = e.theme) == null ? void 0 : o.font) ?? "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  let s;
  d ? s = `<script>
${U()}
<\/script>` : s = `<script src="${n(u)}"><\/script>`;
  let l;
  return r ? l = `<script>
${S()}
<\/script>` : l = `<script src="${n(c)}"><\/script>`, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${n(f)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    body {
      background: ${n(h)};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ${w};
    }
  </style>
</head>
<body>
  <cue-embed id="player" width="${p}" height="${m}" autoplay${e.loop ? " loop" : ""}></cue-embed>

  <script>window.__CUE_SCRIPT__ = ${y};<\/script>
  ${s}
  ${l}

  <script>
    if (window.Cue && typeof window.Cue.initCue === 'function') {
      window.Cue.initCue();
    }
    var player = document.getElementById('player');
    if (player && window.__CUE_SCRIPT__) {
      player.setAttribute('data', JSON.stringify(window.__CUE_SCRIPT__));
    }
  <\/script>
</body>
</html>`;
}
function n(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function U() {
  try {
    const t = require("fs"), e = require("path");
    let i;
    try {
      i = e.dirname(new URL(import.meta.url).pathname);
    } catch {
      i = __dirname;
    }
    const r = e.resolve(i, "cue-utils.iife.js");
    return t.readFileSync(r, "utf-8");
  } catch {
    return console.warn(
      "[cue] utilsJsInline requires a Node.js environment. Use utilsCdnUrl instead for browser builds."
    ), "";
  }
}
function S() {
  try {
    const t = require("fs"), e = require("path");
    let i;
    try {
      i = e.dirname(new URL(import.meta.url).pathname);
    } catch {
      i = __dirname;
    }
    const r = e.resolve(i, "cue-player.iife.js");
    return t.readFileSync(r, "utf-8");
  } catch {
    return console.warn(
      "[cue] playerJsInline requires a Node.js environment. Use cdnUrl instead for browser builds."
    ), "";
  }
}
export {
  v as e
};
