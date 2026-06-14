import { useEffect, useRef } from "react";

/** Options for the useEnter hook. */
export interface UseEnterOptions {
  /** Delay in milliseconds before applying the enter animation. Default: 0. */
  delay?: number;
  /** Whether the enter animation should play. Default: true. */
  enabled?: boolean;
  /** Enter animation variant. Default: "fade". */
  variant?: "fade" | "slide-up" | "scale";
  /** Duration of the animation in milliseconds. Default: 400. */
  duration?: number;
}

/** Hook that applies an enter animation to a ref element on mount. */
export function useEnter(options: UseEnterOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const { delay = 0, enabled = true, variant = "fade", duration = 400 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    // Set initial hidden state
    el.style.opacity = "0";
    if (variant === "slide-up") {
      el.style.transform = "translateY(16px)";
    } else if (variant === "scale") {
      el.style.transform = "scale(0.92)";
    }

    // Apply transition properties
    el.style.transitionProperty = "opacity, transform";
    el.style.transitionDuration = `${duration}ms`;
    el.style.transitionTimingFunction = "cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.transitionDelay = `${delay}ms`;

    // Trigger enter on next frame
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    });

    return () => cancelAnimationFrame(timer);
  }, [delay, enabled, variant, duration]);

  return ref;
}
