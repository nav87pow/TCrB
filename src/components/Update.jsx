// src/components/Update.jsx
import React, { useEffect, useMemo, useState } from "react";
import BottomNav from "./BottomNav.jsx";
import InfoOverlay from "./InfoOverlay.jsx";
import HeroUpdate from "./HeroUpdate";
import mock from "../data/mockUpdates.json";
import ArticlesList from "./ArticlesList";

export default function Update({ session }) {
  const [infoOpen, setInfoOpen] = useState(false);

  // PWA install prompt (Download)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

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

  async function handleRefresh() {
    console.log("[Refresh] requested (placeholder)");
    await new Promise((r) => setTimeout(r, 400));
    console.log("[Refresh] done (placeholder)");
  }

  function handleDonate() {
    console.log("[Donate] clicked");
    const donateUrl = "https://example.com/donate";
    window.open(donateUrl, "_blank", "noopener,noreferrer");
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
  
const isAnonymous = session?.isAnonymous === true;

const hasGeoPermission =
  session?.locationPermission === "granted" && !!session?.location;

const userContext = {
  isAnonymous,
  hasGeoPermission,
  // אנונימי = לא מחזירים שום timezone, וגם לא fallback מהדפדפן
  userTimezone: isAnonymous ? null : (session?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
};



  console.groupCollapsed("[Update] hero context");
  console.log("userContext:", userContext);
  console.log("heroUpdate data:", mock.heroUpdate);
  console.groupEnd();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-stone-50, #fafaf9)",
        padding: 0,
        paddingBottom: pagePaddingBottom,
      }}
    >
            <HeroUpdate
      heroUpdate={mock.heroUpdate}
      userContext={userContext}
    />
<ArticlesList />
      <p>update page</p>

      <InfoOverlay open={infoOpen} onClose={() => setInfoOpen(false)} />

      <BottomNav
        onRefresh={handleRefresh}
       onDonate={() => {
    window.open(
      "https://buymeacoffee.com/nav87pow",
      "_blank",
      "noopener,noreferrer"
    );
  }}
        onInfo={handleInfo}
        onDownload={handleDownload}
      />
    </main>
  );
}
