import type { ReactNode } from "react";

/** A single cell in the spreadsheet. */
export interface ExcelCell {
  /** Cell value to display. */
  value: string | number;
  /** Whether the cell is selected. Default: false. */
  selected?: boolean;
}

/** Props for the ExcelPopup component. */
export interface ExcelPopupProps {
  /** 2D array of cells forming the spreadsheet grid. */
  data: ExcelCell[][];
  /** Title of the popup window. Default: "Spreadsheet". */
  title?: string;
  /** Content rendered below the spreadsheet. */
  footer?: ReactNode;
  /** Additional CSS class names. */
  className?: string;
}

/** Spreadsheet popup mock that renders a simple grid of cells. */
export function ExcelPopup({
  data,
  title = "Spreadsheet",
  footer,
  className,
}: ExcelPopupProps) {
  const colCount = data[0]?.length ?? 0;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        overflow: "hidden",
        minWidth: 400,
        zIndex: 90,
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          background: "#217346",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>📊</span>
        {title}
      </div>
      <div style={{ overflow: "auto", maxHeight: 300 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <tbody>
            {data.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      border: "1px solid #e2e8f0",
                      padding: "6px 12px",
                      background: cell.selected ? "#dbeafe" : ri === 0 ? "#f8fafc" : "#fff",
                      fontWeight: ri === 0 ? 600 : 400,
                      color: "#1e293b",
                      minWidth: 80,
                    }}
                  >
                    {cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && (
        <div style={{ padding: "10px 16px", borderTop: "1px solid #e2e8f0" }}>{footer}</div>
      )}
    </div>
  );
}
