import React from "react";

export interface StepProgressProps {
  current: number;
  total: number;
  variant?: "dots" | "bar";
  className?: string;
}

const ACCENT = "#C91C1C";
const INACTIVE = "#4B5563";
const TRACK_BG = "#1F2937";

export const StepProgress: React.FC<StepProgressProps> = ({
  current,
  total,
  variant = "dots",
  className,
}) => {
  if (variant === "bar") {
    const pct = total > 1 ? (current / (total - 1)) * 100 : 100;
    return (
      <div
        className={className}
        style={{
          width: "100%",
          height: 6,
          backgroundColor: TRACK_BG,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: ACCENT,
            borderRadius: 3,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    );
  }

  // variant === "dots"
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 12 : 8,
            height: i === current ? 12 : 8,
            borderRadius: "50%",
            backgroundColor: i === current ? ACCENT : INACTIVE,
            transition: "all 0.2s ease",
          }}
        />
      ))}
    </div>
  );
};
