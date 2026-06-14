/** Arrow annotation pointing from (x1,y1) to (x2,y2). */
export type AnnotationArrow = {
  type: "arrow";
  /** Start X coordinate. */
  x1: number;
  /** Start Y coordinate. */
  y1: number;
  /** End X coordinate. */
  x2: number;
  /** End Y coordinate. */
  y2: number;
  /** Stroke color. Default: "#3b82f6". */
  color?: string;
};

/** Highlight box annotation with optional label. */
export type AnnotationBox = {
  type: "box";
  /** Top-left X coordinate. */
  x: number;
  /** Top-left Y coordinate. */
  y: number;
  /** Width in pixels. */
  w: number;
  /** Height in pixels. */
  h: number;
  /** Stroke color. Default: "#3b82f6". */
  color?: string;
  /** Optional label displayed above the box. */
  label?: string;
};

/** Text callout annotation with background for readability. */
export type AnnotationText = {
  type: "text";
  /** X coordinate of the text anchor. */
  x: number;
  /** Y coordinate of the text anchor (baseline). */
  y: number;
  /** Text content to display. */
  content: string;
  /** Font size in pixels. Default: 13. */
  size?: number;
};

/** Union type for all annotation variants. */
export type Annotation = AnnotationArrow | AnnotationBox | AnnotationText;

/** Props for the AnnotationLayer component. */
export interface AnnotationLayerProps {
  /** Array of annotations to render over the container. */
  annotations: Annotation[];
}

/** SVG overlay that renders arrows, highlight boxes, and text callouts on top of a container. */
export function AnnotationLayer({ annotations }: AnnotationLayerProps) {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5000,
      }}
    >
      <defs>
        <marker
          id="cue-arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="var(--cue-arrow-color, #3b82f6)" />
        </marker>
      </defs>

      {annotations.map((ann, i) => {
        switch (ann.type) {
          case "arrow":
            return <ArrowAnnotation key={i} annotation={ann} />;
          case "box":
            return <BoxAnnotation key={i} annotation={ann} />;
          case "text":
            return <TextAnnotation key={i} annotation={ann} />;
          default:
            return null;
        }
      })}
    </svg>
  );
}

const ARROW_COLOR = "#3b82f6";

function ArrowAnnotation({ annotation }: { annotation: AnnotationArrow }) {
  const color = annotation.color ?? ARROW_COLOR;
  return (
    <line
      x1={annotation.x1}
      y1={annotation.y1}
      x2={annotation.x2}
      y2={annotation.y2}
      stroke={color}
      strokeWidth={2}
      markerEnd="url(#cue-arrowhead)"
      style={{ "--cue-arrow-color": color } as React.CSSProperties}
    />
  );
}

function BoxAnnotation({ annotation }: { annotation: AnnotationBox }) {
  const color = annotation.color ?? ARROW_COLOR;
  return (
    <g>
      <rect
        x={annotation.x}
        y={annotation.y}
        width={annotation.w}
        height={annotation.h}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray="6 3"
        rx={4}
      />
      {annotation.label && (
        <text
          x={annotation.x}
          y={annotation.y - 6}
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize={12}
          fontWeight={600}
          fill={color}
        >
          {annotation.label}
        </text>
      )}
    </g>
  );
}

function TextAnnotation({ annotation }: { annotation: AnnotationText }) {
  const size = annotation.size ?? 13;
  const padding = 6;
  // Estimate text width for background rect
  const charWidth = size * 0.6;
  const textWidth = annotation.content.length * charWidth + padding * 2;
  const textHeight = size + padding * 2;

  return (
    <g>
      {/* Background rect for readability */}
      <rect
        x={annotation.x - padding}
        y={annotation.y - size - padding + 2}
        width={textWidth}
        height={textHeight}
        rx={4}
        fill="rgba(0,0,0,0.7)"
      />
      <text
        x={annotation.x}
        y={annotation.y}
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize={size}
        fill="#f5f5f5"
      >
        {annotation.content}
      </text>
    </g>
  );
}
