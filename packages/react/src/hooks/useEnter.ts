import { useEffect, useRef } from "react";

/** Options for the useEnter hook. */
export interface UseEnterOptions {
  /** Delay in milliseconds before applying the enter animation. Default: 0. */
  delay?: number;
  /** Whether the enter animation should play. Default: true. */
  enabled?: boolean;
}

/** Hook that applies a fade-in enter animation to a ref element. */
export function useEnter(options: UseEnterOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const { delay = 0, enabled = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    el.style.opacity = "0";
    el.style.transition = `opacity 0.4s var(--cue-ease-out, ease-out) ${delay}ms`;

    const timer = setTimeout(() => {
      el.style.opacity = "1";
    }, 20);

    return () => clearTimeout(timer);
  }, [delay, enabled]);

  return ref;
}
