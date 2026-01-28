import React from "react";

export default function StackedCardsPreview() {
  return (
    <div className="relative h-[5.375rem]">
      <div
        className="
          absolute left-0 top-[10px]
          w-[78%] h-[58px]
          rounded-[0.6rem]
          bg-white
          border border-purple-300
          shadow-sm
        "
      />
      <div
        className="
          absolute left-[10px] top-[0px]
          w-[82%] h-[58px]
          rounded-[0.6rem]
          bg-white
          border border-purple-300
          shadow-sm
        "
      />
    </div>
  );
}
