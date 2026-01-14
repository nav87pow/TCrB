// server/index.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { braveSearchOnce, extractDomain } from "./searchBrave.js";
import { serperSearchOnce } from "./searchSerper.js";
import { analyzeWithGroq } from "./groqAnalyze.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.type("text").send("OK. Try /health or /api/updates");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadTrustedJson() {
  const p = path.join(__dirname, "trustedSources.json");
  const raw = fs.readFileSync(p, "utf-8");
  const json = JSON.parse(raw);
  return json || {};
}

/**
 * Keep ORDER from trustedSources.json
 */
function loadTrustedDomainsList() {
  const json = loadTrustedJson();
  const list = Array.isArray(json.trustedSources) ? json.trustedSources : [];
  return list
    .map((x) => String(x?.domain ?? "").toLowerCase().trim())
    .filter(Boolean);
}

function loadTrustedDomainsSet() {
  return new Set(loadTrustedDomainsList());
}

function loadTrustedNameMap() {
  const json = loadTrustedJson();
  const list = Array.isArray(json.trustedSources) ? json.trustedSources : [];

  const map = new Map();
  for (const item of list) {
    const domain = String(item?.domain ?? "").toLowerCase().trim();
    const name = String(item?.name ?? "").trim();
    if (domain) map.set(domain, name || domain);
  }
  return map;
}

function isTrusted(domain, trustedSet) {
  if (!domain) return false;
  const d = String(domain).toLowerCase().trim();
  for (const t of trustedSet) {
    if (d === t || d.endsWith("." + t)) return true;
  }
  return false;
}

function isYmd(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function ymdFromDate(d) {
  if (!d || Number.isNaN(d.getTime())) return null;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function looksRelativeTime(s) {
  const t = String(s || "").toLowerCase();
  return (
    t.includes("ago") ||
    t.includes("hour") ||
    t.includes("hours") ||
    t.includes("minute") ||
    t.includes("minutes") ||
    t.includes("day") ||
    t.includes("days") ||
    t.includes("week") ||
    t.includes("weeks") ||
    (t.includes("month") && t.includes("ago")) ||
    t.includes("yesterday") ||
    t.includes("today")
  );
}

function has4DigitYear(s) {
  return /\b(19|20)\d{2}\b/.test(String(s || ""));
}

/**
 * Robust date normalization -> YYYY-MM-DD | null
 * RULES:
 * - Accept YYYY-MM-DD directly
 * - Accept strings that contain a 4-digit year (e.g., "Feb 27, 2024")
 * - Reject relative time strings like "3 days ago"
 * - If no year is present, return null (prevents wrong dates)
 */
function normalizeToYmd(input) {
  if (!input) return null;

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;

    if (isYmd(s)) return s;

    const m = s.match(/(\d{4}-\d{2}-\d{2})/);
    if (m && isYmd(m[1])) return m[1];

    if (looksRelativeTime(s)) return null;
    if (!has4DigitYear(s)) return null;

    const ms = Date.parse(s);
    if (!Number.isNaN(ms)) return ymdFromDate(new Date(ms));

    return null;
  }

  if (typeof input === "number") {
    const ms = input > 10_000_000_000 ? input : input * 1000;
    const d = new Date(ms);
    return ymdFromDate(d);
  }

  return null;
}

function parseDateLabelToMs(ymd) {
  if (!isYmd(ymd)) return 0;
  const ms = Date.parse(ymd + "T00:00:00Z");
  return Number.isNaN(ms) ? 0 : ms;
}

/**
 * Sort helper:
 * - dated first (desc)
 * - undated last
 */
function sortByPublishedDesc(a, b) {
  const am = parseDateLabelToMs(a?.publishedAt);
  const bm = parseDateLabelToMs(b?.publishedAt);
  if (am === bm) return 0;
  return bm - am;
}

/**
 * Trusted recency rule:
 * If ALL trusted are older than 6 months => keep ONLY the most recent trusted.
 */
function isFreshWithinMs(ymd, maxAgeMs) {
  if (!isYmd(ymd)) return false;
  const ms = parseDateLabelToMs(ymd);
  if (!ms) return false;
  return Date.now() - ms <= maxAgeMs;
}

/**
 * MUST:
 * 1) Always include at least 1 trusted (if any exist in the input list)
 * 2) Trusted article MUST appear before any untrusted article
 * 3) Within each group, order by publishedAt desc (missing dates go last)
 * 4) If ALL trusted are older than 6 months => output ONLY 1 trusted (the newest trusted)
 */
function pickAndOrderArticles(items, limit = 6) {
  const arr = Array.isArray(items) ? items.slice() : [];

  const trustedAll = arr.filter((x) => x?.isTrusted === true).sort(sortByPublishedDesc);
  const other = arr.filter((x) => x?.isTrusted !== true).sort(sortByPublishedDesc);

  const out = [];

  if (trustedAll.length > 0) {
    const SIX_MONTHS_MS = 183 * 24 * 60 * 60 * 1000;
    const anyFreshTrusted = trustedAll.some((t) => isFreshWithinMs(t?.publishedAt, SIX_MONTHS_MS));
    const trustedKeep = anyFreshTrusted ? trustedAll : trustedAll.slice(0, 1);

    for (const t of trustedKeep) {
      if (out.length >= limit) break;
      if (out.some((y) => (y?.url && y.url === t?.url) || (y?.id && y.id === t?.id))) continue;
      out.push(t);
    }
  }

  for (const x of other) {
    if (out.length >= limit) break;
    if (out.some((y) => (y?.url && y.url === x?.url) || (y?.id && y.id === x?.id))) continue;
    out.push(x);
  }

  return out.slice(0, limit);
}

/** --- Cache (avoid rate limits) --- */
let cachedPayload = null;
let cacheExpiresAtMs = 0;

/** --- In-flight lock: prevent parallel search calls --- */
let inFlightPromise = null;

function normalizeProvider(p) {
  const v = String(p || "auto").toLowerCase().trim();
  if (v === "brave" || v === "serper" || v === "auto") return v;
  return "auto";
}

function boolQuery(v) {
  return v === "1" || v === "true" || v === "yes";
}

function buildFaviconUrl(domain) {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

function clampExcerpt(text, min = 250, max = 350) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Merge results lists by URL (first wins), keep order: primary then secondary
 */
function mergeSearchResults(primary, secondary, limit = 10) {
  const out = [];
  const seen = new Set();

  const add = (arr) => {
    for (const r of arr || []) {
      const url = r?.url;
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push(r);
      if (out.length >= limit) return;
    }
  };

  add(primary);
  add(secondary);

  return out;
}

function summarizeProviderError(err) {
  const msg = String(err?.message ?? err ?? "");
  // Keep UI safe (no giant JSON dumped into hero)
  if (msg.includes("429") || msg.toLowerCase().includes("rate")) {
    return "Search is temporarily rate-limited. Please try again shortly.";
  }
  return "Search is temporarily unavailable. Please try again shortly.";
}

/**
 * Runs search based on provider strategy:
 * - provider=brave -> brave only
 * - provider=serper -> serper only
 * - provider=auto -> brave first, if fails -> serper
 * - merge=1 -> if brave succeeded, also call serper and merge (sequential)
 */
async function runSearchStrategy({ query, limit, provider, merge }) {
  const forcedProvider = provider;

  const runBrave = async () => {
    const raw = await braveSearchOnce(query, limit);
    return { provider: "brave", raw };
  };

  const runSerper = async () => {
    const raw = await serperSearchOnce(query, limit);
    return { provider: "serper", raw };
  };

  if (provider === "brave") {
    const { raw } = await runBrave();
    return { searchProvider: "brave", raw, merged: false, forcedProvider };
  }

  if (provider === "serper") {
    const { raw } = await runSerper();
    return { searchProvider: "serper", raw, merged: false, forcedProvider };
  }

  // Auto: brave first, fallback to serper
  try {
    const brave = await runBrave();

    if (merge) {
      try {
        const serper = await runSerper();
        const mergedRaw = mergeSearchResults(
          Array.isArray(brave.raw) ? brave.raw : [],
          Array.isArray(serper.raw) ? serper.raw : [],
          limit
        );
        return {
          searchProvider: "brave+serper",
          raw: mergedRaw,
          merged: true,
          forcedProvider: "auto",
        };
      } catch {
        return {
          searchProvider: "brave",
          raw: brave.raw,
          merged: false,
          forcedProvider: "auto",
        };
      }
    }

    return {
      searchProvider: "brave",
      raw: brave.raw,
      merged: false,
      forcedProvider: "auto",
    };
  } catch (err) {
    const serper = await runSerper();
    return {
      searchProvider: "serper",
      raw: serper.raw,
      merged: false,
      forcedProvider: "auto",
      braveError: String(err?.message ?? err),
    };
  }
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * TRUSTED-FIRST REAL SWEEP:
 * - Iterate the ENTIRE trusted list (in order)
 * - Run queries in small groups (max 8 domains per query)
 * - IMPORTANT: Keep ONLY results that actually match the trusted domains
 * - Merge/dedupe results
 * - Only after finishing the whole trusted list do we consider open web.
 */
async function runTrustedSweep({ baseQuery, trustedDomainsList, trustedSet, provider, merge }) {
  const chunks = chunkArray(trustedDomainsList, 8);
  let all = [];
  const providersUsed = new Set();

  for (let i = 0; i < chunks.length; i++) {
    const group = chunks[i].filter(Boolean);
    if (!group.length) continue;

    const clause = group.map((d) => `site:${d}`).join(" OR ");
    const q = `${baseQuery} (${clause})`;

    const r = await runSearchStrategy({
      query: q,
      limit: 10,
      provider,
      merge,
    });

    providersUsed.add(r.searchProvider);

    const rawArr = Array.isArray(r.raw) ? r.raw : [];

    // CRITICAL FIX:
    // Serper may return non-site results even with site: OR.
    // We filter back to only those whose domain is truly trusted.
    const filtered = rawArr.filter((item) => {
      const d = extractDomain(item?.url || "");
      return isTrusted(d, trustedSet);
    });

    all = mergeSearchResults(all, filtered, 200);
  }

  return {
    raw: all,
    sweepChunks: chunks.length,
    sweepProviders: Array.from(providersUsed),
  };
}

app.get("/api/updates", async (req, res) => {
  try {
    const now = Date.now();
    const cacheTtlMs = 30 * 60 * 1000;

    // IMPORTANT: allow env default provider
    const envProvider = normalizeProvider(process.env.SEARCH_PROVIDER);
    const provider = normalizeProvider(req.query.provider || envProvider || "auto");

    const refresh = boolQuery(req.query.refresh);
    const merge = boolQuery(req.query.merge);

    const cacheUsable =
      !refresh &&
      cachedPayload &&
      now < cacheExpiresAtMs &&
      cachedPayload?.debug?.forcedProvider === provider &&
      cachedPayload?.debug?.merged === Boolean(merge);

    if (cacheUsable) return res.json(cachedPayload);

    if (inFlightPromise) {
      const payload = await inFlightPromise;
      return res.json(payload);
    }

    inFlightPromise = (async () => {
      const trustedDomainsList = loadTrustedDomainsList();
      const trustedSet = loadTrustedDomainsSet();
      const trustedNameMap = loadTrustedNameMap();

      const baseQuery =
        "T Coronae Borealis nova forecast T CrB Blaze Star expected eruption date prediction";

      // 1) TRUSTED-FIRST sweep across ALL trusted domains in groups of 8 (filtered)
      const trustedSweep = await runTrustedSweep({
        baseQuery,
        trustedDomainsList,
        trustedSet,
        provider,
        merge,
      });

      const trustedRawArr = Array.isArray(trustedSweep.raw) ? trustedSweep.raw : [];

      // 2) Only after the entire trusted list: fetch broader web (to fill freshness)
      const webSearch = await runSearchStrategy({
        query: baseQuery,
        limit: 10,
        provider,
        merge,
      });

      const webRawArr = Array.isArray(webSearch.raw) ? webSearch.raw : [];

      // Merge: trusted first, then web (dedupe)
      const mergedRaw = mergeSearchResults(trustedRawArr, webRawArr, 200);

      const classified = mergedRaw
        .map((r, idx) => {
          const domain = extractDomain(r.url);
          const trusted = isTrusted(domain, trustedSet);

          let siteName = domain || "";
          if (trusted) {
            for (const [d, n] of trustedNameMap.entries()) {
              if (domain === d || domain.endsWith("." + d)) {
                siteName = n || domain;
                break;
              }
            }
          }

          const ymd = normalizeToYmd(r.publishedAt);

          return {
            id: `srch-${idx + 1}`,
            title: r.title,
            snippet: r.snippet,
            url: r.url,
            domain,
            siteName: siteName || domain || "",
            isTrusted: trusted,
            publishedAt: ymd, // YYYY-MM-DD or null
            faviconUrl: buildFaviconUrl(domain),
          };
        })
        .filter((x) => x.title && x.url);

      const forGroq = pickAndOrderArticles(classified, 12);

      const groqOut = await analyzeWithGroq({
        topic: "T Coronae Borealis / T CrB / Blaze Star nova eruption forecast",
        results: forGroq,
      });

      const heroUpdate = cleanHeroUpdate(groqOut?.heroUpdate);

      const articlesBase = forGroq.slice(0, 12).map((x) => ({
        id: x.id,
        isTrusted: x.isTrusted,
        siteName: x.siteName || x.domain || "",
        domain: x.domain || "",
        faviconUrl: x.faviconUrl || null,
        publishedAt: isYmd(x.publishedAt) ? x.publishedAt : null,
        title: String(x.title || "").trim(),
        excerpt: clampExcerpt(x.snippet, 250, 350),
        url: x.url,
      }));

      const articles = pickAndOrderArticles(articlesBase, 6);

      const payload = {
        heroUpdate,
        articles,
        debug: {
          searchProvider: `trusted-sweep(${trustedSweep.sweepChunks}x8, filtered): ${trustedSweep.sweepProviders.join(
            " | "
          )} -> web: ${webSearch.searchProvider}`,
          searchCount: classified.length,
          forcedProvider: provider,
          refresh,
          merged: Boolean(merge),
          braveError: webSearch?.braveError || null,
        },
      };

      cachedPayload = payload;
      cacheExpiresAtMs = Date.now() + cacheTtlMs;

      return payload;
    })();

    const payload = await inFlightPromise;
    inFlightPromise = null;
    return res.json(payload);
  } catch (err) {
    inFlightPromise = null;

    // If we have cached data, return it (best UX, avoids breaking UI)
    if (cachedPayload) {
      return res.status(200).json({
        ...cachedPayload,
        debug: {
          ...(cachedPayload.debug || {}),
          error: String(err?.message ?? err),
          usedCacheOnError: true,
        },
      });
    }

    const overloadMsg = summarizeProviderError(err);

    return res.status(200).json({
      heroUpdate: {
        status: "estimated",
        precise: {
          targetDateTimeUtc: "2026-05-01T20:30:00",
          visibility: { scope: "global", directionLabel: "All over the globe" },
          cities: [],
          meta: { sources: [], confidence: 0 },
        },
        estimated: {
          leadText: "According to the latest available sources",
          window: { type: "text", value: overloadMsg },
          visibility: { scope: "global", directionLabel: "All over the globe" },
          cities: [],
          meta: { sources: [], confidence: 0 },
        },
      },
      articles: [
        {
          id: "fallback-1",
          isTrusted: false,
          siteName: "Update service",
          domain: "",
          faviconUrl: null,
          publishedAt: null,
          title: "Temporary issue",
          excerpt: overloadMsg,
          url: "",
        },
      ],
      debug: {
        error: String(err?.message ?? err),
        forcedProvider: normalizeProvider(process.env.SEARCH_PROVIDER) || "auto",
        refresh: false,
        merged: false,
      },
    });
  }
});

/* ===== keep your existing helpers below unchanged ===== */

function stripLiteralString(x) {
  return x === "string" ? "" : x;
}

function cleanHeroUpdate(heroUpdate) {
  const hu = heroUpdate ?? {};
  const status = hu.status === "precise" ? "precise" : "estimated";

  const precise = hu.precise ?? {};
  const estimated = hu.estimated ?? {};

  const cleanPrecise = {
    targetDateTimeUtc: stripLiteralString(precise.targetDateTimeUtc) || "2026-05-01T20:30:00",
    visibility: {
      scope: stripLiteralString(precise?.visibility?.scope) || "global",
      directionLabel:
        stripLiteralString(precise?.visibility?.directionLabel) || "All over the globe",
    },
    cities: Array.isArray(precise.cities)
      ? precise.cities.map(stripLiteralString).filter(Boolean).slice(0, 6)
      : [],
    meta: {
      sources: Array.isArray(precise?.meta?.sources)
        ? precise.meta.sources.map(stripLiteralString).filter(Boolean).slice(0, 6)
        : [],
      confidence:
        typeof precise?.meta?.confidence === "number"
          ? Math.max(0, Math.min(1, precise.meta.confidence))
          : 0,
    },
  };

  if (
    typeof cleanPrecise.targetDateTimeUtc === "string" &&
    cleanPrecise.targetDateTimeUtc.endsWith("Z")
  ) {
    cleanPrecise.targetDateTimeUtc = cleanPrecise.targetDateTimeUtc.replace(/Z$/, "");
  }

  const cleanEstimated = {
    leadText:
      stripLiteralString(estimated.leadText) || "According to the latest available sources",
    window: (() => {
      const w = estimated.window ?? {};
      const type = w.type;
      if (type === "yearRange") {
        const from = Number.isFinite(w.from) ? w.from : 2025;
        const to = Number.isFinite(w.to) ? w.to : 2027;
        return { type: "yearRange", from, to };
      }
      if (type === "monthYear") {
        const value = stripLiteralString(w.value) || "2026May";
        return { type: "monthYear", value };
      }
      const value = stripLiteralString(w.value) || "Updates vary; monitoring continues.";
      return { type: "text", value };
    })(),
    visibility: {
      scope: stripLiteralString(estimated?.visibility?.scope) || "global",
      directionLabel:
        stripLiteralString(estimated?.visibility?.directionLabel) || "All over the globe",
    },
    cities: Array.isArray(estimated.cities)
      ? estimated.cities.map(stripLiteralString).filter(Boolean).slice(0, 6)
      : [],
    meta: {
      sources: Array.isArray(estimated?.meta?.sources)
        ? estimated.meta.sources.map(stripLiteralString).filter(Boolean).slice(0, 6)
        : [],
      confidence:
        typeof estimated?.meta?.confidence === "number"
          ? Math.max(0, Math.min(1, precise.meta.confidence))
          : 0,
    },
  };

  if (status === "estimated") {
    cleanPrecise.meta.confidence = Math.min(cleanPrecise.meta.confidence, 0.2);
    if (!cleanPrecise.meta.sources.length) cleanPrecise.meta.sources = [];
  }

  return { status, precise: cleanPrecise, estimated: cleanEstimated };
}

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
