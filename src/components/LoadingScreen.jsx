
import { useState } from "react";

function buildBaseSession({ includeTime } = { includeTime: true }) {
  const now = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;

  return {
    createdAtISO: includeTime ? now.toISOString() : null,
    localTimeText: includeTime ? now.toLocaleString() : null,
    timeZone: includeTime ? timeZone : null,

    isAnonymous: true,
    location: null,
    locationPermission: "unknown",
  };
}

export function LoadingScreen({ onEnter }) {
  const [showConsent, setShowConsent] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function enterAnonymous(reason = "skipped") {
    console.log("[LoadingScreen] enterAnonymous()", reason);

    const base = buildBaseSession({ includeTime: false });

    onEnter({
      ...base,
      isAnonymous: true,
      locationPermission: reason,
    });
  }

  function requestLocationAndEnter() {
    console.log("[LoadingScreen] requestLocationAndEnter()");

    setIsBusy(true);
    setErrorMsg("");

    const base = buildBaseSession({ includeTime: true });

    if (!("geolocation" in navigator)) {
      console.log("[LoadingScreen] Geolocation API not available");
      setIsBusy(false);

      onEnter({
        ...base,
        isAnonymous: true,
        locationPermission: "denied",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        console.log("[LoadingScreen] Geolocation SUCCESS", {
          latitude,
          longitude,
          accuracy,
        });

        setIsBusy(false);

        onEnter({
          ...base,
          isAnonymous: false,
          locationPermission: "granted",
          location: {
            lat: latitude,
            lon: longitude,
            accuracy,
          },
        });
      },
      (err) => {
        console.log("[LoadingScreen] Geolocation ERROR", err);

        setIsBusy(false);
        setErrorMsg(err?.message || "Location request failed.");

        onEnter({
          ...base,
          isAnonymous: true,
          locationPermission: "denied",
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  }

  return (
    <div className="bgBright fixed inset-0 flex flex-col items-center justify-center fire-gradient fire-texture z-50">
      <div className="text-center space-y-8 px-6 flex-1 flex flex-col items-center justify-center">
        <div className="space-y-4">
          <h1 className="title">CHECKING FOR</h1>
          <h2 className="text-6xl md:text-7xl font-black text-primary uppercase tracking-wider">
            TCRB
          </h2>
          <h1 className="title animate-pulse"> UPDATE..</h1>

          {errorMsg ? (
            <p className="text-sm text-primary/80" style={{ maxWidth: 520 }}>
              {errorMsg}
            </p>
          ) : null}
        </div>
      </div>

      <div className="w-full my-8 max-w-md px-6 pb-12 space-y-4 flex flex-col items-center">
        <button
          className="btn btnPrimary"
          onClick={() => {
            console.log("[LoadingScreen] Location button clicked");
            setShowConsent(true);
          }}
          disabled={isBusy}
        >
          {isBusy ? "Requesting..." : "Update By My Location"}
        </button>

        <button
          className="btn btnSecondary"
          onClick={() => enterAnonymous("skipped")}
          disabled={isBusy}
        >
          Anonymous Update
        </button>
      </div>

      <div className="absolute bottom-4 text-center text-xs text-primary/70 max-w-md px-6">
        <p className="text-balance font-semibold">
          The information is based on public sources and automated summarization.
          No guarantee of accuracy or real-time timing.
        </p>
      </div>

      {showConsent ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.35)" }}
            onClick={() => (isBusy ? null : setShowConsent(false))}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-primary">
              Location Permission
            </h3>
            <p className="mt-2 text-sm text-primary/80">
              By continuing, I confirm that I approve sharing my current
              geolocation for this update.
            </p>

            <div className="text-xs mt-5 flex gap-3 justify-end">
              <button
                className="btn btnSecondary"
                onClick={() => {
                  if (isBusy) return;
                  setShowConsent(false);
                  enterAnonymous("skipped");
                }}
                disabled={isBusy}
              >
                Continue Anonymously
              </button>

              <button
                className="btn btnPrimary"
                onClick={() => {
                  if (isBusy) return;
                  console.log("[LoadingScreen] Location consent approved");
                  setShowConsent(false);
                  requestLocationAndEnter();
                }}
                disabled={isBusy}
              >
                I Approve
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
