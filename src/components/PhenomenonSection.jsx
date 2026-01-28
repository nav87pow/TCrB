import React from "react";
import StoryCardsRail from "./StoryCardsRail";
import StoryCard from "./StoryCard";

export default function PhenomenonSection() {
  const sectionRef = React.useRef(null);
  const railRef = React.useRef(null);

  React.useEffect(() => {
    const onWheelCapture = (e) => {
      const sectionEl = sectionRef.current;
      const railEl = railRef.current;

      if (!sectionEl || !railEl) return;

      // אם זה לא wheel "אנכי" (למשל shift+wheel או trackpad אופקי), לא מתערבים
      const dy = e.deltaY || 0;
      const dx = e.deltaX || 0;
      if (Math.abs(dy) <= Math.abs(dx)) return;
      if (dy === 0) return;

      // האם המשתמש "בתוך" אזור הסיפור?
      // מפעילים כשהחלק העליון כבר הגיע לאזור הקריאה,
      // ועדיין לא יצאנו מתחתית הסקשן.
      const rect = sectionEl.getBoundingClientRect();
      const activateTop = 120; // נקודת כניסה נעימה לקריאה
      const activateBottom = 120;

      const isInStoryZone = rect.top <= activateTop && rect.bottom >= activateBottom;
      if (!isInStoryZone) return;

      // בדיקת גבולות גלילה אופקית
      const maxLeft = railEl.scrollWidth - railEl.clientWidth;
      if (maxLeft <= 0) return;

      const currentLeft = railEl.scrollLeft;

      const goingRight = dy > 0;
      const goingLeft = dy < 0;

      const canGoRight = currentLeft < maxLeft - 1;
      const canGoLeft = currentLeft > 1;

      // אם אין יותר אופק לכיוון הגלילה – מאפשרים גלילה אנכית רגילה
      if ((goingRight && !canGoRight) || (goingLeft && !canGoLeft)) return;

      // כאן "נועלים" אנכי וממירים לאופקי
      e.preventDefault();

      // יחס המרה: 1:1 מרגיש טבעי ב-trackpad; אם מרגיש איטי אפשר להעלות ל-1.15
      const factor = 1;
      const next = currentLeft + dy * factor;

      railEl.scrollLeft = Math.max(0, Math.min(maxLeft, next));
    };

    // Capture + passive:false כדי לאפשר preventDefault
    document.addEventListener("wheel", onWheelCapture, { capture: true, passive: false });

    return () => {
      document.removeEventListener("wheel", onWheelCapture, { capture: true });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bgBright py-8 w-screen relative left-1/2 right-1/2 mt-32 -ml-[50vw] -mr-[50vw] lg:py-16 "
    >
      {/* תוכן טקסט – לא נוגע */}
      <div className="px-[36px] py-[5.375rem] pb-[1.8rem] text-left lg:text-center">
        <h2 className="h1title">WHAT IS T CRB?</h2>
        <div className="headlineEstimated mt-[10px]">
          star system that briefly flares into view
        </div>
    <p className="textm mt-[18px] max-w-[34rem] mx-auto leading-[1.65] lg:text-center">
  T Coronae Borealis is a binary star system that occasionally becomes dramatically brighter for a short time.
</p>

      </div>

      {/* Rail + 4 cards */}
      <StoryCardsRail ref={railRef}>
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
