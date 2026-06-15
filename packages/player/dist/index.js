import { jsxs as g, jsx as r } from "react/jsx-runtime";
import { useState as S, useCallback as v, useRef as j, useEffect as w } from "react";
function W({
  state: e,
  size: t = 24,
  color: n = "#1a1a1a",
  className: i
}) {
  return /* @__PURE__ */ r(
    "div",
    {
      className: i,
      style: {
        position: "absolute",
        left: e.x,
        top: e.y,
        transitionProperty: "left, top",
        transitionDuration: e.transition,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-2px, -2px)",
        willChange: "left, top"
      },
      children: /* @__PURE__ */ r(
        "svg",
        {
          width: t,
          height: t,
          viewBox: "0 0 24 24",
          fill: e.clicking ? "#3b82f6" : n,
          style: {
            transition: "fill 0.1s ease",
            filter: e.clicking ? "drop-shadow(0 0 6px rgba(59,130,246,0.5))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          },
          children: /* @__PURE__ */ r("path", { d: "M5 2l14 10-6 2-2 6z" })
        }
      )
    }
  );
}
function D({
  hotspots: e,
  containerWidth: t,
  containerHeight: n
}) {
  const [i, a] = S(null), s = v((l) => a(l), []), u = v(() => a(null), []);
  return /* @__PURE__ */ r(
    "div",
    {
      style: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5e3
      },
      children: e.map((l) => /* @__PURE__ */ r(
        N,
        {
          hotspot: l,
          isHovered: i === l.id,
          onMouseEnter: s,
          onMouseLeave: u,
          containerWidth: t,
          containerHeight: n
        },
        l.id
      ))
    }
  );
}
var m = 12, x = 32;
function N({
  hotspot: e,
  isHovered: t,
  onMouseEnter: n,
  onMouseLeave: i,
  containerWidth: a,
  containerHeight: s
}) {
  const u = e.alwaysShow || t, l = 100, c = e.x > a - l, f = e.y > s - l, d = c ? -8 : m + 4, p = f ? -8 : m + 4, y = c ? "right" : "left", o = f ? "bottom" : "top";
  return /* @__PURE__ */ g(
    "div",
    {
      onMouseEnter: () => n(e.id),
      onMouseLeave: i,
      style: {
        position: "absolute",
        left: e.x - m / 2,
        top: e.y - m / 2,
        pointerEvents: "auto",
        cursor: "pointer"
      },
      children: [
        /* @__PURE__ */ r(
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
        /* @__PURE__ */ r(
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
        u && /* @__PURE__ */ r(
          "div",
          {
            style: {
              position: "absolute",
              left: d,
              top: p,
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
              ...y === "right" ? { transform: "translateX(-100%)" } : {},
              ...o === "bottom" ? { transform: `translateY(-100%)${y === "right" ? " translateX(-100%)" : ""}` } : {}
            },
            children: e.label
          }
        ),
        /* @__PURE__ */ r("style", { children: `
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
function q({ annotations: e }) {
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
        /* @__PURE__ */ r("defs", { children: /* @__PURE__ */ r(
          "marker",
          {
            id: "cue-arrowhead",
            markerWidth: "8",
            markerHeight: "6",
            refX: "8",
            refY: "3",
            orient: "auto",
            children: /* @__PURE__ */ r("polygon", { points: "0 0, 8 3, 0 6", fill: "var(--cue-arrow-color, #3b82f6)" })
          }
        ) }),
        e.map((t, n) => {
          switch (t.type) {
            case "arrow":
              return /* @__PURE__ */ r(J, { annotation: t }, n);
            case "box":
              return /* @__PURE__ */ r(X, { annotation: t }, n);
            case "text":
              return /* @__PURE__ */ r(Y, { annotation: t }, n);
            default:
              return null;
          }
        })
      ]
    }
  );
}
var A = "#3b82f6";
function J({ annotation: e }) {
  const t = e.color ?? A;
  return /* @__PURE__ */ r(
    "line",
    {
      x1: e.x1,
      y1: e.y1,
      x2: e.x2,
      y2: e.y2,
      stroke: t,
      strokeWidth: 2,
      markerEnd: "url(#cue-arrowhead)",
      style: { "--cue-arrow-color": t }
    }
  );
}
function X({ annotation: e }) {
  const t = e.color ?? A;
  return /* @__PURE__ */ g("g", { children: [
    /* @__PURE__ */ r(
      "rect",
      {
        x: e.x,
        y: e.y,
        width: e.w,
        height: e.h,
        fill: "none",
        stroke: t,
        strokeWidth: 2,
        strokeDasharray: "6 3",
        rx: 4
      }
    ),
    e.label && /* @__PURE__ */ r(
      "text",
      {
        x: e.x,
        y: e.y - 6,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 12,
        fontWeight: 600,
        fill: t,
        children: e.label
      }
    )
  ] });
}
function Y({ annotation: e }) {
  const t = e.size ?? 13, n = 6, i = t * 0.6, a = e.content.length * i + n * 2, s = t + n * 2;
  return /* @__PURE__ */ g("g", { children: [
    /* @__PURE__ */ r(
      "rect",
      {
        x: e.x - n,
        y: e.y - t - n + 2,
        width: a,
        height: s,
        rx: 4,
        fill: "rgba(0,0,0,0.7)"
      }
    ),
    /* @__PURE__ */ r(
      "text",
      {
        x: e.x,
        y: e.y,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: t,
        fill: "#f5f5f5",
        children: e.content
      }
    )
  ] });
}
function G({
  src: e,
  alt: t,
  width: n = 840,
  height: i = 520,
  objectFit: a = "cover",
  children: s,
  className: u,
  style: l
}) {
  return /* @__PURE__ */ g(
    "div",
    {
      className: u,
      style: {
        position: "relative",
        overflow: "hidden",
        width: n,
        height: i,
        ...l
      },
      children: [
        /* @__PURE__ */ r(
          "img",
          {
            src: e,
            alt: t ?? "",
            draggable: !1,
            style: {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: a,
              pointerEvents: "none",
              userSelect: "none"
            }
          }
        ),
        s && /* @__PURE__ */ r(
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
var I = "#C91C1C", Z = "#4B5563", K = "#1F2937", V = ({
  current: e,
  total: t,
  variant: n = "dots",
  className: i
}) => {
  if (n === "bar") {
    const a = t > 1 ? e / (t - 1) * 100 : 100;
    return /* @__PURE__ */ r(
      "div",
      {
        className: i,
        style: {
          width: "100%",
          height: 6,
          backgroundColor: K,
          borderRadius: 3,
          overflow: "hidden"
        },
        children: /* @__PURE__ */ r(
          "div",
          {
            style: {
              width: `${a}%`,
              height: "100%",
              backgroundColor: I,
              borderRadius: 3,
              transition: "width 0.3s ease"
            }
          }
        )
      }
    );
  }
  return /* @__PURE__ */ r(
    "div",
    {
      className: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      },
      children: Array.from({ length: t }, (a, s) => /* @__PURE__ */ r(
        "div",
        {
          style: {
            width: s === e ? 12 : 8,
            height: s === e ? 12 : 8,
            borderRadius: "50%",
            backgroundColor: s === e ? I : Z,
            transition: "all 0.2s ease"
          }
        },
        s
      ))
    }
  );
}, Q = "#C91C1C", k = "#1F2937", F = "#111827", B = "#F9FAFB", M = "#6B7280", ee = ({
  onPrev: e,
  onNext: t,
  isPrevDisabled: n,
  isNextDisabled: i,
  prevLabel: a = "←",
  nextLabel: s = "→",
  showLabels: u = !0
}) => {
  const l = {
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
    cursor: n || i ? "not-allowed" : "pointer",
    transition: "background-color 0.2s ease, color 0.2s ease",
    outline: "none",
    userSelect: "none"
  }, c = (d, p) => {
    p || (d.currentTarget.style.backgroundColor = Q);
  }, f = (d, p) => {
    p || (d.currentTarget.style.backgroundColor = k);
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
        /* @__PURE__ */ r(
          "button",
          {
            onClick: e,
            disabled: n,
            onMouseEnter: (d) => c(d, n),
            onMouseLeave: (d) => f(d, n),
            style: {
              ...l,
              backgroundColor: n ? F : k,
              color: n ? M : B
            },
            children: u ? a : ""
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            onClick: t,
            disabled: i,
            onMouseEnter: (d) => c(d, i),
            onMouseLeave: (d) => f(d, i),
            style: {
              ...l,
              backgroundColor: i ? F : k,
              color: i ? M : B
            },
            children: u ? s : ""
          }
        )
      ]
    }
  );
};
function R(e, t, n) {
  return { x: e.x * t, y: e.y * n };
}
function te(e, t, n) {
  return e.map((i) => ({
    id: i.id,
    x: i.x * t,
    y: i.y * n,
    label: i.label,
    alwaysShow: i.alwaysShow
  }));
}
function se({
  script: e,
  width: t = 840,
  height: n = 520,
  autoPlay: i = !1,
  loop: a = !1,
  onComplete: s,
  onStepChange: u
}) {
  var E, T;
  const l = e.steps.length, [c, f] = S(0), [d, p] = S(null), y = j(null), o = e.steps[c], b = c > 0 ? e.steps[c - 1] : void 0;
  w(() => {
    u == null || u(c, l);
  }, [c, l, u]), w(() => {
    if (!(o != null && o.pointer)) {
      p(null);
      return;
    }
    const h = R(o.pointer, t, n), _ = b != null && b.pointer ? R(b.pointer, t, n) : h;
    p({
      x: _.x,
      y: _.y,
      clicking: o.pointer.clicking ?? !1,
      transition: "0ms"
    });
    const P = requestAnimationFrame(() => {
      p({
        x: h.x,
        y: h.y,
        clicking: o.pointer.clicking ?? !1,
        transition: "600ms"
      });
    });
    return () => cancelAnimationFrame(P);
  }, [c, o, b, t, n]), w(() => (y.current && (clearTimeout(y.current), y.current = null), i && (o != null && o.duration) && (y.current = setTimeout(() => {
    c < l - 1 ? f((h) => h + 1) : a ? f(0) : s == null || s();
  }, o.duration)), () => {
    y.current && clearTimeout(y.current);
  }), [c, i, o == null ? void 0 : o.duration, l, a, s]);
  const z = v(() => {
    c < l - 1 ? f((h) => h + 1) : a ? f(0) : s == null || s();
  }, [c, l, a, s]), L = v(() => {
    c > 0 ? f((h) => h - 1) : a && f(l - 1);
  }, [c, l, a]), U = c === l - 1, $ = c === 0, H = ((E = e.theme) == null ? void 0 : E.accent) ?? "#C91C1C", O = ((T = e.theme) == null ? void 0 : T.bg) ?? "#0a0a0a";
  return /* @__PURE__ */ g(
    "div",
    {
      style: {
        background: O,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        overflow: "hidden",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        width: "fit-content"
      },
      children: [
        o != null && o.screen ? /* @__PURE__ */ g(G, { src: o.screen, width: t, height: n, children: [
          d && /* @__PURE__ */ r(W, { state: d }),
          o.hotspots && o.hotspots.length > 0 && /* @__PURE__ */ r(
            D,
            {
              hotspots: te(o.hotspots, t, n),
              containerWidth: t,
              containerHeight: n
            }
          ),
          o.annotations && o.annotations.length > 0 && /* @__PURE__ */ r(q, { annotations: o.annotations })
        ] }) : /* @__PURE__ */ r(
          "div",
          {
            style: {
              width: t,
              height: n,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B7280",
              fontSize: 14
            },
            children: "No screen for this step"
          }
        ),
        (o == null ? void 0 : o.caption) && /* @__PURE__ */ r(
          "div",
          {
            style: {
              background: "#111",
              color: "#fff",
              padding: "8px 16px",
              fontSize: 13,
              lineHeight: 1.5
            },
            children: o.caption
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
              /* @__PURE__ */ r(V, { current: c, total: l, variant: "dots" }),
              /* @__PURE__ */ r(
                ee,
                {
                  onPrev: L,
                  onNext: z,
                  isPrevDisabled: $ && !a,
                  isNextDisabled: U && !a
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ r("style", { children: `:root { --cue-accent: ${H}; }` })
      ]
    }
  );
}
const ne = "https://unpkg.com/@cue-vin/player/dist/cue-player.iife.js";
function le(e) {
  var y, o;
  const {
    script: t,
    title: n,
    playerJsInline: i = !1,
    cdnUrl: a = ne,
    width: s = 840,
    height: u = 520
  } = e, l = n ?? t.title ?? "cue demo", c = JSON.stringify(t), f = ((y = t.theme) == null ? void 0 : y.bg) ?? "#0a0a0a", d = ((o = t.theme) == null ? void 0 : o.font) ?? "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  let p;
  return i ? p = `<script>
${re()}
<\/script>` : p = `<script src="${C(a)}"><\/script>`, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${C(l)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    body {
      background: ${C(f)};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ${d};
    }
  </style>
</head>
<body>
  <cue-embed id="player" width="${s}" height="${u}" autoplay${t.loop ? " loop" : ""}></cue-embed>

  <script>window.__CUE_SCRIPT__ = ${c};<\/script>
  ${p}

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
function C(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function re() {
  try {
    const e = require("fs"), t = require("path");
    let n;
    try {
      n = t.dirname(new URL(import.meta.url).pathname);
    } catch {
      n = __dirname;
    }
    const i = t.resolve(n, "cue-player.iife.js");
    return e.readFileSync(i, "utf-8");
  } catch {
    return console.warn(
      "[cue] playerJsInline requires a Node.js environment. Use cdnUrl instead for browser builds."
    ), "";
  }
}
async function ae() {
  if (typeof customElements > "u" || customElements.get("cue-embed")) return;
  const { CueEmbed: e } = await import("./WebComponent.js");
  customElements.define("cue-embed", e);
}
export {
  se as CuePlayer,
  le as exportToHtml,
  ae as initCue
};
