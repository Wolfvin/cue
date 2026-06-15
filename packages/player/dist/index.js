import { useState as k, useCallback as E, useRef as q, useEffect as S, createElement as I } from "react";
import X from "react-dom";
import { jsxs as g, jsx as o } from "react/jsx-runtime";
var _, v = X;
if (process.env.NODE_ENV === "production")
  _ = v.createRoot, v.hydrateRoot;
else {
  var F = v.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  _ = function(t, e) {
    F.usingClientEntryPoint = !0;
    try {
      return v.createRoot(t, e);
    } finally {
      F.usingClientEntryPoint = !1;
    }
  };
}
function M(t) {
  if (typeof t != "object" || t === null) return !1;
  const e = t;
  if (typeof e.id != "string" || typeof e.title != "string" || !Array.isArray(e.steps)) return !1;
  for (const r of e.steps)
    if (typeof r != "object" || r === null || typeof r.id != "string") return !1;
  if (e.loop !== void 0 && typeof e.loop != "boolean") return !1;
  if (e.theme !== void 0) {
    if (typeof e.theme != "object" || e.theme === null) return !1;
    const r = e.theme;
    if (r.accent !== void 0 && typeof r.accent != "string" || r.bg !== void 0 && typeof r.bg != "string" || r.font !== void 0 && typeof r.font != "string") return !1;
  }
  return !0;
}
function Y({
  state: t,
  size: e = 24,
  color: r = "#1a1a1a",
  className: n
}) {
  return /* @__PURE__ */ o(
    "div",
    {
      className: n,
      style: {
        position: "absolute",
        left: t.x,
        top: t.y,
        transitionProperty: "left, top",
        transitionDuration: t.transition,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-2px, -2px)",
        willChange: "left, top"
      },
      children: /* @__PURE__ */ o(
        "svg",
        {
          width: e,
          height: e,
          viewBox: "0 0 24 24",
          fill: t.clicking ? "#3b82f6" : r,
          style: {
            transition: "fill 0.1s ease",
            filter: t.clicking ? "drop-shadow(0 0 6px rgba(59,130,246,0.5))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          },
          children: /* @__PURE__ */ o("path", { d: "M5 2l14 10-6 2-2 6z" })
        }
      )
    }
  );
}
function G({
  hotspots: t,
  containerWidth: e,
  containerHeight: r
}) {
  const [n, l] = k(null), s = E((a) => l(a), []), u = E(() => l(null), []);
  return /* @__PURE__ */ o(
    "div",
    {
      style: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5e3
      },
      children: t.map((a) => /* @__PURE__ */ o(
        V,
        {
          hotspot: a,
          isHovered: n === a.id,
          onMouseEnter: s,
          onMouseLeave: u,
          containerWidth: e,
          containerHeight: r
        },
        a.id
      ))
    }
  );
}
var m = 12, x = 32;
function V({
  hotspot: t,
  isHovered: e,
  onMouseEnter: r,
  onMouseLeave: n,
  containerWidth: l,
  containerHeight: s
}) {
  const u = t.alwaysShow || e, a = 100, c = t.x > l - a, f = t.y > s - a, d = c ? -8 : m + 4, h = f ? -8 : m + 4, p = c ? "right" : "left", i = f ? "bottom" : "top";
  return /* @__PURE__ */ g(
    "div",
    {
      onMouseEnter: () => r(t.id),
      onMouseLeave: n,
      style: {
        position: "absolute",
        left: t.x - m / 2,
        top: t.y - m / 2,
        pointerEvents: "auto",
        cursor: "pointer"
      },
      children: [
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              left: m / 2 - x / 2,
              top: m / 2 - x / 2,
              width: x,
              height: x,
              borderRadius: "50%",
              background: "rgba(201, 28, 28, 0.3)",
              animation: "cue-hotspot-pulse 1.8s ease-out infinite"
            }
          }
        ),
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              width: m,
              height: m,
              borderRadius: "50%",
              background: "#C91C1C",
              border: "2px solid #fff",
              boxShadow: "0 0 0 1px rgba(201, 28, 28, 0.4)",
              position: "relative",
              zIndex: 1
            }
          }
        ),
        u && /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              left: d,
              top: h,
              whiteSpace: "nowrap",
              background: "#1a1a1a",
              color: "#f5f5f5",
              fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 12,
              lineHeight: 1.4,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #333",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              zIndex: 2,
              ...p === "right" ? { transform: "translateX(-100%)" } : {},
              ...i === "bottom" ? { transform: `translateY(-100%)${p === "right" ? " translateX(-100%)" : ""}` } : {}
            },
            children: t.label
          }
        ),
        /* @__PURE__ */ o("style", { children: `
        @keyframes cue-hotspot-pulse {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      ` })
      ]
    }
  );
}
function Z({ annotations: t }) {
  return /* @__PURE__ */ g(
    "svg",
    {
      style: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5e3
      },
      children: [
        /* @__PURE__ */ o("defs", { children: /* @__PURE__ */ o(
          "marker",
          {
            id: "cue-arrowhead",
            markerWidth: "8",
            markerHeight: "6",
            refX: "8",
            refY: "3",
            orient: "auto",
            children: /* @__PURE__ */ o("polygon", { points: "0 0, 8 3, 0 6", fill: "var(--cue-arrow-color, #3b82f6)" })
          }
        ) }),
        t.map((e, r) => {
          switch (e.type) {
            case "arrow":
              return /* @__PURE__ */ o(K, { annotation: e }, r);
            case "box":
              return /* @__PURE__ */ o(Q, { annotation: e }, r);
            case "text":
              return /* @__PURE__ */ o(ee, { annotation: e }, r);
            default:
              return null;
          }
        })
      ]
    }
  );
}
var P = "#3b82f6";
function K({ annotation: t }) {
  const e = t.color ?? P;
  return /* @__PURE__ */ o(
    "line",
    {
      x1: t.x1,
      y1: t.y1,
      x2: t.x2,
      y2: t.y2,
      stroke: e,
      strokeWidth: 2,
      markerEnd: "url(#cue-arrowhead)",
      style: { "--cue-arrow-color": e }
    }
  );
}
function Q({ annotation: t }) {
  const e = t.color ?? P;
  return /* @__PURE__ */ g("g", { children: [
    /* @__PURE__ */ o(
      "rect",
      {
        x: t.x,
        y: t.y,
        width: t.w,
        height: t.h,
        fill: "none",
        stroke: e,
        strokeWidth: 2,
        strokeDasharray: "6 3",
        rx: 4
      }
    ),
    t.label && /* @__PURE__ */ o(
      "text",
      {
        x: t.x,
        y: t.y - 6,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 12,
        fontWeight: 600,
        fill: e,
        children: t.label
      }
    )
  ] });
}
function ee({ annotation: t }) {
  const e = t.size ?? 13, r = 6, n = e * 0.6, l = t.content.length * n + r * 2, s = e + r * 2;
  return /* @__PURE__ */ g("g", { children: [
    /* @__PURE__ */ o(
      "rect",
      {
        x: t.x - r,
        y: t.y - e - r + 2,
        width: l,
        height: s,
        rx: 4,
        fill: "rgba(0,0,0,0.7)"
      }
    ),
    /* @__PURE__ */ o(
      "text",
      {
        x: t.x,
        y: t.y,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: e,
        fill: "#f5f5f5",
        children: t.content
      }
    )
  ] });
}
function te({
  src: t,
  alt: e,
  width: r = 840,
  height: n = 520,
  objectFit: l = "cover",
  children: s,
  className: u,
  style: a
}) {
  return /* @__PURE__ */ g(
    "div",
    {
      className: u,
      style: {
        position: "relative",
        overflow: "hidden",
        width: r,
        height: n,
        ...a
      },
      children: [
        /* @__PURE__ */ o(
          "img",
          {
            src: t,
            alt: e ?? "",
            draggable: !1,
            style: {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: l,
              pointerEvents: "none",
              userSelect: "none"
            }
          }
        ),
        s && /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              zIndex: 1
            },
            children: s
          }
        )
      ]
    }
  );
}
var B = "#C91C1C", re = "#4B5563", ne = "#1F2937", oe = ({
  current: t,
  total: e,
  variant: r = "dots",
  className: n
}) => {
  if (r === "bar") {
    const l = e > 1 ? t / (e - 1) * 100 : 100;
    return /* @__PURE__ */ o(
      "div",
      {
        className: n,
        style: {
          width: "100%",
          height: 6,
          backgroundColor: ne,
          borderRadius: 3,
          overflow: "hidden"
        },
        children: /* @__PURE__ */ o(
          "div",
          {
            style: {
              width: `${l}%`,
              height: "100%",
              backgroundColor: B,
              borderRadius: 3,
              transition: "width 0.3s ease"
            }
          }
        )
      }
    );
  }
  return /* @__PURE__ */ o(
    "div",
    {
      className: n,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      },
      children: Array.from({ length: e }, (l, s) => /* @__PURE__ */ o(
        "div",
        {
          style: {
            width: s === t ? 12 : 8,
            height: s === t ? 12 : 8,
            borderRadius: "50%",
            backgroundColor: s === t ? B : re,
            transition: "all 0.2s ease"
          }
        },
        s
      ))
    }
  );
}, ie = "#C91C1C", C = "#1F2937", O = "#111827", L = "#F9FAFB", N = "#6B7280", se = ({
  onPrev: t,
  onNext: e,
  isPrevDisabled: r,
  isNextDisabled: n,
  prevLabel: l = "←",
  nextLabel: s = "→",
  showLabels: u = !0
}) => {
  const a = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 18px",
    border: "none",
    borderRadius: 6,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: r || n ? "not-allowed" : "pointer",
    transition: "background-color 0.2s ease, color 0.2s ease",
    outline: "none",
    userSelect: "none"
  }, c = (d, h) => {
    h || (d.currentTarget.style.backgroundColor = ie);
  }, f = (d, h) => {
    h || (d.currentTarget.style.backgroundColor = C);
  };
  return /* @__PURE__ */ g(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      },
      children: [
        /* @__PURE__ */ o(
          "button",
          {
            onClick: t,
            disabled: r,
            onMouseEnter: (d) => c(d, r),
            onMouseLeave: (d) => f(d, r),
            style: {
              ...a,
              backgroundColor: r ? O : C,
              color: r ? N : L
            },
            children: u ? l : ""
          }
        ),
        /* @__PURE__ */ o(
          "button",
          {
            onClick: e,
            disabled: n,
            onMouseEnter: (d) => c(d, n),
            onMouseLeave: (d) => f(d, n),
            style: {
              ...a,
              backgroundColor: n ? O : C,
              color: n ? N : L
            },
            children: u ? s : ""
          }
        )
      ]
    }
  );
};
function z(t, e, r) {
  return { x: t.x * e, y: t.y * r };
}
function ae(t, e, r) {
  return t.map((n) => ({
    id: n.id,
    x: n.x * e,
    y: n.y * r,
    label: n.label,
    alwaysShow: n.alwaysShow
  }));
}
function le({
  script: t,
  width: e = 840,
  height: r = 520,
  autoPlay: n = !1,
  loop: l = !1,
  onComplete: s,
  onStepChange: u
}) {
  var A, T;
  const a = t.steps.length, [c, f] = k(0), [d, h] = k(null), p = q(null), i = t.steps[c], b = c > 0 ? t.steps[c - 1] : void 0;
  S(() => {
    u == null || u(c, a);
  }, [c, a, u]), S(() => {
    if (!(i != null && i.pointer)) {
      h(null);
      return;
    }
    const y = z(i.pointer, e, r), R = b != null && b.pointer ? z(b.pointer, e, r) : y;
    h({
      x: R.x,
      y: R.y,
      clicking: i.pointer.clicking ?? !1,
      transition: "0ms"
    });
    const J = requestAnimationFrame(() => {
      h({
        x: y.x,
        y: y.y,
        clicking: i.pointer.clicking ?? !1,
        transition: "600ms"
      });
    });
    return () => cancelAnimationFrame(J);
  }, [c, i, b, e, r]), S(() => (p.current && (clearTimeout(p.current), p.current = null), n && (i != null && i.duration) && (p.current = setTimeout(() => {
    c < a - 1 ? f((y) => y + 1) : l ? f(0) : s == null || s();
  }, i.duration)), () => {
    p.current && clearTimeout(p.current);
  }), [c, n, i == null ? void 0 : i.duration, a, l, s]);
  const j = E(() => {
    c < a - 1 ? f((y) => y + 1) : l ? f(0) : s == null || s();
  }, [c, a, l, s]), D = E(() => {
    c > 0 ? f((y) => y - 1) : l && f(a - 1);
  }, [c, a, l]), U = c === a - 1, $ = c === 0, H = ((A = t.theme) == null ? void 0 : A.accent) ?? "#C91C1C", W = ((T = t.theme) == null ? void 0 : T.bg) ?? "#0a0a0a";
  return /* @__PURE__ */ g(
    "div",
    {
      style: {
        background: W,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        overflow: "hidden",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        width: "fit-content"
      },
      children: [
        i != null && i.screen ? /* @__PURE__ */ g(te, { src: i.screen, width: e, height: r, children: [
          d && /* @__PURE__ */ o(Y, { state: d }),
          i.hotspots && i.hotspots.length > 0 && /* @__PURE__ */ o(
            G,
            {
              hotspots: ae(i.hotspots, e, r),
              containerWidth: e,
              containerHeight: r
            }
          ),
          i.annotations && i.annotations.length > 0 && /* @__PURE__ */ o(Z, { annotations: i.annotations })
        ] }) : /* @__PURE__ */ o(
          "div",
          {
            style: {
              width: e,
              height: r,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B7280",
              fontSize: 14
            },
            children: "No screen for this step"
          }
        ),
        (i == null ? void 0 : i.caption) && /* @__PURE__ */ o(
          "div",
          {
            style: {
              background: "#111",
              color: "#fff",
              padding: "8px 16px",
              fontSize: 13,
              lineHeight: 1.5
            },
            children: i.caption
          }
        ),
        /* @__PURE__ */ g(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "12px 16px"
            },
            children: [
              /* @__PURE__ */ o(oe, { current: c, total: a, variant: "dots" }),
              /* @__PURE__ */ o(
                se,
                {
                  onPrev: D,
                  onNext: j,
                  isPrevDisabled: $ && !l,
                  isNextDisabled: U && !l
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ o("style", { children: `:root { --cue-accent: ${H}; }` })
      ]
    }
  );
}
class ce extends HTMLElement {
  constructor() {
    super(...arguments), this.root = null, this.mounted = !1, this._goTo = null;
  }
  /** Observed attributes for reactive updates. */
  static get observedAttributes() {
    return ["src", "data", "width", "height", "autoplay", "loop"];
  }
  connectedCallback() {
    if (this.mounted) return;
    this.mounted = !0;
    const e = this.attachShadow({ mode: "open" }), r = document.createElement("div");
    e.appendChild(r), this.root = _(r), this.loadAndRender();
  }
  disconnectedCallback() {
    this.mounted = !1, this.root && (this.root.unmount(), this.root = null);
  }
  attributeChangedCallback(e, r, n) {
    r !== n && this.mounted && this.loadAndRender();
  }
  /** Reload the demo from the current attributes. */
  reload() {
    this.loadAndRender();
  }
  /** Navigate to a specific step by index. */
  goTo(e) {
    var r;
    (r = this._goTo) == null || r.call(this, e);
  }
  // ─── Internal ────────────────────────────────────────────────────────────
  loadAndRender() {
    const e = this.getAttribute("src"), r = this.getAttribute("data");
    e ? this.fetchAndRender(e) : r ? this.parseAndRender(r) : this.renderError("No src or data attribute provided");
  }
  async fetchAndRender(e) {
    try {
      const r = await fetch(e);
      if (!r.ok) {
        this.renderError(`Failed to load demo: ${r.status}`);
        return;
      }
      const n = await r.json();
      M(n) ? this.renderPlayer(n) : this.renderError("Invalid DemoScript JSON");
    } catch {
      this.renderError("Failed to load demo");
    }
  }
  parseAndRender(e) {
    try {
      const r = JSON.parse(e);
      M(r) ? this.renderPlayer(r) : this.renderError("Invalid DemoScript JSON");
    } catch {
      this.renderError("Failed to parse DemoScript JSON");
    }
  }
  renderPlayer(e) {
    if (!this.root) return;
    const r = parseInt(this.getAttribute("width") ?? "840", 10), n = parseInt(this.getAttribute("height") ?? "520", 10), l = this.hasAttribute("autoplay"), s = this.hasAttribute("loop"), u = (c, f) => {
      this.dispatchEvent(
        new CustomEvent("stepchange", {
          detail: { step: c, total: f },
          bubbles: !0
        })
      );
    }, a = () => {
      this.dispatchEvent(
        new CustomEvent("complete", { bubbles: !0 })
      );
    };
    this.root.render(
      I(le, {
        script: e,
        width: r,
        height: n,
        autoPlay: l,
        loop: s,
        onStepChange: u,
        onComplete: a
      })
    );
  }
  renderError(e) {
    this.root && this.root.render(
      I(
        "div",
        {
          style: {
            padding: "24px",
            color: "#ef4444",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            textAlign: "center"
          }
        },
        e
      )
    );
  }
}
const de = "https://unpkg.com/@cue-vin/player/dist/cue-player.iife.js";
function ge(t) {
  var p, i;
  const {
    script: e,
    title: r,
    playerJsInline: n = !1,
    cdnUrl: l = de,
    width: s = 840,
    height: u = 520
  } = t, a = r ?? e.title ?? "cue demo", c = JSON.stringify(e), f = ((p = e.theme) == null ? void 0 : p.bg) ?? "#0a0a0a", d = ((i = e.theme) == null ? void 0 : i.font) ?? "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  let h;
  return n ? h = `<script>
${ue()}
<\/script>` : h = `<script src="${w(l)}"><\/script>`, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${w(a)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    body {
      background: ${w(f)};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ${w(d)};
    }
  </style>
</head>
<body>
  <cue-embed id="player" width="${s}" height="${u}"></cue-embed>

  <script>window.__CUE_SCRIPT__ = ${c};<\/script>
  ${h}

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
function w(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function ue() {
  try {
    const t = require("fs"), e = require("path");
    let r;
    try {
      r = e.dirname(new URL(import.meta.url).pathname);
    } catch {
      r = __dirname;
    }
    const n = e.resolve(r, "cue-player.iife.js");
    return t.readFileSync(n, "utf-8");
  } catch {
    return console.warn(
      "[cue] playerJsInline requires a Node.js environment. Use cdnUrl instead for browser builds."
    ), "";
  }
}
function fe() {
  customElements.get("cue-embed") || customElements.define("cue-embed", ce);
}
typeof customElements < "u" && fe();
export {
  ce as CueEmbed,
  le as CuePlayer,
  ge as exportToHtml,
  fe as initCue
};
