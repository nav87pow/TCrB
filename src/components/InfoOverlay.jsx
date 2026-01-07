import React from "react";

export default function InfoOverlay({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 50,
      }}
      onClick={(e) => {
        // קליק על הרקע סוגר
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          width: "min(560px, 100%)",
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div style={{ fontWeight: 700 }}>Info</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: "18px",
            }}
            aria-label="Close info"
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: 14, lineHeight: "20px" }}>
          <p style={{ marginTop: 0 }}>
            This is a placeholder overlay for site information.
          </p>
          <p style={{ marginBottom: 0 }}>
            Later you can place your full explanation text here (no extra page).
          </p>
        </div>
      </div>
    </div>
  );
}
