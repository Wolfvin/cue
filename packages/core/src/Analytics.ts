/** Event types that can be tracked during a demo session. */
export type CueEventType =
  | "demo_start"
  | "demo_complete"
  | "demo_exit"
  | "step_view"
  | "step_complete"
  | "hotspot_click"
  | "nav_prev"
  | "nav_next"
  | "nav_goto";

/** A single analytics event captured during a demo session. */
export interface CueEvent {
  /** The type of event that occurred. */
  type: CueEventType;
  /** Identifier of the demo this event belongs to. */
  demoId: string;
  /** Zero-indexed step number, when applicable. */
  step?: number;
  /** Identifier of the hotspot that was clicked, when applicable. */
  hotspotId?: string;
  /** Unix timestamp in milliseconds (Date.now()). */
  timestamp: number;
  /** Random identifier for the viewer session. */
  sessionId: string;
}

/** Configuration for creating a CueAnalytics instance. */
export interface CueAnalyticsConfig {
  /** Identifier of the demo being tracked. */
  demoId: string;
  /** URL endpoint to POST events to (optional, fire-and-forget). */
  endpoint?: string;
  /** Custom callback invoked for every tracked event. */
  onEvent?: (event: CueEvent) => void;
  /** Whether to log events to console.log. Default: false. */
  console?: boolean;
}

/** Summary of a demo viewing session. */
export interface CueSummary {
  /** Identifier of the demo. */
  demoId: string;
  /** Session identifier. */
  sessionId: string;
  /** Number of unique steps viewed during the session. */
  totalStepsViewed: number;
  /** Completion rate as a fraction between 0 and 1. */
  completionRate: number;
  /** All events recorded during the session. */
  events: CueEvent[];
}

/** Session tracker that records demo analytics events and forwards them to configured destinations. */
export class CueAnalytics {
  private readonly demoId: string;
  private readonly sessionId: string;
  private readonly config: CueAnalyticsConfig;
  private readonly events: CueEvent[] = [];
  private readonly viewedSteps: Set<number> = new Set();

  constructor(config: CueAnalyticsConfig) {
    this.config = config;
    this.demoId = config.demoId;
    this.sessionId =
      Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  /** Track an analytics event and dispatch it to all configured destinations. */
  track(type: CueEventType, extra?: Partial<CueEvent>): void {
    const event: CueEvent = {
      type,
      demoId: this.demoId,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...extra,
    };

    this.events.push(event);

    // Track unique steps viewed for completion calculation
    if (event.step !== undefined) {
      this.viewedSteps.add(event.step);
    }

    // Fire-and-forget POST to endpoint
    if (this.config.endpoint) {
      try {
        fetch(this.config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        }).catch(() => {
          /* intentionally swallowed — fire-and-forget */
        });
      } catch {
        /* fetch may throw synchronously in some environments; swallow */
      }
    }

    // Custom callback
    if (this.config.onEvent) {
      try {
        this.config.onEvent(event);
      } catch {
        /* don't let callback errors disrupt tracking */
      }
    }

    // Console logging
    if (this.config.console) {
      // eslint-disable-next-line no-console
      console.log("[CueAnalytics]", event);
    }
  }

  /** Return the session identifier for this analytics instance. */
  getSession(): string {
    return this.sessionId;
  }

  /** Return a summary of the current session including events, steps viewed, and completion rate. */
  getSummary(): CueSummary {
    // Find total steps from demo_complete / step_complete events
    const stepCount = this.inferTotalSteps();

    return {
      demoId: this.demoId,
      sessionId: this.sessionId,
      totalStepsViewed: this.viewedSteps.size,
      completionRate:
        stepCount > 0 ? this.viewedSteps.size / stepCount : 0,
      events: [...this.events],
    };
  }

  /** Attempt to infer total number of steps from recorded events. */
  private inferTotalSteps(): number {
    // Look for the highest step index across all events
    let maxStep = -1;
    for (const event of this.events) {
      if (event.step !== undefined && event.step > maxStep) {
        maxStep = event.step;
      }
    }
    // If we saw step indices, total steps = max index + 1
    return maxStep >= 0 ? maxStep + 1 : 0;
  }
}
