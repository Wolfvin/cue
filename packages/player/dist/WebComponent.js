import { createElement as s } from "react";
import m from "react-dom";
import { CuePlayer as y } from "./index.js";
function a(r) {
  if (typeof r != "object" || r === null) return !1;
  const e = r;
  if (typeof e.id != "string" || typeof e.title != "string" || !Array.isArray(e.steps)) return !1;
  for (const t of e.steps)
    if (typeof t != "object" || t === null || typeof t.id != "string") return !1;
  if (e.loop !== void 0 && typeof e.loop != "boolean") return !1;
  if (e.theme !== void 0) {
    if (typeof e.theme != "object" || e.theme === null) return !1;
    const t = e.theme;
    if (t.accent !== void 0 && typeof t.accent != "string" || t.bg !== void 0 && typeof t.bg != "string" || t.font !== void 0 && typeof t.font != "string") return !1;
  }
  return !0;
}
var i, n = m;
if (process.env.NODE_ENV === "production")
  i = n.createRoot, n.hydrateRoot;
else {
  var d = n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  i = function(r, e) {
    d.usingClientEntryPoint = !0;
    try {
      return n.createRoot(r, e);
    } finally {
      d.usingClientEntryPoint = !1;
    }
  };
}
class v extends HTMLElement {
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
    const e = this.attachShadow({ mode: "open" }), t = document.createElement("div");
    e.appendChild(t), this.root = i(t), this.loadAndRender();
  }
  disconnectedCallback() {
    this.mounted = !1, this.root && (this.root.unmount(), this.root = null);
  }
  attributeChangedCallback(e, t, o) {
    t !== o && this.mounted && this.loadAndRender();
  }
  /** Reload the demo from the current attributes. */
  reload() {
    this.loadAndRender();
  }
  /** Navigate to a specific step by index. */
  goTo(e) {
    var t;
    (t = this._goTo) == null || t.call(this, e);
  }
  // ─── Internal ────────────────────────────────────────────────────────────
  loadAndRender() {
    const e = this.getAttribute("src"), t = this.getAttribute("data");
    e ? this.fetchAndRender(e) : t ? this.parseAndRender(t) : this.renderError("No src or data attribute provided");
  }
  async fetchAndRender(e) {
    try {
      const t = await fetch(e);
      if (!t.ok) {
        this.renderError(`Failed to load demo: ${t.status}`);
        return;
      }
      const o = await t.json();
      a(o) ? this.renderPlayer(o) : this.renderError("Invalid DemoScript JSON");
    } catch {
      this.renderError("Failed to load demo");
    }
  }
  parseAndRender(e) {
    try {
      const t = JSON.parse(e);
      a(t) ? this.renderPlayer(t) : this.renderError("Invalid DemoScript JSON");
    } catch {
      this.renderError("Failed to parse DemoScript JSON");
    }
  }
  renderPlayer(e) {
    if (!this.root) return;
    const t = parseInt(this.getAttribute("width") ?? "840", 10), o = parseInt(this.getAttribute("height") ?? "520", 10), l = this.hasAttribute("autoplay"), h = this.hasAttribute("loop"), c = (f, p) => {
      this.dispatchEvent(
        new CustomEvent("stepchange", {
          detail: { step: f, total: p },
          bubbles: !0
        })
      );
    }, u = () => {
      this.dispatchEvent(
        new CustomEvent("complete", { bubbles: !0 })
      );
    };
    this.root.render(
      s(y, {
        script: e,
        width: t,
        height: o,
        autoPlay: l,
        loop: h,
        onStepChange: c,
        onComplete: u
      })
    );
  }
  renderError(e) {
    this.root && this.root.render(
      s(
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
export {
  v as CueEmbed
};
