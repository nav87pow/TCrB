// src/components/ArticleCard.jsx
import React from "react";

function isIsoYmd(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/**
 * Your live feed currently returns YMD dates that are often 1 day behind
 * (e.g., NASA shows 2024-11-03 while the page date is 2024-11-04).
 * To align UI with the real article date, we add +1 day ONLY for pure YMD inputs.
 */
function toUtcDateWithYmdFix(isoOrYmd) {
  if (!isoOrYmd) return null;

  // If it's a pure YMD string, create at UTC midnight and add +1 day
  if (isIsoYmd(isoOrYmd)) {
    const d = new Date(`${isoOrYmd}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return null;
    d.setUTCDate(d.getUTCDate() + 1);
    return d;
  }

  // Otherwise parse as-is (kept for compatibility)
  const d = new Date(isoOrYmd);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDate(isoOrYmd) {
  const d = toUtcDateWithYmdFix(isoOrYmd);
  if (!d) return "";

  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mon = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const yyyy = d.getUTCFullYear();

  return `${dd} ${mon} ${yyyy}`; // e.g. "03 Nov 2024"
}

/**
 * Truncate with TWO dots (".."), not an ellipsis and not three dots.
 */
function clampWithTwoDots(str, maxChars) {
  const s = String(str || "").trim();
  if (!s) return "";
  if (s.length <= maxChars) return s;

  // reserve 2 chars for ".."
  const keep = Math.max(0, maxChars - 2);
  return s.slice(0, keep).trimEnd() + "..";
}

export default function ArticleCard({ article }) {
  const isTrusted = Boolean(article?.source?.isTrusted);

  const publishedLabel = formatDate(article?.publishedAt);
  const hasDate = Boolean(publishedLabel);

  // Keep meta on ONE line: "source.. | 22 Jan 2025"
  // Date length is effectively fixed (e.g. "22 Jan 2025" = 11 chars).
  // We clamp the source name so it won't wrap on small widths.
  const rawSourceName = article?.source?.name || "";
  const sourceName = clampWithTwoDots(rawSourceName, 14);

  const imageSrc =
    article?.image ||
    article?.imageUrl ||
    article?.thumbnail ||
    article?.thumbnailUrl ||
    article?.ogImage ||
    "";

  const hasUrl = Boolean(article?.url);

  // Ensure CSS hooks:
  // - `.article-card.trusted` (your purple texture stripe)
  // - keep `verified/normal` for existing styling
  const cardClass = `article-card ${isTrusted ? "trusted verified" : "normal"}`;

  return (
    <article className={cardClass}>
      <header className="article-card__header">
        <div className="article-card__headerLeft">
          <div className="article-card__faviconWrap">
            {article?.source?.favicon ? (
              <img
                className="article-card__favicon"
                src={article.source.favicon}
                alt={`${rawSourceName || "Source"} favicon`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}

            {isTrusted ? (
              <span className="articlebadge" aria-label="Verified source" title="Verified source">
                <span className="articlebadge__icon" aria-hidden="true">🟍</span>
              </span>
            ) : null}
          </div>

          {/* Force single-line meta row */}
          <div
            className="article-card__meta"
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap" }}
          >
            <div className="articaesource">{sourceName}</div>

            {hasDate ? (
              <>
                <span className="text-black text-[0.5rem] font-normal leading-normal tracking-[0.02rem]">|</span>
                <div className="articaledate">{publishedLabel}</div>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <h3 className="articalheadline">{article?.headline || ""}</h3>

      {imageSrc ? (
        <img
          className="articleimg article-card__image"
          src={imageSrc}
          alt={article?.headline ? `${article.headline} image` : "Article image"}
          loading="lazy"
        />
      ) : null}

      <p className="articletext">{article?.excerpt || ""}</p>

      {hasUrl ? (
        <a className="article-card__link" href={article.url} target="_blank" rel="noreferrer">
          Read More →
        </a>
      ) : null}
    </article>
  );
}
