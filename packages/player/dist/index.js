import { jsxs as g, jsx as a } from "react/jsx-runtime";
import { useState as E, useRef as O, useEffect as v, useCallback as F, useMemo as $ } from "react";
import { ScreenSlide as G, ScriptedPointer as N, HotspotOverlay as j, AnnotationLayer as D, StepProgress as J, ChapterNav as K } from "@cue-vin/react";
import { renderTemplate as Q } from "@cue-vin/templates";
import { e as p } from "./export.js";
function M(e, t, o) {
  return { x: e.x * t, y: e.y * o };
}
function W(e, t, o) {
  return e.map((c) => ({
    id: c.id,
    x: c.x * t,
    y: c.y * o,
    label: c.label,
    alwaysShow: c.alwaysShow
  }));
}
function U(e, t) {
  var i, s, u;
  const o = {
    type: e.type,
    ...e.data ?? {}
  }, c = {
    ...t != null && t.accent ? { accent: t.accent } : {},
    ...t != null && t.bg ? { bg: t.bg } : {},
    ...t != null && t.font ? { font: t.font } : {},
    ...(i = e.theme) != null && i.accent ? { accent: e.theme.accent } : {},
    ...(s = e.theme) != null && s.bg ? { bg: e.theme.bg } : {},
    ...(u = e.theme) != null && u.font ? { font: e.theme.font } : {}
  };
  return Q(o, c);
}
function w({
  script: e,
  width: t = 840,
  height: o = 520,
  autoPlay: c = !1,
  loop: i = !1,
  onComplete: s,
  onStepChange: u
}) {
  var S, k;
  const l = e.steps.length, [r, d] = E(0), [x, b] = E(null), y = O(null), n = e.steps[r], m = r > 0 ? e.steps[r - 1] : void 0;
  v(() => {
    u == null || u(r, l);
  }, [r, l, u]), v(() => {
    if (!(n != null && n.pointer)) {
      b(null);
      return;
    }
    const f = M(n.pointer, t, o), P = m != null && m.pointer ? M(m.pointer, t, o) : f;
    b({
      x: P.x,
      y: P.y,
      clicking: n.pointer.clicking ?? !1,
      transition: "0ms"
    });
    const q = requestAnimationFrame(() => {
      b({
        x: f.x,
        y: f.y,
        clicking: n.pointer.clicking ?? !1,
        transition: "600ms"
      });
    });
    return () => cancelAnimationFrame(q);
  }, [r, n, m, t, o]), v(() => (y.current && (clearTimeout(y.current), y.current = null), c && (n != null && n.duration) && (y.current = setTimeout(() => {
    r < l - 1 ? d((f) => f + 1) : i ? d(0) : s == null || s();
  }, n.duration)), () => {
    y.current && clearTimeout(y.current);
  }), [r, c, n == null ? void 0 : n.duration, l, i, s]);
  const A = F(() => {
    r < l - 1 ? d((f) => f + 1) : i ? d(0) : s == null || s();
  }, [r, l, i, s]), I = F(() => {
    r > 0 ? d((f) => f - 1) : i && d(l - 1);
  }, [r, l, i]), L = r === l - 1, R = r === 0, z = ((S = e.theme) == null ? void 0 : S.accent) ?? "#C91C1C", B = ((k = e.theme) == null ? void 0 : k.bg) ?? "#0a0a0a", H = $(() => n != null && n.screen || !(n != null && n.template) ? null : U(n.template, e.theme), [n == null ? void 0 : n.screen, n == null ? void 0 : n.template, e.theme]), _ = n != null && n.screen ? /* @__PURE__ */ g(G, { src: n.screen, width: t, height: o, children: [
    x && /* @__PURE__ */ a(N, { state: x }),
    n.hotspots && n.hotspots.length > 0 && /* @__PURE__ */ a(
      j,
      {
        hotspots: W(n.hotspots, t, o),
        containerWidth: t,
        containerHeight: o
      }
    ),
    n.annotations && n.annotations.length > 0 && /* @__PURE__ */ a(
      D,
      {
        annotations: n.annotations,
        containerWidth: t,
        containerHeight: o
      }
    )
  ] }) : H ? /* @__PURE__ */ g("div", { style: { position: "relative", width: t, height: o, overflow: "hidden" }, children: [
    /* @__PURE__ */ a(
      "div",
      {
        style: { width: "100%", height: "100%", overflow: "hidden" },
        dangerouslySetInnerHTML: { __html: H }
      }
    ),
    x && /* @__PURE__ */ a(N, { state: x }),
    n.hotspots && n.hotspots.length > 0 && /* @__PURE__ */ a(
      j,
      {
        hotspots: W(n.hotspots, t, o),
        containerWidth: t,
        containerHeight: o
      }
    ),
    n.annotations && n.annotations.length > 0 && /* @__PURE__ */ a(
      D,
      {
        annotations: n.annotations,
        containerWidth: t,
        containerHeight: o
      }
    )
  ] }) : /* @__PURE__ */ a(
    "div",
    {
      style: {
        width: t,
        height: o,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6B7280",
        fontSize: 14
      },
      children: "No screen for this step"
    }
  );
  return /* @__PURE__ */ g(
    "div",
    {
      style: {
        background: B,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        overflow: "hidden",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        width: "fit-content"
      },
      children: [
        _,
        (n == null ? void 0 : n.caption) && /* @__PURE__ */ a(
          "div",
          {
            style: {
              background: "#111",
              color: "#fff",
              padding: "8px 16px",
              fontSize: 13,
              lineHeight: 1.5
            },
            children: n.caption
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
              /* @__PURE__ */ a(J, { current: r, total: l, variant: "dots" }),
              /* @__PURE__ */ a(
                K,
                {
                  onPrev: I,
                  onNext: A,
                  isPrevDisabled: R && !i,
                  isNextDisabled: L && !i
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ a("style", { children: `:root { --cue-accent: ${z}; }` })
      ]
    }
  );
}
async function C() {
  if (typeof customElements > "u" || customElements.get("cue-embed")) return;
  const { CueEmbed: e } = await import("./WebComponent.js");
  customElements.define("cue-embed", e);
}
export {
  w as CuePlayer,
  p as exportToHtml,
  C as initCue
};
