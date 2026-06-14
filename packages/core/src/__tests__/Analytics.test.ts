import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CueAnalytics } from "../Analytics";
import type { CueEvent } from "../Analytics";

describe("CueAnalytics", () => {
  beforeEach(() => {
    // Stub global fetch so Analytics doesn't throw in Node test env
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("ok")))
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("can be constructed with demoId", () => {
    const analytics = new CueAnalytics({ demoId: "demo-1" });
    expect(analytics).toBeInstanceOf(CueAnalytics);
    expect(analytics.getSession()).toBeTruthy();
  });

  it("track() does not throw for a valid event type", () => {
    const analytics = new CueAnalytics({ demoId: "demo-1" });
    expect(() => analytics.track("demo_start")).not.toThrow();
    expect(() => analytics.track("step_view", { step: 0 })).not.toThrow();
    expect(() => analytics.track("hotspot_click", { hotspotId: "hs-1" })).not.toThrow();
  });

  it("does not call fetch when endpoint is not set (offline-safe)", () => {
    const analytics = new CueAnalytics({ demoId: "demo-1" });
    analytics.track("demo_start");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls fetch when endpoint is configured", () => {
    const analytics = new CueAnalytics({
      demoId: "demo-1",
      endpoint: "https://analytics.example.com/events",
    });
    analytics.track("demo_start");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://analytics.example.com/events",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("invokes onEvent callback for each tracked event", () => {
    const onEvent = vi.fn();
    const analytics = new CueAnalytics({ demoId: "demo-1", onEvent });
    analytics.track("demo_start");
    analytics.track("step_view", { step: 2 });

    expect(onEvent).toHaveBeenCalledTimes(2);
    expect(onEvent.mock.calls[0][0].type).toBe("demo_start");
    expect(onEvent.mock.calls[1][0].step).toBe(2);
  });

  it("records events and returns them in getSummary()", () => {
    const analytics = new CueAnalytics({ demoId: "demo-1" });
    analytics.track("demo_start");
    analytics.track("step_view", { step: 0 });
    analytics.track("step_view", { step: 1 });
    analytics.track("step_complete", { step: 1 });

    const summary = analytics.getSummary();
    expect(summary.demoId).toBe("demo-1");
    expect(summary.events).toHaveLength(4);
    expect(summary.totalStepsViewed).toBe(2); // steps 0 and 1
  });

  it("generates a unique sessionId per instance", () => {
    const a1 = new CueAnalytics({ demoId: "demo-1" });
    const a2 = new CueAnalytics({ demoId: "demo-1" });
    expect(a1.getSession()).not.toBe(a2.getSession());
  });

  it("getSummary() completionRate is 0 when no step events tracked", () => {
    const analytics = new CueAnalytics({ demoId: "demo-1" });
    analytics.track("demo_start");

    const summary = analytics.getSummary();
    expect(summary.completionRate).toBe(0);
  });

  it("getSummary() calculates completionRate based on viewed steps", () => {
    const analytics = new CueAnalytics({ demoId: "demo-1" });
    // Track 2 unique steps out of an inferred total of 3 (step indices 0, 1, 2)
    analytics.track("step_view", { step: 0 });
    analytics.track("step_view", { step: 1 });
    analytics.track("step_view", { step: 2 });
    // Only steps 0 and 2 completed
    analytics.track("step_complete", { step: 0 });
    analytics.track("step_complete", { step: 2 });

    const summary = analytics.getSummary();
    expect(summary.totalStepsViewed).toBe(3); // 3 unique step indices viewed
    expect(summary.completionRate).toBeCloseTo(1); // 3/3 = 1.0
  });

  it("logs to console when console option is true", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const analytics = new CueAnalytics({ demoId: "demo-1", console: true });
    analytics.track("demo_start");

    expect(logSpy).toHaveBeenCalledWith(
      "[CueAnalytics]",
      expect.objectContaining({ type: "demo_start" })
    );
    logSpy.mockRestore();
  });
});
