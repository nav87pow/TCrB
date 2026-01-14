// server/groqAnalyze.js
// Produces payload in SAME KEY STYLE as mockUpdates.json for articles:
// articles: [{ id, source, dateLabel, title, excerpt }]
// heroUpdate: { status, estimated: {...}, precise: {...} }

import Groq from "groq-sdk";
import { searchBrave } from "./searchBrave.js";

function yearRange(from, to) {
  return { type: "yearRange", from, to };
}

function textWindow(value) {
  return { type: "text", value };
}

function visibility(scope, directionLabel) {
  return { scope, directionLabel };
}

function meta(confidence = 0, sources = []) {
  return { confidence, sources };
}

function fallbackHeroUpdate(reasonText = "Search/analyzer unavailable") {
  return {
    status: "estimated",
    estimated: {
      leadText: "According to the latest available sources",
      window: textWindow(reasonText),
      visibility: visibility("global", "All over the globe"),
      meta: meta(0, []),
      cities: [],
    },
    precise: {
      targetDateTimeUtc: null,
      visibility: visibility("global", "All over the globe"),
      meta: meta(0, []),
      cities: [],
    },
  };
}

function monthLabelFromISO(iso) {
  if (!iso) return "recent";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "recent";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function buildArticlesFromSearchResults(results, limit = 6) {
  const list = Array.isArray(results) ? results.slice(0, limit) : [];
  return list
    .map((r, idx) => ({
      id: `srch-${idx + 1}`,
      source: r?.domain ? String(r.domain).toUpperCase() : "WEB",
      dateLabel: monthLabelFromISO(r?.publishedAt),
      title: String(r?.title || "").trim(),
      excerpt: String(r?.description || r?.snippet || "").trim(),
    }))
    .filter((a) => a.title);
}

/**
 * IMPORTANT:
 * - Never crash if GROQ_API_KEY is missing.
 * - If Brave fails (e.g., 429), return heroUpdate+articles with SAME keys.
 *
 * @param {{ query?: string }} args
 * @returns {Promise<{heroUpdate: any, articles: any[]}>}
 */
export async function analyzeWithGroq(args = {}) {
  const query = String(args?.query || "T Coronae Borealis nova forecast").trim();

  // 1) Brave search
  let searchResults = [];
  try {
    searchResults = await searchBrave(query, { count: 6 });
  } catch (e) {
    const msg = String(e?.message || e);
    return {
      heroUpdate: fallbackHeroUpdate(msg),
      articles: [
        {
          id: "fallback-1",
          source: "WEB",
          dateLabel: "recent",
          title: "Fallback (search error)",
          excerpt: msg,
        },
      ],
    };
  }

  // Always build articles with the MOCK KEYS
  const articles = buildArticlesFromSearchResults(searchResults, 6);

  // 2) Groq analysis (optional). If missing key -> do not crash.
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      heroUpdate: {
        status: "estimated",
        estimated: {
          leadText: "According to the latest available sources",
          window: yearRange(new Date().getUTCFullYear(), new Date().getUTCFullYear() + 2),
          visibility: visibility("global", "All over the globe"),
          meta: meta(0, []),
          cities: [],
        },
        precise: {
          targetDateTimeUtc: null,
          visibility: visibility("global", "All over the globe"),
          meta: meta(0, []),
          cities: [],
        },
      },
      articles,
    };
  }

  // 3) If Groq exists, enrich heroUpdate. Keep schema EXACT.
  try {
    const groq = new Groq({ apiKey });

    const sourcesList = searchResults
      .map((r) => r?.domain)
      .filter(Boolean)
      .slice(0, 6);

    const prompt = [
      "You are analyzing the latest web sources about T Coronae Borealis (T CrB) / Blaze Star.",
      "Return JSON ONLY in this exact shape:",
      "{",
      '  "status": "estimated" | "precise",',
      '  "estimated": { "leadText": string, "window": { "type":"yearRange","from":number,"to":number } | { "type":"text","value":string }, "visibility": { "scope":"global"|"north"|"south", "directionLabel": string }, "meta": { "confidence": number, "sources": string[] }, "cities": string[] },',
      '  "precise": { "targetDateTimeUtc": string|null, "visibility": { "scope":"global"|"north"|"south", "directionLabel": string }, "meta": { "confidence": number, "sources": string[] }, "cities": string[] }',
      "}",
      "",
      `Web source domains (for meta.sources): ${sourcesList.join(", ") || "none"}`,
      "",
      "If you cannot infer a precise date, keep status='estimated' and precise.targetDateTimeUtc = null.",
    ].join("\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const content = completion?.choices?.[0]?.message?.content || "";
    let parsed = null;

    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = null;
    }

    if (!parsed || typeof parsed !== "object") {
      return {
        heroUpdate: {
          status: "estimated",
          estimated: {
            leadText: "According to the latest available sources",
            window: yearRange(new Date().getUTCFullYear(), new Date().getUTCFullYear() + 2),
            visibility: visibility("global", "All over the globe"),
            meta: meta(0, sourcesList),
            cities: [],
          },
          precise: {
            targetDateTimeUtc: null,
            visibility: visibility("global", "All over the globe"),
            meta: meta(0, sourcesList),
            cities: [],
          },
        },
        articles,
      };
    }

    const heroUpdate = {
      status: parsed.status === "precise" ? "precise" : "estimated",
      estimated: {
        leadText: String(parsed?.estimated?.leadText || "According to the latest available sources"),
        window:
          parsed?.estimated?.window && typeof parsed.estimated.window === "object"
            ? parsed.estimated.window
            : yearRange(new Date().getUTCFullYear(), new Date().getUTCFullYear() + 2),
        visibility:
          parsed?.estimated?.visibility && typeof parsed.estimated.visibility === "object"
            ? parsed.estimated.visibility
            : visibility("global", "All over the globe"),
        meta:
          parsed?.estimated?.meta && typeof parsed.estimated.meta === "object"
            ? parsed.estimated.meta
            : meta(0, sourcesList),
        cities: Array.isArray(parsed?.estimated?.cities) ? parsed.estimated.cities : [],
      },
      precise: {
        targetDateTimeUtc: parsed?.precise?.targetDateTimeUtc ?? null,
        visibility:
          parsed?.precise?.visibility && typeof parsed.precise.visibility === "object"
            ? parsed.precise.visibility
            : visibility("global", "All over the globe"),
        meta:
          parsed?.precise?.meta && typeof parsed.precise.meta === "object"
            ? parsed.precise.meta
            : meta(0, sourcesList),
        cities: Array.isArray(parsed?.precise?.cities) ? parsed.precise.cities : [],
      },
    };

    return { heroUpdate, articles };
  } catch (e) {
    const msg = String(e?.message || e);
    return {
      heroUpdate: fallbackHeroUpdate(`Groq unavailable: ${msg}`),
      articles,
    };
  }
}
