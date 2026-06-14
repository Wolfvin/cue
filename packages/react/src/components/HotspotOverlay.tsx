import { useState, useCallback } from "react";

/** A single hotspot with position, label, and visibility mode. */
export interface Hotspot {
  /** Unique identifier for this hotspot. */
  id: string;
  /** X position in pixels from the left edge of the container. */
  x: number;
  /** Y position in pixels from the top edge of the container. */
  y: number;
  /** Text displayed in the tooltip. */
  label: string;
  /** Whether the tooltip is always visible. Default: false. */
  alwaysShow?: boolean;
}

/** Props for the HotspotOverlay component. */
export interface HotspotOverlayProps {
  /** Array of hotspots to render. */
  hotspots: Hotspot[];
  /** Width of the container in pixels (used for edge detection). */
  containerWidth: number;
  /** Height of the container in pixels (used for edge detection). */
  containerHeight: number;
}

/** Overlay that renders pulsing hotspot dots with auto-flipping tooltips. */
export function HotspotOverlay({
  hotspots,
  containerWidth,
  containerHeight,
}: HotspotOverlayProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleMouseEnter = useCallback((id: string) => setHoveredId(id), []);
  const handleMouseLeave = useCallback(() => setHoveredId(null), []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5000,
      }}
    >
      {hotspots.map((hs) => (
        <HotspotDot
          key={hs.id}
          hotspot={hs}
          isHovered={hoveredId === hs.id}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />
      ))}
    </div>
  );
}

interface HotspotDotProps {
  hotspot: Hotspot;
  isHovered: boolean;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  containerWidth: number;
  containerHeight: number;
}

const DOT_SIZE = 12;
const PULSE_SIZE = 32;

function HotspotDot({
  hotspot,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  containerWidth,
  containerHeight,
}: HotspotDotProps) {
  const showTooltip = hotspot.alwaysShow || isHovered;

  // Determine flip direction: prefer bottom-right, flip if near edges
  const margin = 100;
  const flipRight = hotspot.x > containerWidth - margin;
  const flipBottom = hotspot.y > containerHeight - margin;

  // Tooltip position offset
  const tooltipLeft = flipRight ? -8 : DOT_SIZE + 4;
  const tooltipTop = flipBottom ? -8 : DOT_SIZE + 4;
  const anchorOrigin = flipRight ? "right" : "left";
  const verticalOrigin = flipBottom ? "bottom" : "top";

  return (
    <div
      onMouseEnter={() => onMouseEnter(hotspot.id)}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        left: hotspot.x - DOT_SIZE / 2,
        top: hotspot.y - DOT_SIZE / 2,
        pointerEvents: "auto",
        cursor: "pointer",
      }}
    >
      {/* Pulse ring */}
      <div
        style={{
          position: "absolute",
          left: DOT_SIZE / 2 - PULSE_SIZE / 2,
          top: DOT_SIZE / 2 - PULSE_SIZE / 2,
          width: PULSE_SIZE,
          height: PULSE_SIZE,
          borderRadius: "50%",
          background: "rgba(201, 28, 28, 0.3)",
          animation: "cue-hotspot-pulse 1.8s ease-out infinite",
        }}
      />
      {/* Solid dot */}
      <div
        style={{
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: "50%",
          background: "#C91C1C",
          border: "2px solid #fff",
          boxShadow: "0 0 0 1px rgba(201, 28, 28, 0.4)",
          position: "relative",
          zIndex: 1,
        }}
      />
      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltipLeft,
            top: tooltipTop,
            whiteSpace: "nowrap",
            background: "#1a1a1a",
            color: "#f5f5f5",
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 12,
            lineHeight: 1.4,
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #333",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            zIndex: 2,
            ...(anchorOrigin === "right" ? { transform: "translateX(-100%)" } : {}),
            ...(verticalOrigin === "bottom" ? { transform: `translateY(-100%)${anchorOrigin === "right" ? " translateX(-100%)" : ""}` } : {}),
          }}
        >
          {hotspot.label}
        </div>
      )}

      {/* Inject keyframes once via inline style element — only rendered by the first dot */}
      <style>{`
        @keyframes cue-hotspot-pulse {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
