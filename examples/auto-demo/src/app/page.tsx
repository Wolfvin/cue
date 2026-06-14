"use client";

import { useState, useEffect } from "react";
import { DemoTheater, ScriptedPointer, AppWindow } from "@cue/react";
import { Pointer, type PointerState } from "@cue/core";

export default function AutoDemoPage() {
  const [pointerState, setPointerState] = useState<PointerState>({
    x: 200,
    y: 300,
    clicking: false,
    transition: "400ms",
  });

  useEffect(() => {
    const pointer = new Pointer({
      startX: 200,
      startY: 300,
      onChange: setPointerState,
    });

    pointer.play([
      { x: 400, y: 200, duration: 800 },
      { x: 600, y: 350, duration: 600, delay: 400, click: true },
      { x: 300, y: 400, duration: 700, delay: 300 },
      { x: 500, y: 250, duration: 500, delay: 200, click: true },
    ]);

    return () => pointer.dispose();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0f172a" }}>
      <DemoTheater width={960} height={540} background="#ffffff">
        <AppWindow
          title="cue-demo.app"
          sidebar={
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              <p>Dashboard</p>
              <p>Analytics</p>
              <p>Settings</p>
            </div>
          }
        >
          <h2 style={{ color: "#1e293b", fontSize: 20 }}>Welcome to Cue</h2>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            This is an auto-playing demo with a scripted pointer.
          </p>
        </AppWindow>
        <ScriptedPointer state={pointerState} />
      </DemoTheater>
    </div>
  );
}
