"use client";

import { useEnter, useCountUp, useStagger } from "@cue-vin/react";

function EnterCard() {
  const ref = useEnter({ delay: 200 });
  return (
    <div
      ref={ref}
      style={{
        padding: 24,
        background: "#f8fafc",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ color: "#1e293b", fontSize: 16 }}>useEnter</h3>
      <p style={{ color: "#64748b", fontSize: 13 }}>This card fades in on mount.</p>
    </div>
  );
}

function CountUpCard() {
  const value = useCountUp({ target: 1234, duration: 1500 });
  return (
    <div
      style={{
        padding: 24,
        background: "#f8fafc",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ color: "#1e293b", fontSize: 16 }}>useCountUp</h3>
      <p style={{ color: "#3b82f6", fontSize: 28, fontWeight: 700 }}>{value}</p>
    </div>
  );
}

function StaggerCard() {
  const visible = useStagger({ count: 5, interval: 120 });
  return (
    <div
      style={{
        padding: 24,
        background: "#f8fafc",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ color: "#1e293b", fontSize: 16, marginBottom: 8 }}>useStagger</h3>
      <div style={{ display: "flex", gap: 8 }}>
        {visible.map((v, i) => (
          <div
            key={i}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: v ? "#3b82f6" : "#e2e8f0",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CSSCard() {
  return (
    <div
      style={{
        padding: 24,
        background: "#f8fafc",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ color: "#1e293b", fontSize: 16, marginBottom: 8 }}>CSS Primitives</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span className="cue-enter cue-stagger-flow" style={badge}>.cue-enter</span>
        <span className="cue-enter-fade cue-stagger-flow" style={{ ...badge, ['--cue-stagger-base-delay' as any]: '100ms' }}>.cue-enter-fade</span>
        <span className="cue-hover-lift" style={{ ...badge, cursor: "pointer" }}>.cue-hover-lift</span>
        <span className="cue-glow" style={{ ...badge, background: "#3b82f6", color: "#fff" }}>.cue-glow</span>
      </div>
    </div>
  );
}

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 14px",
  background: "#e2e8f0",
  borderRadius: 6,
  fontSize: 13,
  color: "#374151",
  fontFamily: "monospace",
};

export default function PrimitivesPage() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: 48,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <h1 style={{ color: "#0f172a", fontSize: 24 }}>Cue Primitives</h1>
      <EnterCard />
      <CountUpCard />
      <StaggerCard />
      <CSSCard />
    </div>
  );
}
