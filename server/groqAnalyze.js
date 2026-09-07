// server/groqAnalyze.js
// Produces payload in SAME KEY STYLE as mockUpdates.json for articles:
// articles: [{ id, source, dateLabel, title, excerpt }]
// heroUpdate: { status, estimated: {...}, precise: {...} }

import Groq from "groq-sdk";

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

//function monthLabelFromISO(iso) {
//  if (!iso) return "recent";
//  const d = new Date(iso);
//  if (Number.isNaN(d.getTime())) return "recent";
//  const yyyy = d.getUTCFullYear();
//  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
//  return `${yyyy}-${mm}`;
//}

function buildArticlesFromSearchResults(results, limit = 20) {
  const list = Array.isArray(results) ? results.slice(0, limit) : [];

  return list
    .map((r) => ({
      id: r?.id,
    }))
    .filter((a) => a.id);
}

/**
 * IMPORTANT:
 * - Never crash if GROQ_API_KEY is missing.
 * - Analyze only the supplied search results.
 *
 * @param {{ results?: any[] }} args
 * @returns {Promise<{heroUpdate: any, articles: any[]}>}
 */
export async function analyzeWithGroq(args = {}) {
  const query = String(args?.query || "T Coronae Borealis nova forecast").trim();

  let searchResults = Array.isArray(args?.results) ? args.results : [];

  const articles = buildArticlesFromSearchResults(searchResults, 12);

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
  .slice(0, 20);

const prompt = [
  "You are analyzing supplied web search results about T Coronae Borealis (T CrB) / Blaze Star.",

  "ARTICLE SELECTION RULES:",
  "Select an article only when its supplied title or text makes a substantive claim about the future timing of the next T CrB nova eruption or outburst.",
  "A qualifying timing claim must include at least one of the following: a specific predicted date, a predicted month or year, a date range, an eruption window, a monitoring window connected to eruption timing, or a probability tied to a future time period.",
  "The timing claim must refer specifically to the next eruption or outburst of T Coronae Borealis.",
  "Do not select an article merely because it mentions T CrB, Blaze Star, nova, eruption, outburst, prediction, monitoring, or a date.",
  "Exclude general descriptions, encyclopedia pages, historical summaries, observing guides without a forecast, unrelated binary-star articles, unrelated occultation predictions, and pages that only describe past eruptions or brightness variations.",
  "Do not treat text found only in citations, references, bibliographies, navigation, related-links sections, or quoted article titles as a forecast made by the article.",
  "Do not treat publishedAt, publication dates, update dates, retrieval dates, or dates inside citations as predicted eruption dates.",
  "If the supplied text is insufficient to confirm a real future timing claim, exclude the article.",
  "Article selection is based on relevance, not on isTrusted. Use only the supplied article id values and never create a new id.",

  "FORECAST RULES:",
  "Use status precise only when the supplied text explicitly states a specific predicted eruption date and time that can be represented as targetDateTimeUtc.",
  "Never invent a day, time, timezone, or timestamp.",
  "A year, month, approximate date, date range, monitoring window, probability interval, or wording such as around, likely, possible, expected, or within the next year is not precise.",
  "For every non-precise forecast use status estimated and represent the forecast using estimated.window.",
  "If the source gives a year range, use estimated.window type yearRange.",
  "For a month, approximate date, probability interval, monitoring window, or other forecast wording, use estimated.window type text.",
  "If no qualifying forecast can be supported by the supplied text, use status estimated and set precise.targetDateTimeUtc to null.",
  "Do not combine conflicting forecasts into a new date or window that no supplied article states.",

  "OUTPUT RULES:",
  "Keep estimated.leadText short and concise.",
  "If estimated.window uses type text, keep estimated.window.value short and include only the supported forecast window.",
  "Do not place article summaries, explanations, source lists, citations, or reasoning inside estimated.leadText or estimated.window.value.",
  "Return raw JSON only. Do not use Markdown or code fences.",

  "Return JSON ONLY in this exact shape:",
  "{",
  '  "status": "estimated" | "precise",',
  '  "estimated": { "leadText": string, "window": { "type":"yearRange","from":number,"to":number } | { "type":"text","value":string }, "visibility": { "scope":"global"|"north"|"south", "directionLabel": string }, "meta": { "confidence": number, "sources": string[] }, "cities": string[] },',
  '  "precise": { "targetDateTimeUtc": string|null, "visibility": { "scope":"global"|"north"|"south", "directionLabel": string }, "meta": { "confidence": number, "sources": string[] }, "cities": string[] },',
  '  "articles": [{ "id": string }]',
  "}",
  "",
  `Web source domains (for meta.sources): ${sourcesList.join(", ") || "none"}`,
  "",
  `Articles to analyze: ${JSON.stringify(searchResults)}`,
].join("\n");

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
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

return {
  heroUpdate,
  articles: Array.isArray(parsed?.articles)
    ? parsed.articles
        .map((a) => ({
          id: a?.id,
        }))
        .filter((a) => a.id)
    : articles,
};
  } catch (e) {
    const msg = String(e?.message || e);
    return {
      heroUpdate: fallbackHeroUpdate(`Groq unavailable: ${msg}`),
      articles,
    };
  }
}
