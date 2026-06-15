import { useState, useEffect, useCallback, useRef } from "react";
import type { DemoScript, DemoStep, DemoHotspot, DemoAnnotation, PointerState } from "@cue-vin/core";
import { ScreenSlide } from "@cue-vin/react";
import { ScriptedPointer } from "@cue-vin/react";
import { HotspotOverlay } from "@cue-vin/react";
import { AnnotationLayer } from "@cue-vin/react";
import { StepProgress } from "@cue-vin/react";
import { ChapterNav } from "@cue-vin/react";

/** Props for the CuePlayer component. */
export interface CuePlayerProps {
  /** DemoScript configuration to render. */
  script: DemoScript;
  /** Player width in pixels. Default: 840. */
  width?: number;
  /** Player height in pixels. Default: 520. */
  height?: number;
  /** Whether to auto-advance steps via step.duration. Default: false. */
  autoPlay?: boolean;
  /** Whether to loop back to step 0 after the last step. Default: false. */
  loop?: boolean;
  /** Callback fired when the demo reaches the last step and cannot advance. */
  onComplete?: () => void;
  /** Callback fired whenever the current step changes. */
  onStepChange?: (step: number, total: number) => void;
}

/** Convert fraction-based pointer coords (0–1) to pixel coords relative to the slide. */
function fracToPx(
  frac: { x: number; y: number },
  width: number,
  height: number
) {
  return { x: frac.x * width, y: frac.y * height };
}

/** Convert DemoHotspot (fraction-based) to pixel-based Hotspot for HotspotOverlay. */
function toPixelHotspots(
  hotspots: DemoHotspot[],
  width: number,
  height: number
) {
  return hotspots.map((hs) => ({
    id: hs.id,
    x: hs.x * width,
    y: hs.y * height,
    label: hs.label,
    alwaysShow: hs.alwaysShow,
  }));
}



/**
 * Standalone embeddable demo player that renders a DemoScript with
 * screenshot slides, pointer, hotspots, annotations, caption, progress,
 * and navigation controls.
 */
export function CuePlayer({
  script,
  width = 840,
  height = 520,
  autoPlay = false,
  loop = false,
  onComplete,
  onStepChange,
}: CuePlayerProps) {
  const total = script.steps.length;
  const [current, setCurrent] = useState(0);
  const [pointerState, setPointerState] = useState<PointerState | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step: DemoStep | undefined = script.steps[current];
  const prevStep: DemoStep | undefined =
    current > 0 ? script.steps[current - 1] : undefined;

  // Notify parent on step change
  useEffect(() => {
    onStepChange?.(current, total);
  }, [current, total, onStepChange]);

  // Compute pointer position with animation from previous step
  useEffect(() => {
    if (!step?.pointer) {
      setPointerState(null);
      return;
    }

    const target = fracToPx(step.pointer, width, height);
    const from = prevStep?.pointer
      ? fracToPx(prevStep.pointer, width, height)
      : target;

    // Start from previous position, animate to target in 600ms
    setPointerState({
      x: from.x,
      y: from.y,
      clicking: step.pointer.clicking ?? false,
      transition: "0ms",
    });

    // Trigger animation on next frame
    const raf = requestAnimationFrame(() => {
      setPointerState({
        x: target.x,
        y: target.y,
        clicking: step.pointer!.clicking ?? false,
        transition: "600ms",
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [current, step, prevStep, width, height]);

  // Auto-advance timer
  useEffect(() => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    if (autoPlay && step?.duration) {
      autoTimerRef.current = setTimeout(() => {
        if (current < total - 1) {
          setCurrent((c) => c + 1);
        } else if (loop) {
          setCurrent(0);
        } else {
          onComplete?.();
        }
      }, step.duration);
    }

    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
      }
    };
  }, [current, autoPlay, step?.duration, total, loop, onComplete]);

  const goNext = useCallback(() => {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
    } else if (loop) {
      setCurrent(0);
    } else {
      onComplete?.();
    }
  }, [current, total, loop, onComplete]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setCurrent((c) => c - 1);
    } else if (loop) {
      setCurrent(total - 1);
    }
  }, [current, total, loop]);

  const isLast = current === total - 1;
  const isFirst = current === 0;

  // Theme colors
  const accent = script.theme?.accent ?? "#C91C1C";
  const bg = script.theme?.bg ?? "#0a0a0a";

  return (
    <div
      style={{
        background: bg,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        overflow: "hidden",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        width: "fit-content",
      }}
    >
      {/* Slide area */}
      {step?.screen ? (
        <ScreenSlide src={step.screen} width={width} height={height}>
          {/* Pointer overlay */}
          {pointerState && (
            <ScriptedPointer state={pointerState} />
          )}

          {/* Hotspot overlay */}
          {step.hotspots && step.hotspots.length > 0 && (
            <HotspotOverlay
              hotspots={toPixelHotspots(step.hotspots, width, height)}
              containerWidth={width}
              containerHeight={height}
            />
          )}

          {/* Annotation overlay */}
          {step.annotations && step.annotations.length > 0 && (
            <AnnotationLayer
              annotations={step.annotations}
              containerWidth={width}
              containerHeight={height}
            />
          )}
        </ScreenSlide>
      ) : (
        <div
          style={{
            width,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B7280",
            fontSize: 14,
          }}
        >
          No screen for this step
        </div>
      )}

      {/* Caption bar */}
      {step?.caption && (
        <div
          style={{
            background: "#111",
            color: "#fff",
            padding: "8px 16px",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {step.caption}
        </div>
      )}

      {/* Controls area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "12px 16px",
        }}
      >
        <StepProgress current={current} total={total} variant="dots" />
        <ChapterNav
          onPrev={goPrev}
          onNext={goNext}
          isPrevDisabled={isFirst && !loop}
          isNextDisabled={isLast && !loop}
        />
      </div>

      {/* Inject accent color as CSS variable for child components */}
      <style>{`:root { --cue-accent: ${accent}; }`}</style>
    </div>
  );
}
