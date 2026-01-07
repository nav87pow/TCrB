import React, { useMemo } from "react";
import TagPill from "./TagPill.jsx";

export default function LocationBlock({ status, precise, estimated }) {
 const { scope, cities, citiesSource } = useMemo(() => {
  const src = status === "precise" ? precise : estimated;

  const scopeResolved = src?.visibility?.scope || null;

  const citiesResolved = Array.isArray(src?.cities) ? src.cities.slice(0, 5) : [];

  const citiesSourceResolved = status === "precise" ? "forecastBased" : "forecastBased";

  return {
    scope: scopeResolved,
    cities: citiesResolved,
    citiesSource: citiesSourceResolved,
  };
}, [status, precise, estimated]);


  console.groupCollapsed("[LocationBlock] render");
  console.log("status:", status);
  console.log("cities:", cities);
  console.log("citiesSource:", citiesSource);
  console.groupEnd();

  return (
    <div className="text-left">
   <p className="subtitle">
  {scope === "global" ? (
    <>We all will be able to watch the phenomenon all over the globe  </>
  ) : scope ? (
    <>
     Better to watch in {" "}<span className="scopeWord">{scope.toUpperCase()}</span> side of the globe 
    </>
  ): null
}
</p>


<div className="mt-4 flex flex-wrap gap-2">
  {cities.map((city) => (
    <TagPill key={city}>{city}</TagPill>
  ))}
</div>

    </div>
  );
}
