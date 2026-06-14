import { useRef, useEffect, useCallback, useState, type ReactNode } from "react";

/** Props for the DemoTheater component. */
export interface DemoTheaterProps {
  /** Fixed width of the artboard in pixels. Default: 1280. */
  width?: number;
  /** Fixed height of the artboard in pixels. Default: 720. */
  height?: number;
  /** Background color of the artboard. Default: "#ffffff". */
  background?: string;
  /** Content rendered inside the artboard. */
  children: ReactNode;
  /** Additional CSS class names. */
  className?: string;
}

/** Wrapper artboard that maintains a fixed size and scales responsively via ResizeObserver. */
export function DemoTheater({
  width = 1280,
  height = 720,
  background = "#ffffff",
  children,
  className,
}: DemoTheaterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);

  const updateScale = useCallback(() => {
    const container = containerRef.current;
    const artboard = artboardRef.current;
    if (!container || !artboard) return;

    const rect = container.getBoundingClientRect();
    const scaleX = rect.width / width;
    const scaleY = rect.height / height;
    const scale = Math.min(scaleX, scaleY, 1);
    artboard.style.transform = `scale(${scale})`;
  }, [width, height]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    updateScale();

    return () => observer.disconnect();
  }, [updateScale]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        ref={artboardRef}
        style={{
          width,
          height,
          background,
          transformOrigin: "center center",
          position: "relative",
          overflow: "hidden",
          borderRadius: 8,
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
