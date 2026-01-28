import React from "react";
import StoryCardsRail from "./StoryCardsRail";
import StoryCard from "./StoryCard";

export default function PhenomenonSection() {
  return (
    <section className="bgBright py-8 w-screen relative left-1/2 right-1/2 mt-32 -ml-[50vw] -mr-[50vw]">
      {/* תוכן טקסט – לא נוגע */}
      <div className="px-[36px] pt-[36px] pb-[24px] text-left">
        <h2 className="h1title">WHAT IS T CRB?</h2>
        <div className="headlineEstimated mt-[10px]">
          star system that briefly flares into view
        </div>
        <p className="article-card__header mt-[18px] leading-[1.65] max-w-[34rem]">
          T Coronae Borealis is a binary star system that occasionally becomes dramatically brighter for a short time.
        </p>
      </div>

      {/* Rail + 4 cards */}
      <StoryCardsRail>
        <StoryCard
          text="Two very different stars, one compact and dense that burned through its fuel, and the other larger and rich in gas."
          imageSrc="/Phenomenon1.png"
        />
        <StoryCard
          text="The stars locked in a close orbit. One of them is a dense white dwarf, pulling material from its companion star over many years. "
          imageSrc="/Phenomenon2.png"
        />
        <StoryCard
          text="As this material slowly builds up, pressure and heat increase until a sudden nuclear reaction occurs on the white dwarf’s surface."
          imageSrc="/Phenomenon3.png"
        />
        <StoryCard
          text="When that happens, the system rapidly brightens and becomes visible from Earth for a short period this is known as a nova."
          imageSrc="/Phenomenon4.png"
        />
      </StoryCardsRail>
    </section>
  );
}
