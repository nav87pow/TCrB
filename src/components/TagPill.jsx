import React from "react";

export default function TagPill({
  children,
  onClick,
  disabled = false,
  className = "",
}) {
  const base = `
    inline-flex
    items-center
    justify-center
    gap-[0.625rem]
    rounded-[6.25rem]
    border
    border-violet-950
    border-[0.02rem]
    bg-stone-50
    py-[0.375rem]
    px-[0.5rem]
    font-medium
    text-violet-950
    transition
    text-[0.5rem]
    tracking-[0.02rem]
  `;

  const enabledStyles = "cursor-pointer";
  const disabledStyles = "cursor-not-allowed opacity-50";

  const finalClassName = [
    base,
    disabled ? disabledStyles : enabledStyles,
    className,
  ].join(" ");

  // ללא onClick → span
  if (!onClick) {
    return <span className={finalClassName}>{children}</span>;
  }

  // עם onClick → button
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={finalClassName}
    >
      {children}
    </button>
  );
}
