import { createElement as i } from "react";
import f from "react-dom";
import { validateDemoScript as a } from "@cue-vin/core";
import { CuePlayer as E } from "./index.js";
var n, o = f;
if (process.env.NODE_ENV === "production")
  n = o.createRoot, o.hydrateRoot;
else {
  var d = o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  n = function(s, e) {
    d.usingClientEntryPoint = !0;
    try {
      return o.createRoot(s, e);
    } finally {
      d.usingClientEntryPoint = !1;
    }
  };
}
class C extends HTMLElement {
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
    e.appendChild(t), this.root = n(t), this.loadAndRender();
  }
  disconnectedCallback() {
    this.mounted = !1, this.root && (this.root.unmount(), this.root = null);
  }
  attributeChangedCallback(e, t, r) {
    t !== r && this.mounted && this.loadAndRender();
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
      const r = await t.json();
      a(r) ? this.renderPlayer(r) : this.renderError("Invalid DemoScript JSON");
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
    const t = parseInt(this.getAttribute("width") ?? "840", 10), r = parseInt(this.getAttribute("height") ?? "520", 10), h = this.hasAttribute("autoplay"), l = this.hasAttribute("loop"), c = (p, m) => {
      this.dispatchEvent(
        new CustomEvent("stepchange", {
          detail: { step: p, total: m },
          bubbles: !0
        })
      );
    }, u = () => {
      this.dispatchEvent(
        new CustomEvent("complete", { bubbles: !0 })
      );
    };
    this.root.render(
      i(E, {
        script: e,
        width: t,
        height: r,
        autoPlay: h,
        loop: l,
        onStepChange: c,
        onComplete: u
      })
    );
  }
  renderError(e) {
    this.root && this.root.render(
      i(
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
  C as CueEmbed
};
