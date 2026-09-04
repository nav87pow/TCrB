// src/components/ArticlesList.jsx
import React, { useMemo } from "react";
import trustedJson from "../data/trustedSources.json";
import articlesJson from "../data/articles.mock.json";
import { buildArticlesForUI } from "../utils/articles";
import ArticleCard from "./ArticleCard";

function isYmd(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function ymdToMs(ymd) {
  if (!isYmd(ymd)) return 0;
  const ms = Date.parse(`${ymd}T00:00:00Z`);
  return Number.isNaN(ms) ? 0 : ms;
}

/**
 * Guarantee at least one trusted card (if any exist),
 * then fill remaining slots by publishedAt desc.
 */
function pickUiCards(normalized, limit) {
  const arr = Array.isArray(normalized) ? normalized.slice() : [];
  if (!arr.length) return [];

  const sorted = arr.slice().sort((a, b) => ymdToMs(b?.publishedAt) - ymdToMs(a?.publishedAt));
  const trusted = sorted.filter((x) => x?.source?.isTrusted === true);
  const other = sorted.filter((x) => x?.source?.isTrusted !== true);

  const out = [];
  if (trusted.length) out.push(trusted[0]);

  for (const x of other) {
    if (out.length >= limit) break;
    if (out.some((y) => y?.url && y.url === x?.url)) continue;
    out.push(x);
  }

  // if still room, add more trusted (optional)
  for (const x of trusted.slice(1)) {
    if (out.length >= limit) break;
    if (out.some((y) => y?.url && y.url === x?.url)) continue;
    out.push(x);
  }

  return out.slice(0, limit);
}

/**
 * Normalize incoming article objects to the "Article" shape used by ArticleCard.
 * Supports:
 * 1) Full UI article shape (mock): { source:{...}, headline, ... }
 * 2) Server shape (/api/updates): { isTrusted, siteName, domain, faviconUrl, publishedAt, title, excerpt, url }
 */
function normalizeArticle(raw) {
  if (!raw || typeof raw !== "object") return null;

  // Already matches (allow publishedAt optional)
  if (raw.source && typeof raw.source === "object" && raw.headline) {
    return {
      ...raw,
      publishedAt: raw.publishedAt && isYmd(raw.publishedAt) ? raw.publishedAt : (raw.publishedAt || null),
    };
  }

  const id =
    raw.id ??
    raw._id ??
    raw.guid ??
    raw.url ??
    raw.link ??
    `a-${Math.random().toString(16).slice(2)}`;

  const domain =
    raw.source?.domain ||
    raw.domain ||
    (typeof raw.url === "string"
      ? (() => {
          try {
            return new URL(raw.url).hostname.replace(/^www\./, "");
          } catch {
            return "";
          }
        })()
      : "");

  const favicon =
    raw.source?.favicon ||
    raw.faviconUrl ||
    raw.favicon ||
    (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : "");

  const displayName =
    raw.siteName ||
    raw.source?.name ||
    domain ||
    "";

  const publishedAt =
    (raw.publishedAt && isYmd(raw.publishedAt) ? raw.publishedAt : null) ||
    (raw.published_at && isYmd(raw.published_at) ? raw.published_at : null) ||
    null;

  const headline = raw.headline || raw.title || raw.name || "Untitled";
  const excerpt = raw.excerpt || raw.description || "";
  const url = raw.url || raw.link || raw.href || "";

  const isTrusted =
    raw.isTrusted === true ||
    raw.source?.isTrusted === true ||
    raw.source === "Trusted";

  return {
    id: String(id),
    source: {
      name: String(displayName || ""),
      domain: String(domain || ""),
      favicon: String(favicon || ""),
      isTrusted: Boolean(isTrusted),
    },
    publishedAt,
    headline: String(headline),
    excerpt: String(excerpt),
    url: String(url),
  };
}

export default function ArticlesList({ articles = null, limit = 6 }) {
  const cards = useMemo(() => {
    const isLive = Array.isArray(articles);
    const rawList = isLive ? articles : articlesJson.articles;

    const normalized = rawList.map(normalizeArticle).filter(Boolean);

    // LIVE: trust server ordering/flags, enforce trusted presence locally, do NOT re-run buildArticlesForUI
    if (isLive) {
return normalized.slice(0, limit);
    }

    // MOCK: keep existing pipeline
    return buildArticlesForUI(
      normalized,
      trustedJson.trustedSources,
      limit
    );
  }, [articles, limit]);

  return (
    <section className="articles-list">
      {cards.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </section>
  );
}
