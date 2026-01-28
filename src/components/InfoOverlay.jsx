import React, { useEffect } from "react";
import ArticleCard from "./ArticleCard";
import InfoBullet from "./InfoBullet";
import PhenomenonSection from "./PhenomenonSection";
import ArticlesList from "./ArticlesList";
import AboutSection from "./AboutSection.jsx"
import WarningsSection from "./WarningsSection";
import TransparencyEthicsSection from "./TransparencyEthicsSection.jsx";

export default function InfoOverlay({ open, onClose, latestArticle }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const oneArticle = latestArticle ? [latestArticle] : [];

  return (
    <div
      className="
        fixed inset-0 z-50
        w-screen h-screen
        bg-white
        text-left
        overflow-hidden
      "
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <header
        className="
          h-[64px]
          flex items-center justify-between
          px-[36px]
          py-[36px]
          border-b border-purple-950/10
        "
      >
        <div className="brandText">T CrB</div>

        <button
          onClick={onClose}
          className="
            w-10 h-10 rounded-full
            flex items-center justify-center
            border border-purple-950/20
          "
          aria-label="Close"
        >
          ✕
        </button>
      </header>

      {/* Content */}
      <main
        className="
          h-[calc(100vh-64px)]
          overflow-y-auto
          px-[36px]
          py-[36px]
          [scrollbar-width:none]
          [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        <div className="hero">
          <h6 className="articaesource mb-[24px]">T Coronae Borealis (T CrB)</h6>
          <h1 className="font-display font-black uppercase text-[1.5rem] mb-[38px]">
            A rare cosmic event
          </h1>

          <p className="headlinemlight ">
            A rare star system in our galaxy may soon produce a visible nova.
            <br />
            <br />
            This site tracks reliable updates and explains what this event really
            means.
          </p>
          <img
            src="/gold_line.png"
            alt="gold line element"
            className="mt-[68px] mb-[68px] scale-90"
          />
          <h3 className="headlineEstimated mb-[24px]">once in a lifetime event </h3>
          <h2 className="h1title mb-[86px]">every 80 years</h2>
        </div>

        <div className="bullet">
          <InfoBullet
            iconChar="🗱"
            title="A Rare Phenomenon"
            text="T Coronae Borealis erupts only once every several decades, making it an event most people see only once in a lifetime."
          />
          <InfoBullet
            iconChar="🗫"
            title="Why is everyone talking about it now?"
            text="Recent observations suggest the system may be approaching another eruption, bringing renewed attention from astronomers and the public."
          />
        </div>

        <PhenomenonSection />

        <div className="bullet">
          <h3 className="headlineEstimated mt-32 mb-8">it is fascinating </h3>
          <InfoBullet iconChar="👁" title="A rare event visible without advanced equipment" />
          <InfoBullet iconChar="⚛" title="A real-time opportunity to observe stellar physics" />
          <InfoBullet
            iconChar="🗫"
            title="A shared moment for scientists, photographers, and curious observers worldwide"
          />
        </div>

        <h1 className="font-display font-black uppercase text-[1.5rem] mt-32 mb-[38px]">
          Latest verified update
        </h1>

        {/* כרטיס הכתבה (בדיוק אותו רכיב כמו בעמוד העדכון) */}
        <ArticlesList articles={oneArticle} limit={1} />

<AboutSection/>
          <h3 className="headlineEstimated mb-8">information updated </h3>

 <p className="headlinemlight mb-12">
           Updates appear when meaningful new data becomes available
          </p>
<WarningsSection />
<TransparencyEthicsSection/>
        <div className="h-24" />
      </main>
    </div>
  );
}
