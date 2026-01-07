import React, { useEffect, useMemo, useState } from "react";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function diffToParts(targetMs, nowMs) {
  const total = Math.max(0, targetMs - nowMs);
  const sec = Math.floor(total / 1000);

  const days = Math.floor(sec / (24 * 3600));
  const hours = Math.floor((sec % (24 * 3600)) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  return { totalMs: total, days, hours, minutes, seconds };
}

/**
 * Countdown
 * - precise => shows countdown
 * - estimated / unclear => shows "let׳s be patience"
 *
 * NOTE: timezone handling will be refined once your geo/timezone state is wired.
 * For now we still log the basis you pass in userContext and keep the countdown based on UTC target.
 */
export default function Countdown({ status, precise, userContext }) {
  const [nowMs, setNowMs] = useState(Date.now());

  const targetDateTimeUtc = precise?.targetDateTimeUtc || null;

  // Decide timeBasis (for logging now; later will affect calculations if needed)
  const { timeBasis, resolvedTimezone } = useMemo(() => {
    const isAnonymous = !!userContext?.isAnonymous;
    const hasGeoPermission = !!userContext?.hasGeoPermission;

    if (status !== "precise") {
      return { timeBasis: "n/a", resolvedTimezone: "n/a" };
    }

    if (hasGeoPermission) {
      return {
        timeBasis: "user",
        resolvedTimezone: userContext?.userTimezone || "user-local",
      };
    }

    if (isAnonymous) {
      return {
        timeBasis: "target",
        resolvedTimezone: "target-timezone",
      };
    }

    return {
      timeBasis: "target",
      resolvedTimezone: "target-timezone",
    };
  }, [status, userContext]);

  useEffect(() => {
    if (status !== "precise") return;

    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const parts = useMemo(() => {
    if (status !== "precise" || !targetDateTimeUtc) return null;
    const targetMs = new Date(targetDateTimeUtc).getTime();
    return diffToParts(targetMs, nowMs);
  }, [status, targetDateTimeUtc, nowMs]);

  console.groupCollapsed("[Countdown] render");
  console.log("status:", status);

  if (status === "precise") {
    console.log("mode:", "countdown");
    console.log("targetDateTimeUtc:", targetDateTimeUtc);
    console.log("timeBasis:", timeBasis);
    console.log("resolvedTimezone:", resolvedTimezone);
    console.log("parts:", parts);
  } else {
    console.log("mode:", "patience");
    console.log("text:", "let׳s be patience");
  }

  console.groupEnd();

  if (status !== "precise") {
    return (
<div className="w-full bgBright h-[188px] flex items-center justify-center text-center">
        <h1 className="h1title">
let׳s be patience        </h1>
      </div>
    );
  }

  // Fallback if precise but missing date
  if (!parts) {
    return (
<div className="w-full bgBright h-[188px] flex items-center justify-center text-center">
        <h1 className="h1title">
let׳s be patience        </h1>
      </div>
    );
  }

  return (
    <div className="w-full bgBright py-10">
     <div
  className="
    flex
    w-[24.5625rem]
    items-center
    justify-center
    gap-[1.375rem]
    pt-12
    pb-[2.875rem]
    mx-auto
    text-center
  "
>

        <div>
          <div className="countNum">{pad2(parts.days)}</div>
          <div className="countLabel">DAYS</div>
        </div>
        <div>
          <div className="countNum">{pad2(parts.hours)}</div>
          <div className="countLabel">HOUR</div>
        </div>
        <div>
          <div className="countNum">{pad2(parts.minutes)}</div>
          <div className="countLabel">MINUTE</div>
        </div>
        <div>
          <div className="countNum">{pad2(parts.seconds)}</div>
          <div className="countLabel">SECOND</div>
        </div>
      </div>
    </div>
  );
}
