/** Position and state of a scripted pointer. */
export interface PointerState {
  /** X coordinate in pixels. */
  x: number;
  /** Y coordinate in pixels. */
  y: number;
  /** Whether the pointer is in clicking state. */
  clicking: boolean;
  /** CSS transition duration string, e.g. "0.4s". */
  transition: string;
}

/** A single keyframe in a pointer script. */
export interface PointerKeyframe {
  /** Target X coordinate. */
  x: number;
  /** Target Y coordinate. */
  y: number;
  /** Duration of the transition in milliseconds. */
  duration?: number;
  /** Whether to simulate a click at this keyframe. */
  click?: boolean;
  /** Delay before moving to this keyframe in milliseconds. */
  delay?: number;
}

/** Options for creating a Pointer instance. */
export interface PointerOptions {
  /** Starting X coordinate. Default: 0. */
  startX?: number;
  /** Starting Y coordinate. Default: 0. */
  startY?: number;
  /** Default transition duration in milliseconds. Default: 400. */
  defaultDuration?: number;
  /** Callback invoked whenever pointer state changes. */
  onChange?: (state: PointerState) => void;
}

/** Scripted pointer that drives cursor position and click state. */
export class Pointer {
  private state: PointerState;
  private defaultDuration: number;
  private onChange?: (state: PointerState) => void;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private _isRunning = false;

  constructor(options: PointerOptions = {}) {
    this.state = {
      x: options.startX ?? 0,
      y: options.startY ?? 0,
      clicking: false,
      transition: `${options.defaultDuration ?? 400}ms`,
    };
    this.defaultDuration = options.defaultDuration ?? 400;
    this.onChange = options.onChange;
  }

  /** Current pointer state snapshot. */
  get current(): PointerState {
    return { ...this.state };
  }

  /** Whether the pointer script is currently running. */
  get isRunning(): boolean {
    return this._isRunning;
  }

  /** Move pointer to a specific position with optional duration. */
  moveTo(x: number, y: number, duration?: number): void {
    const ms = duration ?? this.defaultDuration;
    this.state.transition = `${ms}ms`;
    this.state.x = x;
    this.state.y = y;
    this.emit();
  }

  /** Simulate a click at the current position. */
  click(duration = 150): void {
    this.state.clicking = true;
    this.emit();
    const timer = setTimeout(() => {
      this.state.clicking = false;
      this.emit();
    }, duration);
    this.timers.push(timer);
  }

  /** Play a sequence of keyframes. */
  play(keyframes: PointerKeyframe[]): void {
    if (this._isRunning) return;
    this._isRunning = true;
    let cumulative = 0;
    for (const kf of keyframes) {
      cumulative += kf.delay ?? 0;
      const moveAfter = cumulative;
      const moveTimer = setTimeout(() => {
        this.moveTo(kf.x, kf.y, kf.duration);
        if (kf.click) {
          const clickTimer = setTimeout(() => this.click(), (kf.duration ?? this.defaultDuration));
          this.timers.push(clickTimer);
        }
      }, moveAfter);
      this.timers.push(moveTimer);
      cumulative += kf.duration ?? this.defaultDuration;
    }
    const endTimer = setTimeout(() => {
      this._isRunning = false;
    }, cumulative + 50);
    this.timers.push(endTimer);
  }

  /** Stop all pending pointer movements. */
  stop(): void {
    this._isRunning = false;
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  /** Reset pointer to initial position and clear state. */
  reset(x = 0, y = 0): void {
    this.stop();
    this.state = { x, y, clicking: false, transition: `${this.defaultDuration}ms` };
    this.emit();
  }

  /** Clean up all timers — call on unmount. */
  dispose(): void {
    this.stop();
  }

  private emit(): void {
    this.onChange?.(this.current);
  }
}
