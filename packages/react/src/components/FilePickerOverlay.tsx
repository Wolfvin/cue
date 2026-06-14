import { useState } from "react";

/** A single file entry in the FilePickerOverlay. */
export interface FileEntry {
  /** Unique file identifier. */
  id: string;
  /** Display name of the file. */
  name: string;
  /** File type icon hint. Default: "doc". */
  type?: "doc" | "image" | "spreadsheet" | "folder";
}

/** Props for the FilePickerOverlay component. */
export interface FilePickerOverlayProps {
  /** Array of files to display. */
  files: FileEntry[];
  /** Callback with array of selected file ids when confirmed. */
  onSelect: (ids: string[]) => void;
  /** Whether to allow multiple selections. Default: true. */
  multiple?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

/** File picker mock overlay with checkboxes for selection. */
export function FilePickerOverlay({
  files,
  onSelect,
  multiple = true,
  className,
}: FilePickerOverlayProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onSelect(Array.from(selected));
  };

  const iconFor = (type: string) => {
    switch (type) {
      case "image":
        return "🖼";
      case "spreadsheet":
        return "📊";
      case "folder":
        return "📁";
      default:
        return "📄";
    }
  };

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          minWidth: 360,
          maxWidth: 480,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1a1a1a" }}>Select Files</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 240, overflow: "auto" }}>
          {files.map((f) => (
            <li
              key={f.id}
              onClick={() => toggle(f.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 6,
                cursor: "pointer",
                background: selected.has(f.id) ? "#eff6ff" : "transparent",
                transition: "background 0.15s ease",
              }}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                checked={selected.has(f.id)}
                onChange={() => toggle(f.id)}
                style={{ cursor: "pointer" }}
              />
              <span style={{ fontSize: 18 }}>{iconFor(f.type ?? "doc")}</span>
              <span style={{ fontSize: 14, color: "#374151" }}>{f.name}</span>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0}
            style={{
              padding: "8px 20px",
              background: selected.size > 0 ? "#3b82f6" : "#d1d5db",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: selected.size > 0 ? "pointer" : "not-allowed",
              fontSize: 14,
            }}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
