// src/components/WarningsSection.jsx
import React from "react";
import WarningPill from "./WarningPill";

export default function WarningsSection() {
  return (
    <div className="mt-[24px] space-y-[14px]">
      <WarningPill>
        This is <span className="font-bold">NOT</span> a guaranteed prediction
      </WarningPill>

      <WarningPill>
        This is <span className="font-bold">NOT</span> a promise of a specific date
      </WarningPill>
    </div>
  );
}
