import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StateMachine } from "@cue-vin/core";

export interface UseDemoControllerOptions {
  steps: number;
  loop?: boolean;
  onStepChange?: (step: number) => void;
  enableKeyboard?: boolean;
  enableSwipe?: boolean;
}

export interface DemoController {
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  progress: number;
}

const SWIPE_MIN_DELTA = 50;

export function useDemoController(options: UseDemoControllerOptions): DemoController {
  const {
    steps,
    loop = false,
    onStepChange,
    enableKeyboard = true,
    enableSwipe = true,
  } = options;

  const [currentStep, setCurrentStep] = useState(0);
  const onStepChangeRef = useRef(onStepChange);
  onStepChangeRef.current = onStepChange;

  // Create a StateMachine instance that mirrors our step-based navigation.
  // We generate scene ids like "step-0", "step-1", etc. and sync the SM
  // with our React state so consumers get a React-friendly API while the
  // StateMachine handles transition semantics.
  const smRef = useRef<StateMachine | null>(null);

  if (smRef.current === null) {
    const sm = new StateMachine({
      loop,
      onTransition: (event) => {
        // Derive the new step index from the "to" scene id ("step-N").
        const match = event.to.match(/^step-(\d+)$/);
        if (match) {
          const step = parseInt(match[1], 10);
          setCurrentStep(step);
          onStepChangeRef.current?.(step);
        }
      },
    });

    const scenes = Array.from({ length: steps }, (_, i) => ({
      id: `step-${i}`,
    }));
    sm.addScenes(scenes);

    smRef.current = sm;
  }

  // If steps count changes, rebuild the state machine
  const prevStepsRef = useRef(steps);
  useEffect(() => {
    if (prevStepsRef.current !== steps) {
      const sm = new StateMachine({
        loop,
        onTransition: (event) => {
          const match = event.to.match(/^step-(\d+)$/);
          if (match) {
            const step = parseInt(match[1], 10);
            setCurrentStep(step);
            onStepChangeRef.current?.(step);
          }
        },
      });

      const scenes = Array.from({ length: steps }, (_, i) => ({
        id: `step-${i}`,
      }));
      sm.addScenes(scenes);

      smRef.current = sm;
      setCurrentStep(0);
      prevStepsRef.current = steps;
    }
  }, [steps, loop]);

  const next = useCallback(() => {
    const sm = smRef.current;
    if (!sm) return;
    if (!sm.isStarted) {
      sm.start();
      return;
    }
    sm.next();
  }, []);

  const prev = useCallback(() => {
    const sm = smRef.current;
    if (!sm) return;
    sm.prev();
  }, []);

  const goTo = useCallback(
    (step: number) => {
      const sm = smRef.current;
      if (!sm) return;
      if (step < 0 || step >= steps) return;
      sm.goTo(`step-${step}`);
    },
    [steps]
  );

  // Keyboard navigation (← →)
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enableKeyboard, next, prev]);

  // Touch swipe detection
  useEffect(() => {
    if (!enableSwipe) return;

    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;

      if (Math.abs(deltaX) >= SWIPE_MIN_DELTA) {
        if (deltaX < 0) {
          // Swiped left → next
          next();
        } else {
          // Swiped right → prev
          prev();
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enableSwipe, next, prev]);

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps - 1;
  const progress = steps > 1 ? currentStep / (steps - 1) : 1;

  return useMemo(
    () => ({
      currentStep,
      totalSteps: steps,
      isFirst,
      isLast,
      next,
      prev,
      goTo,
      progress,
    }),
    [currentStep, steps, isFirst, isLast, next, prev, goTo, progress]
  );
}
