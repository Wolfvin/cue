import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import type { DemoScript } from "@cue-vin/core";
import { validateDemoScript } from "@cue-vin/core";
import { CuePlayer } from "./CuePlayer";

/** Custom Element that renders a CuePlayer inside a shadow DOM. */
export class CueEmbed extends HTMLElement {
  private root: Root | null = null;
  private mounted = false;
  private _goTo: ((n: number) => void) | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  /** Observed attributes for reactive updates. */
  static get observedAttributes(): string[] {
    return ["src", "data", "width", "height", "autoplay", "loop", "lazy"];
  }

  connectedCallback(): void {
    if (this.mounted) return;

    // Lazy mount: defer player initialization until the element is within
    // 200px of the viewport. This avoids loading the player (and its demo
    // data) for embeds that are far below the fold.
    //
    // Backward compatibility: when the `lazy` attribute is NOT present, the
    // behavior is identical to before — mount synchronously inside
    // connectedCallback.
    if (this.hasAttribute("lazy") && typeof IntersectionObserver !== "undefined") {
      this.setupLazyMount();
      return;
    }

    this.mountPlayer();
  }

  disconnectedCallback(): void {
    // Clean up the IntersectionObserver if lazy mount was pending.
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    this.mounted = false;
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    // Re-render when the value actually changes (skip identical updates).
    // We must also handle the first set (oldValue === null → newValue !== null)
    // because connectedCallback may have fired before the attribute was set.
    if (oldValue !== newValue && this.mounted) {
      this.loadAndRender();
    }
  }

  /** Reload the demo from the current attributes. */
  reload(): void {
    this.loadAndRender();
  }

  /** Navigate to a specific step by index. */
  goTo(n: number): void {
    this._goTo?.(n);
  }

  // ─── Internal ────────────────────────────────────────────────────────────

  /**
   * Set up an IntersectionObserver that mounts the player the first time the
   * element comes within `rootMargin` of the viewport. Once triggered the
   * observer is disconnected — we only lazy-mount once.
   *
   * Falls back to immediate mounting if IntersectionObserver is unavailable
   * (e.g. very old browsers, or jsdom without polyfill).
   */
  private setupLazyMount(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Disconnect first to avoid re-entering if mountPlayer throws.
            this.intersectionObserver?.disconnect();
            this.intersectionObserver = null;
            this.mountPlayer();
            break;
          }
        }
      },
      { rootMargin: "200px" }
    );
    this.intersectionObserver.observe(this);
  }

  /**
   * Attach the shadow DOM, create the React root, and trigger the first
   * render. Idempotent — guarded by `this.mounted`.
   */
  private mountPlayer(): void {
    if (this.mounted) return;
    this.mounted = true;

    const shadow = this.attachShadow({ mode: "open" });
    const container = document.createElement("div");
    shadow.appendChild(container);

    this.root = createRoot(container);
    this.loadAndRender();
  }

  private loadAndRender(): void {
    const src = this.getAttribute("src");
    const data = this.getAttribute("data");

    if (src) {
      this.fetchAndRender(src);
    } else if (data) {
      this.parseAndRender(data);
    } else {
      this.renderError("No src or data attribute provided");
    }
  }

  private async fetchAndRender(url: string): Promise<void> {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        this.renderError(`Failed to load demo: ${res.status}`);
        return;
      }
      const json: unknown = await res.json();
      if (validateDemoScript(json)) {
        this.renderPlayer(json);
      } else {
        this.renderError("Invalid DemoScript JSON");
      }
    } catch {
      this.renderError("Failed to load demo");
    }
  }

  private parseAndRender(jsonStr: string): void {
    try {
      const json: unknown = JSON.parse(jsonStr);
      if (validateDemoScript(json)) {
        this.renderPlayer(json);
      } else {
        this.renderError("Invalid DemoScript JSON");
      }
    } catch {
      this.renderError("Failed to parse DemoScript JSON");
    }
  }

  private renderPlayer(script: DemoScript): void {
    if (!this.root) return;

    const width = parseInt(this.getAttribute("width") ?? "840", 10);
    const height = parseInt(this.getAttribute("height") ?? "520", 10);
    const autoPlay = this.hasAttribute("autoplay");
    const loop = this.hasAttribute("loop");

    const handleStepChange = (step: number, total: number) => {
      this.dispatchEvent(
        new CustomEvent("stepchange", {
          detail: { step, total },
          bubbles: true,
        })
      );
    };

    const handleComplete = () => {
      this.dispatchEvent(
        new CustomEvent("complete", { bubbles: true })
      );
    };

    this.root.render(
      createElement(CuePlayer, {
        script,
        width,
        height,
        autoPlay,
        loop,
        onStepChange: handleStepChange,
        onComplete: handleComplete,
      })
    );
  }

  private renderError(message: string): void {
    if (!this.root) return;
    this.root.render(
      createElement(
        "div",
        {
          style: {
            padding: "24px",
            color: "#ef4444",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            textAlign: "center" as const,
          },
        },
        message
      )
    );
  }
}
