import React from "react";

/**
 * Master Source Card
 * SAME structure & styles for both cards
 * Only name + logo change
 */
function SourceCard({ name, logoSrc }) {
  return (
    <article
      className="
        article-card trusted verified
        !p-0 !overflow-hidden
        w-full max-w-[22.5rem]
        pointer-events-none
      "
      aria-hidden="true"
    >
      <div className="px-6 py-5">
        <header className="article-card__header !mb-0">
          <div className="article-card__headerLeft">
            {/* Logo */}
            <div className="article-card__faviconWrap">
              <img
                className="article-card__favicon"
                src={logoSrc}
                alt=""
                loading="lazy"
              />

              {/* verified badge */}
              <span className="articlebadge">
                <span className="articlebadge__icon">🟍</span>
              </span>
            </div>

            {/* Name + date */}
            <div
              className="article-card__meta"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                whiteSpace: "nowrap",
              }}
            >
              <div className="articaesource">{name}</div>
              <span className="text-black text-[0.5rem] font-normal">|</span>
              <div className="articaledate">00 month 2025</div>
            </div>
          </div>
        </header>
      </div>
    </article>
  );
}

export default function SourcesPreviewCards() {
  return (
    <div className="relative w-full max-w-[26rem] mx-auto ">
      {/* BACK CARD – magazine (scaled, centered, pushed up) */}
      <div
        className="
          absolute
          left-[50%] top-0
          -translate-x-[50%]
          translate-y-[-46%]
          scale-[0.68]
          origin-top
          z-0
        "
      >
        <SourceCard
          name="Sky & Telescope"
          logoSrc="/logo-skyandtelescope.png"
        />
      </div>

      {/* FRONT CARD – NASA (master) */}
      <div className="relative z-10">
        <SourceCard
          name="NASA"
          logoSrc="/logo-nasa.png"
        />
      </div>

      {/* layout spacer */}
      
    </div>
  );
}
