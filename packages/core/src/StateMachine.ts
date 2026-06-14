/** A named scene with an optional onEnter callback. */
export interface Scene {
  /** Unique scene identifier. */
  id: string;
  /** Callback invoked when this scene becomes active. */
  onEnter?: () => void;
}

/** Transition event emitted when the state machine changes scenes. */
export interface TransitionEvent {
  /** Previous scene id, or null if entering the first scene. */
  from: string | null;
  /** New scene id. */
  to: string;
}

/** Options for creating a StateMachine instance. */
export interface StateMachineOptions {
  /** Whether the machine should loop back to the first scene after the last. Default: false. */
  loop?: boolean;
  /** Callback invoked on every scene transition. */
  onTransition?: (event: TransitionEvent) => void;
}

/** Scene-based state manager with sequential transitions and loop support. */
export class StateMachine {
  private scenes: Scene[] = [];
  private currentIndex = -1;
  private loop: boolean;
  private onTransition?: (event: TransitionEvent) => void;

  constructor(options: StateMachineOptions = {}) {
    this.loop = options.loop ?? false;
    this.onTransition = options.onTransition;
  }

  /** Current scene, or null if no scene is active. */
  get current(): Scene | null {
    return this.currentIndex >= 0 ? this.scenes[this.currentIndex] : null;
  }

  /** Current scene id, or null. */
  get currentId(): string | null {
    return this.current?.id ?? null;
  }

  /** All registered scene ids in order. */
  get sceneIds(): string[] {
    return this.scenes.map((s) => s.id);
  }

  /** Total number of registered scenes. */
  get sceneCount(): number {
    return this.scenes.length;
  }

  /** Whether the machine has reached the last scene. */
  get isFinished(): boolean {
    return this.scenes.length > 0 && this.currentIndex === this.scenes.length - 1;
  }

  /** Whether the machine has been started (any scene is active). */
  get isStarted(): boolean {
    return this.currentIndex >= 0;
  }

  /** Add a scene to the end of the sequence. */
  addScene(scene: Scene): void {
    this.scenes.push(scene);
  }

  /** Add multiple scenes at once. */
  addScenes(scenes: Scene[]): void {
    scenes.forEach((s) => this.addScene(s));
  }

  /** Transition to the first scene. */
  start(): void {
    if (this.scenes.length === 0) return;
    this.currentIndex = 0;
    const scene = this.scenes[0];
    const event: TransitionEvent = { from: null, to: scene.id };
    this.onTransition?.(event);
    scene.onEnter?.();
  }

  /** Transition to the next scene in sequence. Loops if configured. */
  next(): void {
    if (this.currentIndex < 0) {
      this.start();
      return;
    }
    const nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.scenes.length) {
      if (this.loop) {
        this.goTo(this.scenes[0].id);
      }
      return;
    }
    const from = this.scenes[this.currentIndex].id;
    this.currentIndex = nextIndex;
    const scene = this.scenes[this.currentIndex];
    const event: TransitionEvent = { from, to: scene.id };
    this.onTransition?.(event);
    scene.onEnter?.();
  }

  /** Jump to a specific scene by id. No-op if id not found. */
  goTo(id: string): void {
    const index = this.scenes.findIndex((s) => s.id === id);
    if (index < 0) return;
    const from = this.currentIndex >= 0 ? this.scenes[this.currentIndex].id : null;
    this.currentIndex = index;
    const scene = this.scenes[this.currentIndex];
    const event: TransitionEvent = { from, to: scene.id };
    this.onTransition?.(event);
    scene.onEnter?.();
  }

  /** Go back to the previous scene. No-op if at the first scene. */
  prev(): void {
    if (this.currentIndex <= 0) return;
    const from = this.scenes[this.currentIndex].id;
    this.currentIndex--;
    const scene = this.scenes[this.currentIndex];
    const event: TransitionEvent = { from, to: scene.id };
    this.onTransition?.(event);
    scene.onEnter?.();
  }

  /** Reset the machine to before the first scene. */
  reset(): void {
    this.currentIndex = -1;
  }
}
