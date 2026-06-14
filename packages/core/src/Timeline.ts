/** Timeline event entry with callback and timing metadata. */
export interface TimelineEntry {
  /** Unique identifier for this entry. */
  id: string;
  /** Delay in milliseconds before executing the callback. */
  delay: number;
  /** Callback to execute when the timer fires. */
  callback: () => void;
  /** Whether this entry has already been executed. */
  played: boolean;
}

/** Options for creating a Timeline instance. */
export interface TimelineOptions {
  /** Whether the timeline should loop after completing all entries. Default: false. */
  loop?: boolean;
  /** Delay in milliseconds between loop cycles. Default: 0. */
  loopDelay?: number;
  /** Callback invoked when the timeline completes a full cycle. */
  onComplete?: () => void;
}

/** Scheduler that sequences callbacks with setTimeout and provides cleanup. */
export class Timeline {
  private entries: TimelineEntry[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private _isPlaying = false;
  private loop: boolean;
  private loopDelay: number;
  private onComplete?: () => void;
  private counter = 0;

  constructor(options: TimelineOptions = {}) {
    this.loop = options.loop ?? false;
    this.loopDelay = options.loopDelay ?? 0;
    this.onComplete = options.onComplete;
  }

  /** Whether the timeline is currently playing. */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /** Add a callback to be executed after a specified delay. */
  add(delay: number, callback: () => void): string {
    const id = `cue-tl-${this.counter++}`;
    this.entries.push({ id, delay, callback, played: false });
    return id;
  }

  /** Remove an entry by its id. */
  remove(id: string): void {
    this.entries = this.entries.filter((e) => e.id !== id);
  }

  /** Start executing all entries in sequence. */
  play(): void {
    if (this._isPlaying) return;
    this._isPlaying = true;
    this.scheduleEntries();
  }

  /** Stop the timeline and clear all pending timers. */
  stop(): void {
    this._isPlaying = false;
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  /** Reset all entries to unplayed state and stop. */
  reset(): void {
    this.stop();
    this.entries.forEach((e) => (e.played = false));
  }

  /** Clean up all timers — call on unmount. */
  dispose(): void {
    this.stop();
    this.entries = [];
  }

  private scheduleEntries(): void {
    let cumulative = 0;
    for (const entry of this.entries) {
      if (entry.played) continue;
      cumulative += entry.delay;
      const timer = setTimeout(() => {
        entry.callback();
        entry.played = true;
        this.checkCompletion();
      }, cumulative);
      this.timers.push(timer);
    }
  }

  private checkCompletion(): void {
    const allPlayed = this.entries.every((e) => e.played);
    if (!allPlayed) return;
    this.onComplete?.();
    if (this.loop) {
      this.entries.forEach((e) => (e.played = false));
      const timer = setTimeout(() => {
        this.timers = [];
        this.scheduleEntries();
      }, this.loopDelay);
      this.timers.push(timer);
    } else {
      this._isPlaying = false;
    }
  }
}
