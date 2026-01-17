// src/components/Update.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import BottomNav from "./BottomNav.jsx";
import InfoOverlay from "./InfoOverlay.jsx";
import DownloadOverlay from "./DownloadOverlay.jsx";
import HeroUpdate from "./HeroUpdate";
import ArticlesList from "./ArticlesList";

console.log("UPDATE COMPONENT MOUNTED");

// Base URL for API (set in root .env as: VITE_API_BASE_URL=https://tcrb.onrender.com)
// If empty, we fall back to same-origin (/api/...) which works with Vite proxy in dev.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

// נקודת בדיקה בלבד: להפעיל true כדי לכפות serper + bypass cache
const DEBUG_FORCE_SERPER = false;

/* ===== Mock helpers (professional debug via URL) ===== */

function getMockMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    return (params.get("mock") || "").toLowerCase().trim();
  } catch {
    return "";
  }
}

function buildMockCountdownPayload() {
  // יעד עתידי קרוב כדי שתהיה ספירה לאחור מיד (שעתיים קדימה)
  const target = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const yyyy = target.getUTCFullYear();
  const mm = String(target.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(target.getUTCDate()).padStart(2, "0");
  const hh = String(target.getUTCHours()).padStart(2, "0");
  const mi = String(target.getUTCMinutes()).padStart(2, "0");

  // אצלכם השרת מסיר Z, אז נשמור אותו בלי Z בפורמט: YYYY-MM-DDTHH:mm:00
  const targetDateTimeUtc = `${yyyy}-${mm}-${dd}T${hh}:${mi}:00`;

  return {
    heroUpdate: {
      status: "precise",
      precise: {
        targetDateTimeUtc,
        visibility: { scope: "global", directionLabel: "All over the globe" },
        cities: ["Berlin", "London", "New York"],
        meta: { sources: ["NASA", "AAVSO"], confidence: 0.9 },
      },
      estimated: {
        leadText: "According to the latest available sources",
        window: { type: "yearRange", from: 2026, to: 2028 },
        visibility: { scope: "global", directionLabel: "All over the globe" },
        cities: [],
        meta: { sources: [], confidence: 0.2 },
      },
    },
    articles: [],
    debug: { mock: "countdown" },
  };
}

export default function Update({ session }) {
  const [infoOpen, setInfoOpen] = useState(false);

  // ✅ Download popup (separate from InfoOverlay)
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadFallback, setDownloadFallback] = useState(false);

  // PWA install prompt (Download)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const canInstall = !!deferredInstallPrompt;

  // Live data state
  const [updates, setUpdates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    console.log("[Update] mounted", session);

    const handler = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      console.log("[PWA] beforeinstallprompt captured");
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [session]);

  const pagePaddingBottom = useMemo(() => 86, []);

  const isAnonymous = session?.isAnonymous === true;

  const hasGeoPermission =
    session?.locationPermission === "granted" && !!session?.location;

  const userContext = useMemo(
    () => ({
      isAnonymous,
      hasGeoPermission,
      // אנונימי = לא מחזירים שום timezone, וגם לא fallback מהדפדפן
      userTimezone: isAnonymous
        ? null
        : session?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
    [isAnonymous, hasGeoPermission, session?.timeZone]
  );

  const fetchUpdates = useCallback(async () => {
    setLoadError("");
    setLoading(true);

    try {
      // Professional debug: ?mock=countdown
      const mockMode = getMockMode();
      if (mockMode === "countdown") {
        const mock = buildMockCountdownPayload();
        console.log("[Update] MOCK payload:", mock);
        setUpdates(mock);
        return;
      }

      const path = DEBUG_FORCE_SERPER
        ? "/api/updates?refresh=1&provider=serper"
        : "/api/updates";

      const url = API_BASE ? `${API_BASE}${path}` : path;

      console.log("[Update] fetching:", url);

      const res = await fetch(url, { cache: "no-store" });

      // Helpful error if server returns non-JSON / empty body
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `HTTP ${res.status} ${res.statusText}${
            text ? ` — ${text.slice(0, 120)}` : ""
          }`
        );
      }

      const json = await res.json();

      if (!json || typeof json !== "object") {
        throw new Error("Invalid /api/updates response");
      }

      setUpdates(json);

      console.groupCollapsed("[Update] LIVE /api/updates");
      console.log("userContext:", userContext);
      console.log("payload:", json);

      // אם השרת החזיר debug, זה יראה לך מייד מי provider בפועל
      if (json?.debug) console.log("debug:", json.debug);

      console.groupEnd();
    } catch (e) {
      const msg = String(e?.message ?? e);
      console.error("[Update] failed to load /api/updates:", msg);
      setLoadError(msg);
      setUpdates(null);
    } finally {
      setLoading(false);
    }
  }, [userContext]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  async function handleRefresh() {
    console.log("[Refresh] requested (live)");
    await fetchUpdates();
    console.log("[Refresh] done (live)");
  }

  function handleDonate() {
    console.log("[Donate] clicked");
    window.open(
      "https://buymeacoffee.com/nav87pow",
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleInfo() {
    console.log("[Info] clicked");
    setInfoOpen(true);
  }

  // Download button now opens a confirm popup (does NOT open InfoOverlay)
  function handleDownload() {
    console.log("[Download] clicked (open confirm popup)");
    setDownloadFallback(false);
    setDownloadOpen(true);
  }

  // Called from the popup primary button
  async function confirmDownload() {
    console.log("[Download] confirm install");

    if (!deferredInstallPrompt) {
      // no prompt available → show fallback hint inside the popup
      setDownloadFallback(true);
      return;
    }

    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    console.log("[PWA] userChoice", choice);
    setDeferredInstallPrompt(null);
    setDownloadOpen(false);
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--color-stone-50, #fafaf9)",
          padding: 0,
          paddingBottom: pagePaddingBottom,
        }}
      >
        <div className="mx-auto w-full px-6 pt-10">
          <p className="text-sm opacity-70">Loading updates…</p>
        </div>

        <InfoOverlay open={infoOpen} onClose={() => setInfoOpen(false)} />

        <DownloadOverlay
          open={downloadOpen}
          onClose={() => setDownloadOpen(false)}
          onConfirm={confirmDownload}
          canInstall={canInstall}
          showFallback={downloadFallback}
        />

        <BottomNav
          onRefresh={handleRefresh}
          onDonate={handleDonate}
          onInfo={handleInfo}
          onDownload={handleDownload}
        />
      </main>
    );
  }

  if (loadError) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--color-stone-50, #fafaf9)",
          padding: 0,
          paddingBottom: pagePaddingBottom,
        }}
      >
        <div className="mx-auto w-full px-6 pt-10">
          <p className="text-sm">Could not load live updates.</p>
          <p className="mt-2 text-xs opacity-70">{loadError}</p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold"
          >
            Retry
          </button>
        </div>

        <InfoOverlay open={infoOpen} onClose={() => setInfoOpen(false)} />

        <DownloadOverlay
          open={downloadOpen}
          onClose={() => setDownloadOpen(false)}
          onConfirm={confirmDownload}
          canInstall={canInstall}
          showFallback={downloadFallback}
        />

        <BottomNav
          onRefresh={handleRefresh}
          onDonate={handleDonate}
          onInfo={handleInfo}
          onDownload={handleDownload}
        />
      </main>
    );
  }

  const heroUpdate = updates?.heroUpdate;
  const articles = Array.isArray(updates?.articles) ? updates.articles : [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-stone-50, #fafaf9)",
        padding: 0,
        paddingBottom: pagePaddingBottom,
      }}
    >
      <HeroUpdate heroUpdate={heroUpdate} userContext={userContext} />

      <ArticlesList articles={articles} limit={6} />

      <InfoOverlay open={infoOpen} onClose={() => setInfoOpen(false)} />

      <DownloadOverlay
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        onConfirm={confirmDownload}
        canInstall={canInstall}
        showFallback={downloadFallback}
      />

      <BottomNav
        onRefresh={handleRefresh}
        onDonate={handleDonate}
        onInfo={handleInfo}
        onDownload={handleDownload}
      />
    </main>
  );
}

console.log("[env] VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
console.log("[env] API_BASE =", API_BASE);
