import type { ReactNode, CSSProperties } from "react";

/** Props for the ScreenSlide component. */
export interface ScreenSlideProps {
  /** Image source — URL string or base64 data URI. */
  src: string;
  /** Alt text for the image. */
  alt?: string;
  /** Slide width in pixels. Default: 840. */
  width?: number;
  /** Slide height in pixels. Default: 520. */
  height?: number;
  /** How the image fits within the slide. Default: "cover". */
  objectFit?: "cover" | "contain" | "fill";
  /** Overlay content rendered on top of the image (Hotspot, Annotation, pointer, etc.). */
  children?: ReactNode;
  /** Additional CSS class names. */
  className?: string;
  /** Inline style overrides applied to the outer container. */
  style?: CSSProperties;
}

/**
 * Displays a screenshot/image as a single demo slide with an optional overlay
 * slot for hotspots, annotations, and pointers.
 *
 * Works standalone or inside DemoTheater.
 */
export function ScreenSlide({
  src,
  alt,
  width = 840,
  height = 520,
  objectFit = "cover",
  children,
  className,
  style,
}: ScreenSlideProps) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width,
        height,
        ...style,
      }}
    >
      {/* Background image — fills the container absolutely */}
      <img
        src={src}
        alt={alt ?? ""}
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* Overlay slot — positioned on top of the image */}
      {children && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
