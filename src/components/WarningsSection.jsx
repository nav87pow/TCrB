// src/components/WarningsSection.jsx
import React from "react";
import WarningPill from "./WarningPill";

export default function WarningsSection() {
  return (
    <div className="mt-[1.8rem] space-y-[1.24rem] lg:space-x-[1.24rem] ">
      <WarningPill>
        This is <span className="font-bold">NOT</span> a guaranteed prediction
      </WarningPill>

      <WarningPill>
        This is <span className="font-bold">NOT</span> a promise of a specific date
      </WarningPill>
    </div>
  );
}
