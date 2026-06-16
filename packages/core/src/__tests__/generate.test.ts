import { describe, it, expect } from "vitest";
import { generate, slugify } from "../generate";
import type { DemoScript } from "../DemoScript";

describe("generate()", () => {
  it("returns a valid DemoScript with correct id and title", () => {
    const script = generate({
      id: "my-demo",
      title: "My Demo",
      features: [],
    });

    expect(script.id).toBe("my-demo");
    expect(script.title).toBe("My Demo");
    expect(script.steps).toEqual([]);
    expect(script.loop).toBe(false);
  });

  it("converts each feature into one DemoStep", () => {
    const script = generate({
      id: "test",
      title: "Test Demo",
      features: [
        { name: "Feature A", description: "Desc A" },
        { name: "Feature B", description: "Desc B" },
        { name: "Feature C", description: "Desc C" },
      ],
    });

    expect(script.steps).toHaveLength(3);
    expect(script.steps[0].caption).toBe("Desc A");
    expect(script.steps[1].caption).toBe("Desc B");
    expect(script.steps[2].caption).toBe("Desc C");
  });

  it("slugifies feature.name into step.id", () => {
    const script = generate({
      id: "test",
      title: "Test",
      features: [
        { name: "Upload File", description: "Upload" },
        { name: "API Integration", description: "Integrate" },
      ],
    });

    expect(script.steps[0].id).toBe("upload-file");
    expect(script.steps[1].id).toBe("api-integration");
  });

  it("sets duration to defaultDuration for steps without CTA", () => {
    const script = generate({
      id: "test",
      title: "Test",
      features: [
        { name: "Feature", description: "No CTA" },
      ],
      defaultDuration: 5000,
    });

    expect(script.steps[0].duration).toBe(5000);
  });

  it("sets duration to undefined for steps with a CTA", () => {
    const script = generate({
      id: "test",
      title: "Test",
      features: [
        {
          name: "Sign Up",
          description: "Register now",
          cta: { type: "button", label: "Get Started" },
        },
      ],
    });

    expect(script.steps[0].duration).toBeUndefined();
  });

  it("appends CTA caption to step.caption when CTA is present", () => {
    const script = generate({
      id: "test",
      title: "Test",
      features: [
        {
          name: "Sign Up",
          description: "Register now",
          cta: { type: "button", label: "Get Started" },
        },
        {
          name: "Newsletter",
          description: "Stay updated",
          cta: { type: "email_capture", label: "Subscribe" },
        },
        {
          name: "Docs",
          description: "Read more",
          cta: { type: "link", label: "Visit", href: "https://example.com" },
        },
      ],
    });

    expect(script.steps[0].caption).toContain("[Get Started]");
    expect(script.steps[1].caption).toContain("[Subscribe]");
    expect(script.steps[2].caption).toContain("[Visit] → https://example.com");
  });

  it("attaches screenshotPath as step.screen when provided", () => {
    const script = generate({
      id: "test",
      title: "Test",
      features: [
        {
          name: "Dashboard",
          description: "Overview",
          screenshotPath: "./screenshots/dash.png",
        },
      ],
    });

    expect(script.steps[0].screen).toBe("./screenshots/dash.png");
  });

  it("builds hotspots with derived ids", () => {
    const script = generate({
      id: "test",
      title: "Test",
      features: [
        {
          name: "Feature",
          description: "Has hotspots",
          hotspots: [
            { label: "Revenue", x: 0.25, y: 0.3 },
            { label: "Users", x: 0.5, y: 0.6 },
          ],
        },
      ],
    });

    expect(script.steps[0].hotspots).toHaveLength(2);
    expect(script.steps[0].hotspots![0].id).toBe("feature-hotspot-0");
    expect(script.steps[0].hotspots![1].id).toBe("feature-hotspot-1");
    expect(script.steps[0].hotspots![0].label).toBe("Revenue");
  });

  it("applies theme when provided", () => {
    const script = generate({
      id: "test",
      title: "Test",
      features: [],
      theme: { accent: "#3b82f6", bg: "#0a0a0a" },
    });

    expect(script.theme).toEqual({ accent: "#3b82f6", bg: "#0a0a0a" });
  });

  it("does not include theme when not provided", () => {
    const script = generate({
      id: "test",
      title: "Test",
      features: [],
    });

    expect(script.theme).toBeUndefined();
  });

  // ── Input validation (Closes #67, #68, #69) ────────────────────────────

  it("throws when id is missing", () => {
    expect(() =>
      generate({ title: "Demo", features: [] } as any)
    ).toThrow(/non-empty string.*'id'/i);
  });

  it("throws when id is empty string", () => {
    expect(() =>
      generate({ id: "", title: "Demo", features: [] })
    ).toThrow(/non-empty string.*'id'/i);
  });

  it("throws when id is whitespace-only", () => {
    expect(() =>
      generate({ id: "   ", title: "Demo", features: [] })
    ).toThrow(/non-empty string.*'id'/i);
  });

  it("throws when title is missing", () => {
    expect(() =>
      generate({ id: "demo", features: [] } as any)
    ).toThrow(/non-empty string.*'title'/i);
  });

  it("throws when title is empty string", () => {
    expect(() =>
      generate({ id: "demo", title: "", features: [] })
    ).toThrow(/non-empty string.*'title'/i);
  });

  it("throws when features is missing (not TypeError)", () => {
    expect(() =>
      generate({ id: "demo", title: "Demo" } as any)
    ).not.toThrow(TypeError);
    expect(() =>
      generate({ id: "demo", title: "Demo" } as any)
    ).toThrow(/features.*array/i);
  });

  it("throws when features is not an array", () => {
    expect(() =>
      generate({ id: "demo", title: "Demo", features: "bad" } as any)
    ).toThrow(/features.*array/i);
  });

  it("throws when feature.name slugifies to empty string", () => {
    expect(() =>
      generate({
        id: "demo",
        title: "Demo",
        features: [{ name: "---", description: "desc" }],
      })
    ).toThrow(/empty step id.*slugification/i);
  });

  it("includes original feature name in slugify error", () => {
    expect(() =>
      generate({
        id: "demo",
        title: "Demo",
        features: [{ name: "!!!", description: "desc" }],
      })
    ).toThrow(/!!!/);
  });
});

describe("slugify()", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("Upload File")).toBe("upload-file");
  });

  it("removes special characters", () => {
    expect(slugify("2FA Login!")).toBe("2fa-login");
  });

  it("converts to lowercase", () => {
    expect(slugify("API Integration")).toBe("api-integration");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("Hello   World")).toBe("hello-world");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --hello--  ")).toBe("hello");
  });

  it("replaces underscores with hyphens", () => {
    expect(slugify("my_feature_name")).toBe("my-feature-name");
  });
});
