import type {
  DemoAnnotation,
  ArrowAnnotation,
  BoxAnnotation,
  TextAnnotation,
} from "@cue-vin/core";

/** Props for the AnnotationLayer component. */
export interface AnnotationLayerProps {
  /** Array of annotations (fractional coordinates) to render over the container. */
  annotations: DemoAnnotation[];
  /** Container width in pixels — used to convert fractional X coords. */
  containerWidth: number;
  /** Container height in pixels — used to convert fractional Y coords. */
  containerHeight: number;
}

// Re-export the core types so consumers can import them from @cue-vin/react if desired.
export type {
  DemoAnnotation as Annotation,
  ArrowAnnotation,
  BoxAnnotation,
  TextAnnotation,
};

const DEFAULT_COLOR = "#3b82f6";

/** SVG overlay that renders arrows, highlight boxes, and text callouts on top of a container. */
export function AnnotationLayer({
  annotations,
  containerWidth,
  containerHeight,
}: AnnotationLayerProps) {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: containerWidth,
        height: containerHeight,
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
            return (
              <ArrowAnnotationSvg
                key={i}
                annotation={ann}
                w={containerWidth}
                h={containerHeight}
              />
            );
          case "box":
            return (
              <BoxAnnotationSvg
                key={i}
                annotation={ann}
                w={containerWidth}
                h={containerHeight}
              />
            );
          case "text":
            return (
              <TextAnnotationSvg
                key={i}
                annotation={ann}
                w={containerWidth}
                h={containerHeight}
              />
            );
          default:
            return null;
        }
      })}
    </svg>
  );
}

// ── Arrow ──────────────────────────────────────────────────────────────────────

function ArrowAnnotationSvg({
  annotation,
  w,
  h,
}: {
  annotation: ArrowAnnotation;
  w: number;
  h: number;
}) {
  const color = annotation.color ?? DEFAULT_COLOR;
  const lineWidth = annotation.lineWidth ?? 2;
  const px1 = annotation.x1 * w;
  const py1 = annotation.y1 * h;
  const px2 = annotation.x2 * w;
  const py2 = annotation.y2 * h;

  return (
    <g>
      <line
        x1={px1}
        y1={py1}
        x2={px2}
        y2={py2}
        stroke={color}
        strokeWidth={lineWidth}
        markerEnd="url(#cue-arrowhead)"
        style={{ "--cue-arrow-color": color } as React.CSSProperties}
      />
      {annotation.label && (
        <text
          x={(px1 + px2) / 2}
          y={(py1 + py2) / 2 - 8}
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize={12}
          fontWeight={600}
          fill={color}
          textAnchor="middle"
        >
          {annotation.label}
        </text>
      )}
    </g>
  );
}

// ── Box ────────────────────────────────────────────────────────────────────────

function BoxAnnotationSvg({
  annotation,
  w,
  h,
}: {
  annotation: BoxAnnotation;
  w: number;
  h: number;
}) {
  const color = annotation.color ?? DEFAULT_COLOR;
  const cornerRadius = annotation.cornerRadius ?? 4;
  const opacity = annotation.opacity ?? 1;
  const px = annotation.x * w;
  const py = annotation.y * h;
  const pw = annotation.width * w;
  const ph = annotation.height * h;

  return (
    <g style={{ opacity }}>
      <rect
        x={px}
        y={py}
        width={pw}
        height={ph}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray="6 3"
        rx={cornerRadius}
      />
      {annotation.label && (
        <text
          x={px}
          y={py - 6}
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

// ── Text ───────────────────────────────────────────────────────────────────────

function TextAnnotationSvg({
  annotation,
  w,
  h,
}: {
  annotation: TextAnnotation;
  w: number;
  h: number;
}) {
  const size = annotation.fontSize ?? 13;
  const color = annotation.color ?? "#f5f5f5";
  const align = annotation.align ?? "left";
  const padding = 6;

  const px = annotation.x * w;
  const py = annotation.y * h;

  // Estimate text width for background rect
  const charWidth = size * 0.6;
  const textWidth = annotation.text.length * charWidth + padding * 2;
  const textHeight = size + padding * 2;

  // Compute anchor offset based on alignment
  let textAnchor: "start" | "middle" | "end" = "start";
  let bgX = px - padding;
  if (align === "center") {
    textAnchor = "middle";
    bgX = px - textWidth / 2;
  } else if (align === "right") {
    textAnchor = "end";
    bgX = px - textWidth + padding;
  }

  return (
    <g>
      {/* Background rect for readability */}
      <rect
        x={bgX}
        y={py - size - padding + 2}
        width={textWidth}
        height={textHeight}
        rx={4}
        fill="rgba(0,0,0,0.7)"
      />
      <text
        x={px}
        y={py}
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize={size}
        fill={color}
        textAnchor={textAnchor}
      >
        {annotation.text}
      </text>
    </g>
  );
}
