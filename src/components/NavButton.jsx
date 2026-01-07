import React from "react";

export default function NavButton({
  icon,          // תו יוניקוד של האייקון
  label,
  onClick,
  disabled = false,
  bubbleText = null,
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
     className="
    appearance-none
    border-none
    bg-transparent
    p-0
    transition-opacity
  "
  style={{
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  }}
    >
      <div className="relative inline-flex flex-col items-center gap-[6px] min-w-[72px]">

      
        {/* Icon circle */}
        <div className="relative">

          <div
  className="
    flex
    h-[44px] w-[44px]
    items-center justify-center
    rounded-full
    px-[0.875rem] pt-[1rem] pb-[0.55rem]
    bg-[rgba(124,58,237,0.18)]
  "
>

            <span
              aria-hidden="true"
              style={{
                fontFamily: `"Noto Sans Symbols 2", "Noto Sans Symbols", sans-serif`,
                fontSize: 22,
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              {icon}
            </span>
          </div>

          {/* Countdown bubble */}
          {bubbleText && (
            <div
  className="
    absolute
    -top-[10px] -right-[10px]
    rounded-full
    px-1 py-1
    text-[8px]
    whitespace-nowrap
    bg-[#FAFAFA]
    border border-[#C27BFF]
    text-[#3C0365]
  "
>

              {bubbleText}
            </div>
          )}
        </div>

        {/* Label */}
        <div className="text-[14px] leading-[160%] tracking-[0.01094rem] capitalize">

          {label}
        </div>
      </div>
    </button>
  );
}
