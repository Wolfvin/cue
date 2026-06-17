/**
 * Functional verification for Issue #106 (LazyMount) and Issue #105
 * (Step transition animations).
 *
 * These tests simulate real consumer usage:
 *   - LazyMount: create a `<cue-embed lazy>` element, attach to DOM,
 *     assert no shadow root exists yet, fire IntersectionObserver,
 *     assert the player mounted.
 *   - Step transition: render CuePlayer, advance the step, assert the
 *     `.cue-step-enter` class is present on the slide wrapper and the
 *     `--cue-step-direction` CSS variable reflects forward/backward.
 */
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import type { DemoScript } from "@cue-vin/core";
import { CuePlayer } from "../src/CuePlayer";
import { CueEmbed } from "../src/WebComponent";

// ── Mock IntersectionObserver with manual trigger ──────────────────────
//
// We need to be able to *trigger* the intersection callback from the test,
// so we capture the registered callback and entries when `observe()` is
// called. This is more realistic than mocking the class entirely.

type IOCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver
) => void;

interface RegisteredObserver {
  callback: IOCallback;
  target: Element;
  observer: IntersectionObserver;
}

const registeredObservers: RegisteredObserver[] = [];

class MockIntersectionObserver {
  callback: IOCallback;
  root = null;
  rootMargin = "";
  thresholds: ReadonlyArray<number> = [];
  constructor(cb: IOCallback, options?: IntersectionObserverInit) {
    this.callback = cb;
    if (options) {
      this.root = options.root ?? null;
      this.rootMargin = options.rootMargin ?? "";
      this.thresholds = options.threshold
        ? Array.isArray(options.threshold)
          ? options.threshold
          : [options.threshold]
        : [];
    }
  }
  observe = vi.fn((target: Element) => {
    registeredObservers.push({
      callback: this.callback,
      target,
      observer: this as unknown as IntersectionObserver,
    });
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

// ── Test fixtures ──────────────────────────────────────────────────────

const demoScript: DemoScript = {
  id: "test-demo",
  title: "Test Demo",
  steps: [
    {
      id: "step-0",
      caption: "First step",
      duration: 999999,
      pointer: { x: 0.2, y: 0.2 },
    },
    {
      id: "step-1",
      caption: "Second step",
      duration: 999999,
      pointer: { x: 0.8, y: 0.8 },
    },
    {
      id: "step-2",
      caption: "Third step",
      duration: 999999,
      pointer: { x: 0.5, y: 0.5 },
    },
  ],
  loop: false,
  theme: { accent: "#3b82f6", bg: "#0a0a0a" },
};

// ── Tests ──────────────────────────────────────────────────────────────

// Register the custom element once globally. A constructor can only be
// associated with a single tag name per the Custom Elements spec, so we
// must define it exactly once across the whole test file.
beforeAll(() => {
  if (!customElements.get("cue-embed-func")) {
    customElements.define("cue-embed-func", CueEmbed);
  }
});

describe("Issue #106 — LazyMount for <cue-embed>", () => {
  beforeEach(() => {
    registeredObservers.length = 0;
    (window as unknown as { IntersectionObserver: typeof MockIntersectionObserver }).IntersectionObserver =
      MockIntersectionObserver;
    document.body.innerHTML = "";
  });

  it("does NOT mount the player until IntersectionObserver fires (lazy attr set)", () => {
    const el = document.createElement("cue-embed-func") as CueEmbed;
    el.setAttribute("lazy", "");
    el.setAttribute("data", JSON.stringify(demoScript));
    document.body.appendChild(el);

    // Before intersection: no shadow root should be attached yet.
    expect(el.shadowRoot).toBeNull();
    expect(registeredObservers.length).toBe(1);
    expect(registeredObservers[0].target).toBe(el);
    // rootMargin should be 200px per the issue spec.
    expect(registeredObservers[0].observer.rootMargin).toBe("200px");
  });

  it("mounts the player after IntersectionObserver fires intersecting=true", () => {
    const el = document.createElement("cue-embed-func") as CueEmbed;
    el.setAttribute("lazy", "");
    el.setAttribute("data", JSON.stringify(demoScript));
    document.body.appendChild(el);

    // Sanity: no shadow root yet.
    expect(el.shadowRoot).toBeNull();

    // Simulate the observer firing with isIntersecting=true.
    const entry = {
      isIntersecting: true,
      target: el,
    } as unknown as IntersectionObserverEntry;
    registeredObservers[0].callback(
      [entry],
      registeredObservers[0].observer
    );

    // Shadow root should now exist (mountPlayer ran).
    expect(el.shadowRoot).not.toBeNull();
    // The shadow DOM should contain a div container — React root host.
    const container = el.shadowRoot?.querySelector("div");
    expect(container).not.toBeNull();
  });

  it("mounts synchronously when lazy attr is NOT set (backward compatibility)", () => {
    const el = document.createElement("cue-embed-func") as CueEmbed;
    el.setAttribute("data", JSON.stringify(demoScript));
    document.body.appendChild(el);

    // No lazy attr → no IntersectionObserver registered, shadow root attached immediately.
    expect(registeredObservers.length).toBe(0);
    expect(el.shadowRoot).not.toBeNull();
  });
});

describe("Issue #105 — Step transition animations in CuePlayer", () => {
  // Helper: read the --cue-step-direction value from a .cue-step-enter element.
  function readDirection(container: HTMLElement): number | null {
    const el = container.querySelector(".cue-step-enter") as HTMLElement | null;
    if (!el) return null;
    const m = el.getAttribute("style")?.match(/--cue-step-direction:\s*(-?\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }

  it("applies .cue-step-enter on initial mount with --cue-step-direction=1", () => {
    const { container } = render(
      <CuePlayer script={demoScript} width={400} height={240} />
    );

    const enterEl = container.querySelector(".cue-step-enter");
    expect(enterEl).not.toBeNull();

    // Direction var should be 1 (forward) on initial mount.
    expect(readDirection(container)).toBe(1);
  });

  it("renders the .cue-step-enter-active class CSS in the injected <style> block", () => {
    const { container } = render(
      <CuePlayer script={demoScript} width={400} height={240} />
    );

    const styleEl = container.querySelector("style");
    expect(styleEl?.textContent).toContain(".cue-step-enter-active");
    expect(styleEl?.textContent).toContain(".cue-step-exit-active");
    expect(styleEl?.textContent).toContain("--cue-step-direction");
  });

  it("applies forward direction (1) when stepping next, backward (-1) when stepping prev", () => {
    const { container } = render(
      <CuePlayer script={demoScript} width={400} height={240} />
    );

    // Initial: direction 1 (no previous step).
    expect(readDirection(container)).toBe(1);

    // Click the "next" button (ChapterNav renders buttons; pick the last button).
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    const nextBtn = buttons[buttons.length - 1];
    fireEvent.click(nextBtn);

    // After moving forward, direction should still be 1.
    expect(readDirection(container)).toBe(1);

    // Re-query buttons after the re-render so we get fresh handlers.
    const freshButtons = container.querySelectorAll("button");
    const prevBtn = freshButtons[0];
    fireEvent.click(prevBtn);
    expect(readDirection(container)).toBe(-1);
  });
});
