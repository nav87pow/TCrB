import React from "react";
import InfoCard from "./InfoCard";
import StackedCardsPreview from "./StackedCardsPreview";
import InfoBullet from "./InfoBullet";

export default function AboutSection() {
  return (
    <section className="w-screen bg-purple-100 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-8 my-32">
      <div className="px-[36px] pt-[36px] pb-[36px] text-left">
        {/* Title + intro */}
        <h2 className="headlineEstimated mb-8">About This Site App</h2>
        <p className="textm max-w-[28rem]">
          This site was created to follow updates and predictions from reliable sources in one place.
        </p>

        {/* Card: stacked preview + text */}
        <div className="mt-12">
          <InfoCard>
            <StackedCardsPreview />
            <p className="textm mt-[18px]">
              We <span className="font-bold">MONITOR</span> official space agencies, observatories,
              and recognized science, while also scanning non-official sites and amateur communities
              to understand the broader conversation.
            </p>
          </InfoCard>
        </div>

        {/* Paragraphs */}
        <div className="mt-12 space-y-[14px]">
          <p className="textm max-w-[32rem]">
            Information is scattered across many platforms, our goal is to bring clarity by
            collecting, comparing, and summarizing everything in one place.
          </p>

          <p className="textm max-w-[32rem]">
            To help with this, we use AI-based <span className="font-bold">ANALYSIS</span> to filter
            sources and summarize forecasts, separating speculation from evidence-based updates.
          </p>
        </div>

        {/* Card: How information is handled */}
        <div className="mt-12">
          <InfoCard
            title="handled Information"
            iconChar="🔒"
          >
            <div className="space-y-[14px]">
              <p className="headlines">
                All updates come from space agencies, observatories, and published scientific or
                observational reports, alongside broader web sources for context.
              </p>

              <p className="headlines">
                Not every article is published automatically — relevance, credibility, and
                consistency matter.
              </p>

              <p className="headlines">
                Sources are classified as <span className="font-bold">TRUSTED</span> or{" "}
                <span className="font-bold">GENERAL</span> based on their origin and reliability.
              </p>
            </div>
          </InfoCard>
        </div>

        {/* Information Updated */}
        <div className="mt-16">
          <h3 className="headlineEstimated mb-[14px]">Information Updated</h3>

          <div className="space-y-[16px]">
            <p className="textm font-light">
                Updates appear when meaningful new data becomes available
            </p>
            <p className="articletext">
                Periods without news are normal and expected
            </p>
            <p className="articletext">
Silence often means no confirmed change             </p>
          </div>
        </div>
      </div>
    </section>
  );
}
