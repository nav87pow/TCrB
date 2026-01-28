import React from "react";

export default function InfoCard({ title, iconChar, children }) {
  return (
    <div
      className="
        w-full
        bg-white
        rounded-[0.5rem]
        border-[0.4px]
        border-purple-100
        p-9
        flex
        flex-col
        items-center
        gap-[1.8rem]
        my-[5.375rem]
        py-[3.2rem]
        lg:w-[68vw]
        lg:mx-auto
      "
    >
      {(title || iconChar) ? (
        <div className="w-full flex items-center mb-4">
          {iconChar ? (
            <span className="font-symbols pt[0.32rem] mr-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border border-purple-100">
              {iconChar}
            </span>
          ) : null}

          {title ? <div className="headlineEstimated">{title}</div> : null}
        </div>
      ) : null}

      <div className="w-full">{children}</div>
    </div>
  );
}
