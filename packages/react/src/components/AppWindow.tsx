import type { ReactNode } from "react";

/** Props for the AppWindow component. */
export interface AppWindowProps {
  /** Title displayed in the titlebar. Default: "Untitled". */
  title?: string;
  /** Content rendered in the sidebar area. */
  sidebar?: ReactNode;
  /** Content rendered in the main area. */
  children: ReactNode;
  /** Sidebar width in pixels. Default: 220. */
  sidebarWidth?: number;
  /** Whether to show the titlebar. Default: true. */
  showTitlebar?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

/** Shell app chrome with titlebar, optional sidebar, and content area. */
export function AppWindow({
  title = "Untitled",
  sidebar,
  children,
  sidebarWidth = 220,
  showTitlebar = true,
  className,
}: AppWindowProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#f8f9fa",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {showTitlebar && (
        <div
          style={{
            height: 36,
            background: "#e9ecef",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: 8,
            borderBottom: "1px solid #dee2e6",
            flexShrink: 0,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          <span
            style={{
              marginLeft: 12,
              fontSize: 13,
              color: "#495057",
              fontWeight: 500,
            }}
          >
            {title}
          </span>
        </div>
      )}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {sidebar && (
          <div
            style={{
              width: sidebarWidth,
              background: "#f1f3f5",
              borderRight: "1px solid #dee2e6",
              overflow: "auto",
              padding: 12,
              flexShrink: 0,
            }}
          >
            {sidebar}
          </div>
        )}
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}
