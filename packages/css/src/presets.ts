/**
 * @cue-vin/css — Curated motion presets
 *
 * Named combinations of cue's CSS technique classes, tuned for common website
 * archetypes. Each preset bundles a tasteful set of entrance / ambient / hover
 * utilities, a list of techniques that clash with the preset's vibe (and must
 * be avoided), recommended CSS variable values, and a one-line description.
 *
 * Usage:
 *   import { presets } from "@cue-vin/css";
 *   const launch = presets["saas-launch"];
 *   // → apply launch.techniques to elements, set launch.css_vars on :root,
 *   //   and treat launch.avoid as a deny-list.
 *
 * These presets are advisory: cue's CSS still works standalone. The presets
 * exist so agents and developers don't have to re-derive a coherent motion
 * language for every new project.
 */

export type CuePreset = {
  /** Class names recommended for this preset. */
  techniques: string[];
  /** Class names that clash with the preset's vibe — do not combine. */
  avoid: string[];
  /** Recommended values for cue's CSS custom properties. */
  css_vars: Record<string, string>;
  /** One sentence: when to reach for this preset. */
  description: string;
};

export const presets: Record<string, CuePreset> = {
  /**
   * saas-launch
   * Premium product launch page: theatrical hero, staggered feature grid,
   * hover-driven CTA glow. Polished but never gaudy — accessibility preserved
   * via cue's built-in prefers-reduced-motion handling.
   */
  "saas-launch": {
    techniques: [
      // Hero — theatrical materialisation
      "cue-cinematic",
      // Primary entrance for above-the-fold content
      "cue-enter",
      "cue-enter-fade",
      // Feature grid stagger (apply cue-enter + cue-stagger-N to each card)
      "cue-stagger-1",
      "cue-stagger-2",
      "cue-stagger-3",
      "cue-stagger-4",
      // Tunable rise for secondary reveals
      "fx-rise",
      // CTA — hover-driven ambient glow (not constant motion)
      "cue-ambient",
      "cue-group",
      "cue-hover-glow",
      "cue-hover-lift",
    ],
    avoid: [
      // Playful spring overshoot cheapens the premium hero
      "cue-enter-bounce",
      // Error-state judder; never on a launch page
      "cue-shake",
      // Constant logo scroller competes with the hero for attention
      "cue-marquee",
      "cue-marquee-track",
      // Mechanical infinite spin reads as "loading", not "launched"
      "cue-spinner",
    ],
    css_vars: {
      "--cue-duration-normal": "350ms",
      "--cue-duration-slow": "600ms",
      "--cue-color-accent": "#3b82f6",
      "--cue-color-glow": "rgba(59, 130, 246, 0.4)",
      "--fx-duration": "400ms",
      "--fx-y": "20px",
      "--fx-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
    },
    description:
      "For SaaS product launch pages — cinematic hero, staggered feature grid, hover-glow CTA; premium but accessible.",
  },

  /**
   * enterprise
   * Internal tools, dashboards, B2B control planes. Restrained motion: short
   * fades, no bounce, no infinite loops. Designed to feel professional even
   * after 8 hours of daily use.
   */
  enterprise: {
    techniques: [
      // Subtle entrance — fade only, no transform overshoot
      "cue-enter-fade",
      // Mild directional entrance for section changes
      "cue-enter-slide-down",
      // Tunable fade for progressive disclosure panels
      "fx-fade-in",
      // Step transitions for wizards / multi-step flows
      "cue-step-enter",
      "cue-step-enter-active",
      "cue-step-exit",
      "cue-step-exit-active",
      // Hover affordances — subtle
      "cue-hover-lift",
      "cue-hover-scale",
    ],
    avoid: [
      // Spring overshoot is too playful for enterprise UI
      "cue-enter-bounce",
      "cue-enter-scale",
      // 2.2s theatrical reveal is inappropriate for a working dashboard
      "cue-cinematic",
      // Error / jarring motion
      "cue-shake",
      // All infinite loops — enterprise UIs must not drain attention
      "cue-spinner",
      "cue-glow",
      "cue-pulse",
      "cue-marquee",
      "cue-marquee-track",
    ],
    css_vars: {
      "--cue-duration-fast": "120ms",
      "--cue-duration-normal": "200ms",
      "--cue-duration-slow": "300ms",
      "--cue-color-accent": "#2563eb",
      "--cue-color-glow": "rgba(37, 99, 235, 0.25)",
      "--fx-duration": "200ms",
      "--fx-ease": "cubic-bezier(0.4, 0, 0.2, 1)",
      "--cue-step-duration": "250ms",
    },
    description:
      "For enterprise dashboards and internal tools — subtle fades, no bounce, no infinite loops; designed for all-day use.",
  },

  /**
   * indie-hacker
   * Landing pages for solo / small-team products. Energetic, fast, a little
   * scrappy. Logo marquee, bouncy entrances, bold directional slides. Not
   * polished to a mirror shine — that's the point.
   */
  "indie-hacker": {
    techniques: [
      // Signature: scrolling logo / testimonial strip
      "cue-marquee",
      "cue-marquee-track",
      // Bold, energetic entrances
      "cue-enter-bounce",
      "cue-enter-slide-left",
      "cue-enter-slide-right",
      "cue-enter",
      // Fast staggered grid
      "cue-stagger-1",
      "cue-stagger-2",
      "cue-stagger-3",
      // Tunable slide for hero copy
      "fx-slide-in",
      // Bold hover interaction
      "cue-hover-scale",
    ],
    avoid: [
      // 2.2s cinematic reveal kills the energetic pace
      "cue-cinematic",
      // Hover-gated ambient is too passive for an energetic landing page
      "cue-ambient",
      "cue-group",
      // Subtle ambient loops dilute the bold signal
      "cue-glow",
      "cue-pulse",
    ],
    css_vars: {
      "--cue-duration-fast": "100ms",
      "--cue-duration-normal": "200ms",
      "--cue-duration-slow": "350ms",
      "--cue-color-accent": "#f97316",
      "--cue-color-glow": "rgba(249, 115, 22, 0.45)",
      "--cue-marquee-duration": "22s",
      "--fx-duration": "200ms",
      "--fx-x": "32px",
      "--fx-ease": "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
    description:
      "For indie-hacker landing pages — marquee logos, bouncy entrances, bold directional slides; energetic and scrappy.",
  },

  /**
   * portfolio
   * Personal portfolio, design studio, photography site. Slow, intentional,
   * cinematic scroll-reveals. Minimal motion vocabulary — let the work breathe.
   */
  portfolio: {
    techniques: [
      // Signature: long, theatrical materialisation on the hero
      "cue-cinematic",
      // Slow fades for body and supporting copy
      "cue-enter-fade",
      // Tunable rise for case-study cards (slow, intentional)
      "fx-rise",
      "fx-fade-in",
      // Long stagger for grid reveals
      "cue-stagger-2",
      "cue-stagger-4",
      "cue-stagger-6",
      // Subtle hover affordance only
      "cue-hover-lift",
    ],
    avoid: [
      // Spring bounce is too playful for a minimal portfolio
      "cue-enter-bounce",
      // Directional slides break the vertical scroll-reveal feel
      "cue-enter-slide-left",
      "cue-enter-slide-right",
      // Constant marquee motion shatters the contemplative pace
      "cue-marquee",
      "cue-marquee-track",
      // Mechanical spinners / judders have no place here
      "cue-spinner",
      "cue-shake",
    ],
    css_vars: {
      "--cue-duration-normal": "500ms",
      "--cue-duration-slow": "800ms",
      "--cue-duration-glacial": "1200ms",
      "--cue-color-accent": "#e5e5e5",
      "--cue-color-glow": "rgba(255, 255, 255, 0.15)",
      "--fx-duration": "700ms",
      "--fx-y": "32px",
      "--fx-ease": "cubic-bezier(0.22, 1, 0.36, 1)",
    },
    description:
      "For portfolios and studio sites — cinematic scroll-reveals, slow and intentional, minimal motion vocabulary.",
  },
};
