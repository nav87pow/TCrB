// server/searchSerper.js

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

function normalizeToYmd(input) {
  if (!input) return null;

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;

    if (isYmd(s)) return s;

    const m = s.match(/(\d{4}-\d{2}-\d{2})/);
    if (m && isYmd(m[1])) return m[1];

    const ms = Date.parse(s);
    if (!Number.isNaN(ms)) return ymdFromDate(new Date(ms));

    return null;
  }

  return null;
}

export async function serperSearchOnce(query, limit = 10) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    const err = new Error("Missing SERPER_API_KEY in server/.env");
    err.status = 500;
    throw err;
  }

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      num: limit,
    }),
  });

  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(`Serper search failed: ${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  const organic = Array.isArray(data?.organic) ? data.organic : [];

  return organic.slice(0, limit).map((r) => {
    const publishedAt =
      normalizeToYmd(r?.date) ||
      normalizeToYmd(r?.snippet) ||
      null;

    return {
      title: r?.title || "",
      url: r?.link || "",
      snippet: r?.snippet || "",
      publishedAt, // YYYY-MM-DD | null (best-effort)
    };
  });
}
