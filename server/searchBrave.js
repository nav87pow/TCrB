// server/searchBrave.js
// MUST match existing imports in server/index.js:
//   import { braveSearchOnce, extractDomain } from "./searchBrave.js";

const BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";

// Small in-memory cache to reduce 429 bursts
const _cache = new Map();
const CACHE_TTL_MS = 60_000; // 60s

function _cacheKey(query, count) {
  return `${String(query || "").trim().toLowerCase()}::${count}`;
}

/**
 * Extract hostname domain from URL (without leading www.)
 * @param {string} url
 * @returns {string}
 */
export function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function _pickPublishedAt(item) {
  // Brave fields can vary
  const v =
    item?.page_age ||
    item?.age ||
    item?.published ||
    item?.date ||
    item?.published_at ||
    item?.crawl_date;

  if (!v) return null;

  if (typeof v === "string") return v;

  if (typeof v === "number") {
    const ms = v > 10_000_000_000 ? v : v * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  return null;
}

/**
 * One Brave request.
 * Returns normalized search items (NOT the UI schema).
 *
 * IMPORTANT: we return BOTH `description` and `snippet` for compatibility.
 *
 * @param {string} query
 * @param {number} count
 * @returns {Promise<Array<{ title:string, url:string, description:string, snippet:string, domain:string, publishedAt:string|null }>>}
 */
export async function braveSearchOnce(query, count = 6) {
  const q = String(query || "").trim();
  const c = Number.isFinite(count) ? Math.max(1, Math.min(20, count)) : 6;

  if (!q) return [];

  const key = _cacheKey(q, c);
  const cached = _cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.results;
  }

  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    const err = new Error("BRAVE_SEARCH_API_KEY missing or empty");
    err.code = "BRAVE_KEY_MISSING";
    throw err;
  }

  const url = new URL(BRAVE_ENDPOINT);
  url.searchParams.set("q", q);
  url.searchParams.set("count", String(c));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": apiKey,
    },
  });

  const text = await res.text();

  if (!res.ok) {
    const err = new Error(`Brave search failed: ${res.status} ${text}`);
    err.code = "BRAVE_HTTP_ERROR";
    err.status = res.status;
    throw err;
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    const err = new Error(`Brave returned invalid JSON: ${String(e?.message || e)}`);
    err.code = "BRAVE_BAD_JSON";
    throw err;
  }

  const raw = json?.web?.results;
  const arr = Array.isArray(raw) ? raw : [];

  const results = arr
    .map((item) => {
      const u = item?.url || "";
      const description = String(item?.description || item?.snippet || "").trim();

      return {
        title: String(item?.title || "").trim(),
        url: String(u || "").trim(),
        description,
        // compatibility for your server/index.js (it reads r.snippet)
        snippet: description,
        domain: extractDomain(u),
        publishedAt: _pickPublishedAt(item),
      };
    })
    .filter((r) => r.url && r.title);

  _cache.set(key, { ts: Date.now(), results });
  return results;
}

/**
 * Compatibility wrapper for groqAnalyze.js:
 * groqAnalyze imports: import { searchBrave } from "./searchBrave.js";
 *
 * @param {string} query
 * @param {{count?: number}} opts
 */
export async function searchBrave(query, opts = {}) {
  const count = Number.isFinite(opts?.count) ? opts.count : 6;
  return braveSearchOnce(query, count);
}
