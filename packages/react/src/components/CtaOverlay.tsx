import { useState, useCallback, useRef, type FormEvent, type KeyboardEvent } from "react";
import type { DemoCta } from "@cue/core";

/** Props for the CtaOverlay component. */
export interface CtaOverlayProps {
  /** CTA configuration defining variant and content. */
  cta: DemoCta;
  /** Callback invoked on email_capture submit with the entered email value. */
  onSubmit?: (value: string) => void;
  /** Callback invoked when the user dismisses the CTA overlay. */
  onDismiss?: () => void;
}

// ─── Shared Styles ─────────────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0, 0, 0, 0.75)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  zIndex: 6000,
  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const cardStyle: React.CSSProperties = {
  background: "#111",
  border: "1px solid rgba(201, 28, 28, 0.3)",
  borderRadius: 8,
  padding: 32,
  minWidth: 320,
  maxWidth: 420,
  textAlign: "center",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
};

const redButtonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 28px",
  background: "#C91C1C",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  transition: "background 0.15s ease",
};

const skipLinkStyle: React.CSSProperties = {
  position: "absolute",
  top: 16,
  right: 20,
  color: "rgba(255, 255, 255, 0.45)",
  fontSize: 13,
  cursor: "pointer",
  background: "none",
  border: "none",
  textDecoration: "underline",
  textUnderlineOffset: 2,
  padding: 0,
  transition: "color 0.15s ease",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "#1a1a1a",
  color: "#f5f5f5",
  border: "1px solid #333",
  borderRadius: 6,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

const successTextStyle: React.CSSProperties = {
  color: "#4ade80",
  fontSize: 15,
  fontWeight: 500,
};

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * CTA overlay rendered on top of a demo step. Supports three variants:
 *
 * - **button**: A standalone action button (e.g. "Book a demo", "Start free trial").
 * - **email_capture**: An email input + submit button. After submission, shows a
 *   success message.
 * - **link**: A button that opens a URL in a new tab.
 *
 * All variants include a "Skip" dismiss link in the top-right corner.
 */
export function CtaOverlay({ cta, onSubmit, onDismiss }: CtaOverlayProps) {
  const [emailValue, setEmailValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (cta.type !== "email_capture") return;
      const trimmed = emailValue.trim();
      if (!trimmed) return;
      onSubmit?.(trimmed);
      setSubmitted(true);
    },
    [cta.type, emailValue, onSubmit]
  );

  const handleSkip = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss?.();
      }
    },
    [onDismiss]
  );

  return (
    <div
      style={overlayStyle}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-label="Call to action"
      aria-modal="true"
    >
      {/* Skip / dismiss */}
      <button
        style={skipLinkStyle}
        onClick={handleSkip}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)";
        }}
        aria-label="Skip call to action"
      >
        Skip
      </button>

      <div style={cardStyle}>
        {cta.type === "button" && (
          <CtaButton cta={cta} />
        )}

        {cta.type === "link" && (
          <CtaLink cta={cta} />
        )}

        {cta.type === "email_capture" && !submitted && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label
              htmlFor="cue-cta-email"
              style={{
                display: "block",
                color: "#f5f5f5",
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              {cta.label}
            </label>
            <input
              ref={inputRef}
              id="cue-cta-email"
              type="email"
              required
              placeholder={cta.placeholder ?? "Enter your email"}
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              style={{
                ...inputStyle,
                borderColor: inputFocused ? "#C91C1C" : "#333",
              }}
              aria-label="Email address"
            />
            <button
              type="submit"
              style={redButtonStyle}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#a51818";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#C91C1C";
              }}
            >
              {cta.submitLabel ?? "Get started"}
            </button>
          </form>
        )}

        {cta.type === "email_capture" && submitted && (
          <p style={successTextStyle}>
            {cta.successMessage ?? "Thanks! We'll be in touch."}
          </p>
        )}
      </div>

      {/* Inject fade-in keyframes */}
      <style>{`
        @keyframes cue-cta-fade-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Variant Components ────────────────────────────────────────────────────

function CtaButton({ cta }: { cta: DemoCta }) {
  const handleClick = () => {
    if (cta.href) {
      window.open(cta.href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      onClick={handleClick}
      style={redButtonStyle}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#a51818";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#C91C1C";
      }}
      aria-label={cta.label}
    >
      {cta.label}
    </button>
  );
}

function CtaLink({ cta }: { cta: DemoCta }) {
  return (
    <a
      href={cta.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...redButtonStyle,
        display: "inline-block",
        lineHeight: "20px",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "#a51818";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "#C91C1C";
      }}
      aria-label={cta.label}
    >
      {cta.label}
    </a>
  );
}
