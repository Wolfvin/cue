/** Options for creating a ScrollTrigger instance. */
export interface ScrollTriggerOptions {
  /** CSS selector or Element to observe. */
  target: string | Element;
  /** Intersection threshold (0–1). Default: 0.1. */
  threshold?: number;
  /** Root margin string for the observer. Default: "0px". */
  rootMargin?: string;
  /** Callback invoked when the target enters the viewport. */
  onEnter: () => void;
  /** Callback invoked when the target exits the viewport. */
  onLeave?: () => void;
  /** Whether to trigger only once. Default: true. */
  once?: boolean;
}

/** IntersectionObserver wrapper with threshold, rootMargin, and played-guard. */
export class ScrollTrigger {
  private observer: IntersectionObserver | null = null;
  private played = false;
  private options: Required<Pick<ScrollTriggerOptions, "threshold" | "rootMargin" | "once">> &
    Pick<ScrollTriggerOptions, "onEnter" | "onLeave">;
  private target: string | Element;

  constructor(options: ScrollTriggerOptions) {
    this.target = options.target;
    this.options = {
      threshold: options.threshold ?? 0.1,
      rootMargin: options.rootMargin ?? "0px",
      once: options.once ?? true,
      onEnter: options.onEnter,
      onLeave: options.onLeave ?? (() => {}),
    };
  }

  /** Whether the trigger has already fired (when once=true). */
  get hasPlayed(): boolean {
    return this.played;
  }

  /** Start observing the target element. */
  observe(): void {
    if (this.observer) return;
    const element =
      this.target instanceof Element ? this.target : document.querySelector(this.target);
    if (!element) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (this.options.once && this.played) return;
            this.played = true;
            this.options.onEnter();
          } else {
            this.options.onLeave?.();
          }
        }
      },
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin,
      }
    );
    this.observer.observe(element);
  }

  /** Stop observing and disconnect the observer. */
  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  /** Reset the played guard so the trigger can fire again. */
  reset(): void {
    this.played = false;
  }

  /** Disconnect and reset — fully clean up. */
  dispose(): void {
    this.disconnect();
    this.played = false;
  }
}
