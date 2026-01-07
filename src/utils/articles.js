// src/utils/articles.js

/**
 * @typedef {Object} TrustedSource
 * @property {string} name
 * @property {string} domain
 */

/**
 * @typedef {Object} Article
 * @property {string} id
 * @property {{name: string, domain: string, favicon: string}} source
 * @property {string} publishedAt ISO string
 * @property {string} headline
 * @property {string} excerpt max 350 chars (expected)
 * @property {string} url
 */

/** Normalize domain for matching (remove leading www.) */
export function normalizeDomain(domain) {
  if (!domain) return "";
  return String(domain).trim().toLowerCase().replace(/^www\./, "");
}

export function isTrustedDomain(domain, trustedSources) {
  const d = normalizeDomain(domain);
  const set = new Set((trustedSources || []).map((s) => normalizeDomain(s.domain)));
  return set.has(d);
}

/** Adds computed fields for UI */
export function enrichArticles(articles, trustedSources) {
  return (articles || []).map((a) => {
    const trusted = isTrustedDomain(a?.source?.domain, trustedSources);
    return {
      ...a,
      source: {
        ...a.source,
        isTrusted: trusted
      }
    };
  });
}

function byPublishedDesc(a, b) {
  const ta = Date.parse(a?.publishedAt || 0) || 0;
  const tb = Date.parse(b?.publishedAt || 0) || 0;
  return tb - ta;
}

/**
 * Core selection:
 * - trusted group first (desc by date)
 * - then web group (desc by date)
 * - return exactly limit items
 */
export function selectTopArticles(enrichedArticles, limit = 4) {
  const list = Array.isArray(enrichedArticles) ? enrichedArticles.slice() : [];

  const trusted = list.filter((a) => a?.source?.isTrusted).sort(byPublishedDesc);
  const web = list.filter((a) => !a?.source?.isTrusted).sort(byPublishedDesc);

  const out = [];
  for (const a of trusted) {
    if (out.length >= limit) break;
    out.push(a);
  }
  for (const a of web) {
    if (out.length >= limit) break;
    out.push(a);
  }

  return out;
}

/** Convenience: from raw input to the 4 cards you render */
export function buildArticlesForUI(rawArticles, trustedSources, limit = 4) {
  const enriched = enrichArticles(rawArticles, trustedSources);
  return selectTopArticles(enriched, limit);
}
