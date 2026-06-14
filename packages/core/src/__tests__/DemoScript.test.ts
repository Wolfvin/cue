import { describe, it, expect } from "vitest";
import { validateDemoScript, getDemoStep } from "../DemoScript";
import type { DemoScript } from "../DemoScript";

describe("validateDemoScript()", () => {
  it("returns false for an empty object", () => {
    expect(validateDemoScript({})).toBe(false);
  });

  it("returns false for null", () => {
    expect(validateDemoScript(null)).toBe(false);
  });

  it("returns false when id is missing", () => {
    expect(validateDemoScript({ title: "Test", steps: [] })).toBe(false);
  });

  it("returns false when title is missing", () => {
    expect(validateDemoScript({ id: "test", steps: [] })).toBe(false);
  });

  it("returns false when steps is not an array", () => {
    expect(
      validateDemoScript({ id: "test", title: "Test", steps: "not-array" })
    ).toBe(false);
  });

  it("returns false when a step lacks an id", () => {
    expect(
      validateDemoScript({
        id: "test",
        title: "Test",
        steps: [{ caption: "no id" }],
      })
    ).toBe(false);
  });

  it("returns true for a valid minimal DemoScript", () => {
    expect(
      validateDemoScript({ id: "test", title: "Test", steps: [] })
    ).toBe(true);
  });

  it("returns true for a valid DemoScript with steps", () => {
    const script = {
      id: "demo-1",
      title: "My Demo",
      steps: [
        { id: "step-1", caption: "First" },
        { id: "step-2", caption: "Second" },
      ],
    };
    expect(validateDemoScript(script)).toBe(true);
  });

  it("returns false when loop is not a boolean", () => {
    expect(
      validateDemoScript({
        id: "test",
        title: "Test",
        steps: [],
        loop: "yes",
      })
    ).toBe(false);
  });

  it("returns true when theme is valid", () => {
    expect(
      validateDemoScript({
        id: "test",
        title: "Test",
        steps: [],
        theme: { accent: "#3b82f6", bg: "#0a0a0a" },
      })
    ).toBe(true);
  });

  it("returns false when theme has invalid accent type", () => {
    expect(
      validateDemoScript({
        id: "test",
        title: "Test",
        steps: [],
        theme: { accent: 123 },
      })
    ).toBe(false);
  });

  it("acts as a type guard — script is typed as DemoScript after validation", () => {
    const unknown: unknown = {
      id: "test",
      title: "Test",
      steps: [{ id: "s1" }],
    };
    if (validateDemoScript(unknown)) {
      // TypeScript narrows to DemoScript
      expect(unknown.id).toBe("test");
      expect(unknown.steps[0].id).toBe("s1");
    }
  });
});

describe("getDemoStep()", () => {
  const script: DemoScript = {
    id: "test",
    title: "Test",
    steps: [
      { id: "step-0", caption: "First step" },
      { id: "step-1", caption: "Second step" },
      { id: "step-2", caption: "Third step" },
    ],
  };

  it("returns the step at the given index", () => {
    expect(getDemoStep(script, 0)).toEqual({
      id: "step-0",
      caption: "First step",
    });
    expect(getDemoStep(script, 1)).toEqual({
      id: "step-1",
      caption: "Second step",
    });
    expect(getDemoStep(script, 2)).toEqual({
      id: "step-2",
      caption: "Third step",
    });
  });

  it("returns undefined for an out-of-bounds index", () => {
    expect(getDemoStep(script, 99)).toBeUndefined();
    expect(getDemoStep(script, -1)).toBeUndefined();
  });

  it("returns undefined for an empty steps array", () => {
    const empty: DemoScript = { id: "x", title: "Empty", steps: [] };
    expect(getDemoStep(empty, 0)).toBeUndefined();
  });

  it("returns the first step for index 0", () => {
    const step = getDemoStep(script, 0);
    expect(step).toBeDefined();
    expect(step!.id).toBe("step-0");
  });
});
