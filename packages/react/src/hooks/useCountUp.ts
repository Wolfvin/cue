import { useEffect, useRef, useState } from "react";

/** Options for the useCountUp hook. */
export interface UseCountUpOptions {
  /** Target value to count up to. */
  target: number;
  /** Duration of the count-up animation in milliseconds. Default: 1200. */
  duration?: number;
  /** Whether the animation should play. Default: true. */
  enabled?: boolean;
  /** Number of decimal places. Default: 0. */
  decimals?: number;
  /** Easing function. Default: "ease-out-cubic". */
  easing?: "linear" | "ease-out-cubic" | "ease-out-expo";
}

/** Hook that animates a number counting up from 0 to a target value using requestAnimationFrame. */
export function useCountUp(options: UseCountUpOptions): number {
  const { target, duration = 1200, enabled = true, decimals = 0, easing = "ease-out-cubic" } = options;
  const [value, setValue] = useState(enabled ? 0 : target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }

    const startTime = performance.now();

    const ease = (t: number): number => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-out-expo":
          return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        case "ease-out-cubic":
        default:
          return 1 - Math.pow(1 - t, 3);
      }
    };

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = ease(progress);
      setValue(parseFloat((easedProgress * target).toFixed(decimals)));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled, decimals, easing]);

  return value;
}
