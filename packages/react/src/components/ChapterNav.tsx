import React from "react";

export interface ChapterNavProps {
  onPrev: () => void;
  onNext: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  prevLabel?: string;
  nextLabel?: string;
  showLabels?: boolean;
}

const ACCENT = "#C91C1C";
const BTN_BG = "#1F2937";
const BTN_BG_HOVER = "#374151";
const BTN_DISABLED = "#111827";
const TEXT_COLOR = "#F9FAFB";
const TEXT_DISABLED = "#6B7280";

export const ChapterNav: React.FC<ChapterNavProps> = ({
  onPrev,
  onNext,
  isPrevDisabled,
  isNextDisabled,
  prevLabel = "\u2190",
  nextLabel = "\u2192",
  showLabels = true,
}) => {
  const buttonBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 18px",
    border: "none",
    borderRadius: 6,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: isPrevDisabled || isNextDisabled ? "not-allowed" : "pointer",
    transition: "background-color 0.2s ease, color 0.2s ease",
    outline: "none",
    userSelect: "none",
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLButtonElement>,
    disabled: boolean
  ) => {
    if (disabled) return;
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = ACCENT;
  };

  const handleMouseLeave = (
    e: React.MouseEvent<HTMLButtonElement>,
    disabled: boolean
  ) => {
    if (disabled) return;
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = BTN_BG;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <button
        onClick={onPrev}
        disabled={isPrevDisabled}
        onMouseEnter={(e) => handleMouseEnter(e, isPrevDisabled)}
        onMouseLeave={(e) => handleMouseLeave(e, isPrevDisabled)}
        style={{
          ...buttonBase,
          backgroundColor: isPrevDisabled ? BTN_DISABLED : BTN_BG,
          color: isPrevDisabled ? TEXT_DISABLED : TEXT_COLOR,
        }}
      >
        {showLabels ? prevLabel : ""}
      </button>

      <button
        onClick={onNext}
        disabled={isNextDisabled}
        onMouseEnter={(e) => handleMouseEnter(e, isNextDisabled)}
        onMouseLeave={(e) => handleMouseLeave(e, isNextDisabled)}
        style={{
          ...buttonBase,
          backgroundColor: isNextDisabled ? BTN_DISABLED : BTN_BG,
          color: isNextDisabled ? TEXT_DISABLED : TEXT_COLOR,
        }}
      >
        {showLabels ? nextLabel : ""}
      </button>
    </div>
  );
};
