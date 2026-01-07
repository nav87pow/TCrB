import React, { useEffect, useMemo, useState } from "react";
import NavButton from "./NavButton.jsx";

const COOLDOWN_MINUTES = 30;

function formatCountdown(msRemaining) {
  if (msRemaining <= 0) return null;

  const totalSeconds = Math.ceil(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function BottomNav({
  onRefresh,
  onDonate,
  onInfo,
  onDownload,
  initialCooldownMinutes = COOLDOWN_MINUTES, // מאפשר לשנות בעתיד בלי לגעת בקוד
}) {
  const [nowTs, setNowTs] = useState(Date.now());

  // cooldown מנוהל כאן בלבד
  const [cooldownUntilTs, setCooldownUntilTs] = useState(() => {
    // ברגע שהסרגל נטען — מתחילים cooldown מייד
    return Date.now() + initialCooldownMinutes * 60 * 1000;
  });

  // tick 1s בתוך הסרגל בלבד
  useEffect(() => {
    const id = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const msRemaining = useMemo(() => {
    return Math.max(0, cooldownUntilTs - nowTs);
  }, [cooldownUntilTs, nowTs]);

  const refreshDisabled = msRemaining > 0;
  const bubbleText = formatCountdown(msRemaining);

  async function handleRefreshClick() {
    // שכבת הגנה: אם עדיין cooldown — לא עושים כלום
    if (Date.now() < cooldownUntilTs) return;

    try {
      await onRefresh?.();
    } finally {
      // מתחילים cooldown חדש אחרי בקשת refresh
      setCooldownUntilTs(Date.now() + initialCooldownMinutes * 60 * 1000);
    }
  }

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        background: "rgba(255,255,255,0.9)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        backdropFilter: "blur(6px)",
      }}
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around gap-3 px-3 py-[10px] h-[7.1875rem]">

      
        <NavButton icon="❤" label="Donate" onClick={onDonate} />
        <NavButton icon="🛈" label="Info" onClick={onInfo} />
        <NavButton icon="⮋" label="Download" onClick={onDownload} />
        <NavButton
          icon="⭮"
          label="Refresh"
          onClick={handleRefreshClick}
          disabled={refreshDisabled}
          bubbleText={bubbleText}
        />
      </div>
    </nav>
  );
}
