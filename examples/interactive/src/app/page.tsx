"use client";

import { useState } from "react";
import { DemoTheater, AppWindow, FilePickerOverlay, type FileEntry } from "@cue-vin/react";

const FILES: FileEntry[] = [
  { id: "1", name: "report-q4.pdf", type: "doc" },
  { id: "2", name: "dashboard.png", type: "image" },
  { id: "3", name: "metrics.xlsx", type: "spreadsheet" },
  { id: "4", name: "assets", type: "folder" },
];

export default function InteractivePage() {
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0f172a" }}>
      <DemoTheater width={960} height={540} background="#ffffff">
        <AppWindow title="interactive-demo.app">
          <h2 style={{ color: "#1e293b", fontSize: 18, marginBottom: 12 }}>
            Interactive Demo
          </h2>
          <button
            onClick={() => setShowPicker(true)}
            style={{
              padding: "10px 24px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Open File Picker
          </button>
          {selected.length > 0 && (
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 12 }}>
              Selected: {selected.join(", ")}
            </p>
          )}
          {showPicker && (
            <FilePickerOverlay
              files={FILES}
              onSelect={(ids) => {
                setSelected(ids);
                setShowPicker(false);
              }}
            />
          )}
        </AppWindow>
      </DemoTheater>
    </div>
  );
}
