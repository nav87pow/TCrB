// src/components/Update.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import BottomNav from "./BottomNav.jsx";
import InfoOverlay from "./InfoOverlay.jsx";
import HeroUpdate from "./HeroUpdate";
import ArticlesList from "./ArticlesList";

console.log("UPDATE COMPONENT MOUNTED");

// Base URL for API (set in root .env as: VITE_API_BASE_URL=https://tcrb.onrender.com)
// If empty, we fall back to same-origin (/api/...) which works with Vite proxy in dev.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");

// נקודת בדיקה בלבד: להפעיל true כדי לכפות serper + bypass cache
const DEBUG_FORCE_SERPER = false;

export default function Update({ session }) {
  const [infoOpen, setInfoOpen] = useState(false);

  // PWA install prompt (Download)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

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
      const path = DEBUG_FORCE_SERPER
        ? "/api/updates?refresh=1&provider=serper"
        : "/api/updates";

      const url = API_BASE ? `${API_BASE}${path}` : path;

      console.log("[Update] fetching:", url);

      const res = await fetch(url, { cache: "no-store" });

      // Helpful error if server returns non-JSON / empty body
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 120)}` : ""}`);
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

  async function handleDownload() {
    console.log("[Download] clicked");

    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      console.log("[PWA] userChoice", choice);
      setDeferredInstallPrompt(null);
      return;
    }

    setInfoOpen(true);
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
        <div className="mx-auto w-full max-w-[26rem] px-6 pt-10">
          <p className="text-sm opacity-70">Loading updates…</p>
        </div>

        <InfoOverlay open={infoOpen} onClose={() => setInfoOpen(false)} />

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
        <div className="mx-auto w-full max-w-[26rem] px-6 pt-10">
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

      <ArticlesList articles={articles} />

      <InfoOverlay open={infoOpen} onClose={() => setInfoOpen(false)} />

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
