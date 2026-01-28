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
          border-b border-purple-50
        "
      >
        <div className="brandText">T CrB</div>

        <button
          onClick={onClose}
          className="
            w-10 h-10 rounded-full
            flex items-center justify-center
            border border-purple-600
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
          lg:text-center
        "
      >
        <div className="hero">
          <h6 className="articaesource mb-[1.5rem]">T Coronae Borealis </h6>
          <h1 className="font-display font-black uppercase text-[1.5rem] mb-[1.8rem]">
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
            className="my-[5.375rem] w-full
    md:scale-[0.68]
    lg:w-[32rem] lg:my-[3.2rem] lg:mx-auto"
          />
          <h3 className="headlineEstimated mb-[1.24rem]">once in a lifetime event </h3>
          <h2 className="h1title ">every 80 years</h2>
        </div>

        <div className="bullet my-[5.375rem] lg:flex lg:justify-around
 lg:flex-row">
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

        <div className="bullet my-[5.375rem] lg:my-[12rem] ">
          <h3 className="headlineEstimated  mb-8">it is fascinating </h3>
         <div className="lg:flex lg:gap-16">
          <InfoBullet iconChar="👁" title="A rare event visible without advanced equipment" />
          <InfoBullet iconChar="⚛" title="A real-time opportunity to observe stellar physics" />
          <InfoBullet
            iconChar="🗫"
            title="A shared moment for scientists, photographers, and curious observers worldwide"
          />
        </div></div>
       
<div className="updatearticle  my-[5.375rem] "></div>
        <h1 className="font-display font-black uppercase text-[1.5rem] mb-[1.8rem] lg:my-8">
          Latest verified update
        </h1>

        {/* כרטיס הכתבה (בדיוק אותו רכיב כמו בעמוד העדכון) */}
<div className="
  lg:[&_.articles-list]:grid-cols-1
  lg:[&_.articles-list]:place-items-center
  lg:[&_.articles-list]:px-0
  lg:[&_.articles-list_.article-card]:w-[46rem]
">
  <ArticlesList articles={oneArticle} limit={1} />
</div>

<AboutSection/>

<div className="warning my-[5.375rem]">
          <h3 className="headlineEstimated mb-[1.8rem]">information updated </h3>
 <p className="headlinemlight mb-[2.6rem]">
           Updates appear when meaningful new data becomes available
          </p>
<WarningsSection />
</div>
<TransparencyEthicsSection/>
      </main>
    </div>
  );
}
