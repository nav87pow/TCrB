import React, { useMemo } from "react";
import UpdateHeadline from "./UpdateHeadline";
import Countdown from "./Countdown";
import LocationBlock from "./LocationBlock";

/**
 * HeroUpdate
 * Props:
 * - heroUpdate: object from JSON (will be Groq later)
 * - userContext: { isAnonymous: boolean, hasGeoPermission: boolean, userTimezone?: string }
 */
export default function HeroUpdate({ heroUpdate, userContext }) {
  const status = heroUpdate?.status || "estimated";

  const data = useMemo(() => {
    const precise = heroUpdate?.precise || null;
    const estimated = heroUpdate?.estimated || null;

    return {
      status,
      precise,
      estimated,
    };
  }, [heroUpdate, status]);

  console.groupCollapsed("[HeroUpdate] render");
  console.log("heroUpdate:", heroUpdate);
  console.log("status:", status);
  console.log("userContext:", userContext);
  console.groupEnd();

 return (
  <section className="w-full pt-10">
    {/* 1) כותרת בתוך קונטיינר צר */}
    <div className="mx-auto w-full px-6">
      <UpdateHeadline
        status={data.status}
        precise={data.precise}
        estimated={data.estimated}
      />
    </div>

    {/* 2) Countdown מקצה לקצה */}
    <div className="mt-8">
      <Countdown
        status={data.status}
        precise={data.precise}
        userContext={userContext}
      />
    </div>

    {/* 3) מיקום בתוך קונטיינר צר */}
    <div className="mx-auto w-full px-6">
      <div className="mt-10">
        <LocationBlock
          status={data.status}
          precise={data.precise}
          estimated={data.estimated}
        />
      </div>
    </div>
  </section>
);

}
