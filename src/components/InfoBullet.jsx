import React from "react";

/**
 * InfoBullet
 * - iconChar: תו/גליף (מהפונטים המותקנים)
 * - title: כותרת חובה
 * - text: אופציונלי (אם אין, לא נרנדר פסקה)
 * - badge: אופציונלי (למשל "HEADLINEESTIMATED")
 * - iconFontClass: ברירת מחדל "font-symbols"
 */
export default function InfoBullet({
  iconChar,
  title,
  text = null,
  iconFontClass = "font-symbols",
}) {
  return (
    <div className="flex flex-col text-left mb-[56px] lg:w-[32rem] ">
      {/* Icon */}
      <div className="mb-[24px] ">
        <span
          className="
            inline-flex items-center justify-center
            w-[28px] h-[28px]
            rounded-full
            bg-white
            border border-purple-600/30
            shadow-[0_1px_0_rgba(0,0,0,0.08)]
          "
          aria-hidden="true"
        >
          <span className={`${iconFontClass} text-[16px] pt-[0.32rem] leading-none text-purple-950 lg:text-2 `}>
            {iconChar}
          </span>
        </span>
      </div>

      {/* Bullet info */}
      <div className="flex flex-col gap-[18px] min-w-0">
        <div className="headlinem lg:text-[rem]">{title}</div>

        {text ? (
          <p className="headlinemlight leading-[1.65] lg:text-[1.4rem]">
            {text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
