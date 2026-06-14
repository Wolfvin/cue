import { useEffect, useRef, useState } from "react";

/** Options for the useScrollReveal hook. */
export interface UseScrollRevealOptions {
  /** Intersection threshold (0–1). Default: 0.1. */
  threshold?: number;
  /** Whether to trigger only once. Default: true. */
  once?: boolean;
}

/** Hook that returns a ref and a boolean indicating if the element is in the viewport. */
export function useScrollReveal(options: UseScrollRevealOptions = {}): [
  React.RefObject<HTMLDivElement | null>,
  boolean,
] {
  const { threshold = 0.1, once = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const playedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (once && playedRef.current) return;
            playedRef.current = true;
            setIsVisible(true);
          } else if (!once) {
            setIsVisible(false);
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, isVisible];
}
