// src/components/WarningPill.jsx
import React from "react";

export default function WarningPill({ children }) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        px-3
        py-[10px]
        bg-orange-50
        text-red-900
        rounded-md
        w-full
      "
    >
      {/* icon */}
      <span
        className="font-symbols text-amber-500 text-[1rem] leading-none flex-none"
        aria-hidden="true"
      >
        ⛔
      </span>

      {/* text */}
      <p className="texts text-red-900 m-0">
        {children}
      </p>
    </div>
  );
}
