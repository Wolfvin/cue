import { useEffect, useRef, useState } from "react";

/** Options for the useStagger hook. */
export interface UseStaggerOptions {
  /** Number of items to stagger. */
  count: number;
  /** Delay in milliseconds between each item. Default: 100. */
  interval?: number;
  /** Whether the stagger animation should play. Default: true. */
  enabled?: boolean;
}

/** Hook that returns an array of boolean flags, each becoming true with a stagger delay. */
export function useStagger(options: UseStaggerOptions): boolean[] {
  const { count, interval = 100, enabled = true } = options;
  const [visible, setVisible] = useState<boolean[]>(() =>
    enabled ? Array(count).fill(false) : Array(count).fill(true)
  );
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!enabled) {
      setVisible(Array(count).fill(true));
      return;
    }

    setVisible(Array(count).fill(false));
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    for (let i = 0; i < count; i++) {
      const timer = setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * interval);
      timersRef.current.push(timer);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [count, interval, enabled]);

  return visible;
}
