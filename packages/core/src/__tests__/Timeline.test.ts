import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Timeline } from "../Timeline";

describe("Timeline", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("can be constructed with default options", () => {
    const tl = new Timeline();
    expect(tl.isPlaying).toBe(false);
    expect(tl.length).toBe(0);
  });

  it("add() returns a unique id and increases length", () => {
    const tl = new Timeline();
    const id1 = tl.add(100, () => {});
    const id2 = tl.add(200, () => {});
    expect(typeof id1).toBe("string");
    expect(typeof id2).toBe("string");
    expect(id1).not.toBe(id2);
    expect(tl.length).toBe(2);
  });

  it("play() executes callbacks at the correct time", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const tl = new Timeline();
    tl.add(100, cb1);
    tl.add(200, cb2);

    tl.play();
    expect(tl.isPlaying).toBe(true);

    // At 99ms, nothing should have fired
    vi.advanceTimersByTime(99);
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();

    // At 100ms, cb1 fires
    vi.advanceTimersByTime(1);
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).not.toHaveBeenCalled();

    // At 300ms (100+200), cb2 fires
    vi.advanceTimersByTime(200);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it("stop() halts the timeline and prevents future callbacks", () => {
    const cb = vi.fn();
    const tl = new Timeline();
    tl.add(500, cb);

    tl.play();
    vi.advanceTimersByTime(200);
    tl.stop();

    expect(tl.isPlaying).toBe(false);

    // Advance past the original fire time — callback should NOT fire
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();
  });

  it("remove(id) deletes an entry and returns true; returns false for missing id", () => {
    const tl = new Timeline();
    const id = tl.add(100, () => {});
    expect(tl.length).toBe(1);

    const removed = tl.remove(id);
    expect(removed).toBe(true);
    expect(tl.length).toBe(0);

    // Removing again should return false
    const removedAgain = tl.remove(id);
    expect(removedAgain).toBe(false);
  });

  it("play() is a no-op if already playing", () => {
    const cb = vi.fn();
    const tl = new Timeline();
    tl.add(100, cb);

    tl.play();
    tl.play(); // second call should be no-op
    expect(tl.isPlaying).toBe(true);

    vi.advanceTimersByTime(100);
    expect(cb).toHaveBeenCalledTimes(1); // not doubled
  });

  it("calls onComplete when all entries finish playing", () => {
    const onComplete = vi.fn();
    const tl = new Timeline({ onComplete });
    tl.add(50, () => {});
    tl.add(50, () => {});

    tl.play();
    vi.advanceTimersByTime(100);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("loops entries when loop option is true", () => {
    const cb = vi.fn();
    const tl = new Timeline({ loop: true, loopDelay: 0 });
    tl.add(100, cb);

    tl.play();
    vi.advanceTimersByTime(100);
    expect(cb).toHaveBeenCalledTimes(1);

    // The loop reschedules after completion: loopDelay (0ms) then full entry delay.
    // Fake timers need extra ticks to process the reschedule setTimeout chain,
    // so we advance generously to allow the second cycle to fire.
    vi.advanceTimersByTime(300);
    expect(cb.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("reset() marks all entries as unplayed and stops", () => {
    const cb = vi.fn();
    const tl = new Timeline();
    tl.add(50, cb);

    tl.play();
    vi.advanceTimersByTime(50);
    expect(cb).toHaveBeenCalledTimes(1);

    tl.reset();
    expect(tl.isPlaying).toBe(false);

    // After reset, play should fire callback again
    tl.play();
    vi.advanceTimersByTime(50);
    expect(cb).toHaveBeenCalledTimes(2);
  });
});
