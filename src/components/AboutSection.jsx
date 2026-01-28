import React from "react";
import InfoCard from "./InfoCard";
import StackedCardsPreview from "./StackedCardsPreview";
import InfoBullet from "./InfoBullet";
import SourceCardsPreview from "./SourceCardsPreview";

export default function AboutSection() {
  return (
    <section className="w-screen bg-purple-100 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-8 my-[5.375rem] lg:my-[12rem] ">
      <div className="px-[36px] pt-[36px] pb-[36px] text-left lg:text-center">
        {/* Title + intro */}
        <h2 className="headlineEstimated  mb-[1.24rem]">About This Site App</h2>
        <p className="textm max-w-[28rem] lg:max-w-none">
          This site was created to follow updates and predictions from reliable sources in one place.
        </p>

        {/* Card: stacked preview + text */}
        <div className="mt-12">
          <InfoCard>
            <div className=" mt-6 mb-9 ">
              <SourceCardsPreview /></div>
            
            <p className="textm lg:text-left">
              We <span className="font-bold">MONITOR</span> official space agencies, observatories,
              and recognized science, while also scanning non-official sites and amateur communities
              to understand the broader conversation.
            </p>
          </InfoCard>
        </div>

        {/* Paragraphs */}
        <div className="mt-12 space-y-[1.8rem] lg:text-left lg:w-[68vw]
        lg:mx-auto">
          <p className="textm max-w-[32rem] lg:max-w-none">
            Information is scattered across many platforms, our goal is to bring clarity by
            collecting, comparing, and summarizing everything in one place.
          </p>

          <p className="textm max-w-[32rem] lg:max-w-none">
            To help with this, we use AI-based <span className="font-bold">ANALYSIS</span> to filter
            sources and summarize forecasts, separating speculation from evidence-based updates.
          </p>
        </div>

        {/* Card: How information is handled */}
        <div className="mt-12 lg:text-left">
          <InfoCard
            title="handled Information"
            iconChar="🔒"
          >
            <div className="space-y-[1.24rem]">
              <p className="textm">
                All updates come from space agencies, observatories, and published scientific or
                observational reports, alongside broader web sources for context.
              </p>

              <p className="textm">
                Not every article is published automatically — relevance, credibility, and
                consistency matter.
              </p>

              <p className="textm">
                Sources are classified as <span className="font-bold">TRUSTED</span> or{" "}
                <span className="font-bold">GENERAL</span> based on their origin and reliability.
              </p>
            </div>
          </InfoCard>
        </div>

        {/* Information Updated */}
        <div className="mt-16">
          <h3 className="headlineEstimated mb-[1.8rem]">Information Updated</h3>

          <div className="space-y-[1.24rem]">
            <p className="textm font-light">
                Updates appear when meaningful new data becomes available
            </p>
            <p className="texts text-purple-950">
                Periods without news are normal and expected
            </p>
            <p className="texts text-purple-950">
Silence often means no confirmed change             </p>
          </div>
        </div>
      </div>
    </section>
  );
}
