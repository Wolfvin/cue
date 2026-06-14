import { describe, it, expect, vi } from "vitest";
import { StateMachine } from "../StateMachine";

describe("StateMachine", () => {
  it("addScene() adds scenes and sceneCount reflects the count", () => {
    const sm = new StateMachine();
    expect(sm.sceneCount).toBe(0);

    sm.addScene({ id: "intro" });
    sm.addScene({ id: "main" });
    sm.addScene({ id: "outro" });

    expect(sm.sceneCount).toBe(3);
    expect(sm.sceneIds).toEqual(["intro", "main", "outro"]);
  });

  it("start() transitions to the first scene and calls onEnter", () => {
    const onEnter = vi.fn();
    const onTransition = vi.fn();
    const sm = new StateMachine({ onTransition });
    sm.addScene({ id: "scene-1", onEnter });
    sm.addScene({ id: "scene-2" });

    sm.start();

    expect(sm.isStarted).toBe(true);
    expect(sm.currentId).toBe("scene-1");
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onTransition).toHaveBeenCalledWith({ from: null, to: "scene-1" });
  });

  it("next() advances to the next scene", () => {
    const sm = new StateMachine();
    sm.addScene({ id: "a" });
    sm.addScene({ id: "b" });
    sm.addScene({ id: "c" });

    sm.start();
    expect(sm.currentId).toBe("a");

    sm.next();
    expect(sm.currentId).toBe("b");

    sm.next();
    expect(sm.currentId).toBe("c");
  });

  it("prev() goes back to the previous scene", () => {
    const sm = new StateMachine();
    sm.addScene({ id: "x" });
    sm.addScene({ id: "y" });
    sm.addScene({ id: "z" });

    sm.start();
    sm.next();
    sm.next();
    expect(sm.currentId).toBe("z");

    sm.prev();
    expect(sm.currentId).toBe("y");

    sm.prev();
    expect(sm.currentId).toBe("x");
  });

  it("goTo(id) jumps to a specific scene by id", () => {
    const onEnter = vi.fn();
    const sm = new StateMachine();
    sm.addScene({ id: "alpha" });
    sm.addScene({ id: "beta" });
    sm.addScene({ id: "gamma", onEnter });

    sm.start();
    sm.goTo("gamma");

    expect(sm.currentId).toBe("gamma");
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("goTo() with unknown id is a no-op", () => {
    const sm = new StateMachine();
    sm.addScene({ id: "only" });
    sm.start();
    sm.goTo("nonexistent");

    expect(sm.currentId).toBe("only");
  });

  it("isStarted is false before start() and true after", () => {
    const sm = new StateMachine();
    sm.addScene({ id: "first" });
    expect(sm.isStarted).toBe(false);

    sm.start();
    expect(sm.isStarted).toBe(true);
  });

  it("isFinished is true when at the last scene", () => {
    const sm = new StateMachine();
    sm.addScene({ id: "first" });
    sm.addScene({ id: "last" });

    sm.start();
    expect(sm.isFinished).toBe(false);

    sm.next();
    expect(sm.isFinished).toBe(true);
  });

  it("next() loops back to the first scene when loop is true", () => {
    const sm = new StateMachine({ loop: true });
    sm.addScene({ id: "a" });
    sm.addScene({ id: "b" });

    sm.start();
    sm.next(); // now at b (last scene)
    expect(sm.currentId).toBe("b");

    sm.next(); // loops back to a
    expect(sm.currentId).toBe("a");
  });

  it("prev() is a no-op at the first scene", () => {
    const sm = new StateMachine();
    sm.addScene({ id: "first" });
    sm.start();
    sm.prev();
    expect(sm.currentId).toBe("first");
  });

  it("reset() returns the machine to before the first scene", () => {
    const sm = new StateMachine();
    sm.addScene({ id: "a" });
    sm.addScene({ id: "b" });

    sm.start();
    sm.next();
    expect(sm.isStarted).toBe(true);
    expect(sm.currentId).toBe("b");

    sm.reset();
    expect(sm.isStarted).toBe(false);
    expect(sm.current).toBeNull();
  });

  it("start() with no scenes is a no-op", () => {
    const sm = new StateMachine();
    sm.start();
    expect(sm.isStarted).toBe(false);
    expect(sm.current).toBeNull();
  });

  it("addScenes() adds multiple scenes at once", () => {
    const sm = new StateMachine();
    sm.addScenes([{ id: "x" }, { id: "y" }, { id: "z" }]);
    expect(sm.sceneCount).toBe(3);
    expect(sm.sceneIds).toEqual(["x", "y", "z"]);
  });

  it("next() when not started calls start()", () => {
    const sm = new StateMachine();
    sm.addScene({ id: "first" });
    sm.addScene({ id: "second" });

    // Calling next() before start() should auto-start
    sm.next();
    expect(sm.isStarted).toBe(true);
    expect(sm.currentId).toBe("first");
  });
});
