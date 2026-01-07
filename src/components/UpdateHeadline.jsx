import React, { useMemo } from "react";

export default function UpdateHeadline({ status, precise, estimated }) {
  const { line1, line2 } = useMemo(() => {
    if (status === "precise") {
      // Line1: target date label (formatting will be refined later)
      const dt = precise?.targetDateTimeUtc || "";
      return {
        line1: dt ? dt : "—",
        line2: "we allmost there",
      };
    }

    // estimated
    const leadText = estimated?.leadText || "לפי הדיווחים זה עשוי לקרות";
    const window = estimated?.window;

    let windowText = "—";
    if (window?.type === "yearRange") {
      windowText = `${window.from}-${window.to}`;
    } else if (window?.type === "monthYear") {
      windowText = window.value;
    } else if (window?.type === "text") {
      windowText = window.value;
    }

    return {
      line1: leadText,
      line2: windowText,
    };
  }, [status, precise, estimated]);

  console.groupCollapsed("[UpdateHeadline] render");
  console.log("status:", status);
  console.log("resolved lines:", { line1, line2 });
  console.groupEnd();

  return (
    <header className="text-left">
      <p   className={
    status === "estimated"
      ? "headlineEstimated mb-4"
      : "h1title mb-2"
  }>{line1}</p>
      <h1 className="h1title">{line2}</h1>
    </header>
  );
}
