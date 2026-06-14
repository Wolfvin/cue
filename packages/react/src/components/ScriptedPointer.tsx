import { useRef, useEffect, useCallback, useState } from "react";
import type { PointerState } from "@cue/core";
import { Pointer } from "@cue/core";

/** Props for the ScriptedPointer component. */
export interface ScriptedPointerProps {
  /** Current pointer state driving position and click. */
  state: PointerState;
  /** Cursor size in pixels. Default: 24. */
  size?: number;
  /** Custom color for the cursor. Default: "#1a1a1a". */
  color?: string;
  /** Additional CSS class names. */
  className?: string;
}

/** SVG cursor with smooth CSS transition driven by PointerState. */
export function ScriptedPointer({
  state,
  size = 24,
  color = "#1a1a1a",
  className,
}: ScriptedPointerProps) {
  const half = size / 2;
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: state.x,
        top: state.y,
        transition: `left ${state.transition} ease-out, top ${state.transition} ease-out`,
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-2px, -2px)",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={state.clicking ? "#3b82f6" : color}
        style={{
          transition: "fill 0.1s ease",
          filter: state.clicking
            ? "drop-shadow(0 0 6px rgba(59,130,246,0.5))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
        }}
      >
        <path d="M5 2l14 10-6 2-2 6z" />
      </svg>
    </div>
  );
}
