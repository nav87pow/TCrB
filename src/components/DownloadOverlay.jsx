// src/components/DownloadOverlay.jsx
import React from "react";

export default function DownloadOverlay({
  open,
  onClose,
  onConfirm,
  canInstall,
  showFallback = false,
}) {
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
        zIndex: 60,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "#fff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
      >
        <h3 className="text-base font-semibold text-primary">
          Install the app?
        </h3>

        <p className="mt-3 text-sm text-primary/80 leading-relaxed">
          Do you want to install the app on your phone to get daily updates?
        </p>

        {showFallback && !canInstall && (
          <div className="mt-4 rounded-xl border border-black/10 bg-black/5 p-4">
            <p className="text-xs text-primary/80">
              Installation is not available automatically on this device.
            </p>
            <p className="mt-2 text-xs text-primary/80">
              Please use <strong>Add to Home Screen</strong> from your browser
              menu.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn btnSecondary" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btnPrimary"
            onClick={onConfirm}
            disabled={!canInstall}
            title={
              canInstall
                ? "Install app"
                : "Install is not available on this device"
            }
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
