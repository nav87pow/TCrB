// src/components/ArticleCard.jsx
import React from "react";

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ArticleCard({ article }) {
  const isTrusted = Boolean(article?.source?.isTrusted);
  const imageSrc =
    article?.image ||
    article?.imageUrl ||
    article?.thumbnail ||
    article?.thumbnailUrl ||
    article?.ogImage ||
    "";

  return (
    <article className={`article-card ${isTrusted ? "trusted" : "web"}`}>
      <header className="article-card__header">
        <div className="article-card__headerLeft">
        <div className="article-card__faviconWrap">
  {article?.source?.favicon ? (
    <img
      className="article-card__favicon"
      src={article.source.favicon}
      alt={`${article.source.name || "Source"} favicon`}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  ) : null}

   {isTrusted ? (
  <span className="articlebadge" aria-label="Trusted source" title="Trusted source">
    <span className="articlebadge__icon" aria-hidden="true">🟍</span>
  </span>
) : null}
</div>


          <div className="article-card__meta">
            <div className="articaesource">{article?.source?.name || ""}</div>
          <span className="text-black text-[0.5rem] font-normal leading-normal tracking-[0.02rem]">|</span>
            <div className="articaledate">{formatDate(article?.publishedAt)}</div>
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

      <a className="article-card__link" href={article?.url} target="_blank" rel="noreferrer">
        Read More →
      </a>
    </article>
  );
}
