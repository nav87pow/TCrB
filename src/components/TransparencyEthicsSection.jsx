import React from "react";

function IconLink({ href, label, iconSrc }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex flex-col items-center justify-center gap-2"
      aria-label={label}
    >
      <span
        className="
          inline-flex items-center justify-center
          w-[3.25rem] h-[3.25rem]
          rounded-full
          bg-purple-500
        "
      >
        <img src={iconSrc} alt="" className="w-6 h-6" />
      </span>

      <span className="caption">{label}</span>
    </a>
  );
}

export default function TransparencyEthicsSection() {
  // LINKS (כמו שביקשת)
  const githubUrl = "https://github.com/nav87pow/TCrB";
  const donateUrl = "https://buymeacoffee.com/nav87pow";

  // Figma נשאר “פתוח” אבל בתוך הקומפוננט — כלומר: תחליף/י כאן כשתרצה/י
  const figmaUrl = ""; // ← להדביק URL כשיש

  return (
    <section className="my-[5.375rem]">
      {/* Title */}
      <h2 className="headlineEstimated mb-[2.8rem]">Transparency &amp; ethics</h2>

      {/* Paragraphs block — כל סעיף הוא פסקה (textm) */}
      <div className="space-y-[1.8rem] lg:space-y-[2.4rem]">
        <p className="textm">This site contains no advertisements and has no commercial interests.</p>
        <p className="textm">We do not collect personal data.<br/><span className="texts text-stone-950">If you choose to share your location, it is used only to estimate possible viewing regions nothing more.</span></p>
        <p className="textm">The project exists out of a belief in open source to knowledge and a genuine interest in astronomy.</p>

    
      </div>

      {/* Open files — פסקה בפני עצמה + 2 כפתורים (GitHub / Figma) */}
      <div className="mt-[1.8rem] lg:mt-[2.4rem]">
        <p className="textm mb-[1.24rem]">The site’s code and design are open source.
        </p>

        <div className="flex items-center justify-center gap-16">
          <IconLink href={githubUrl} label="GitHub" iconSrc="/GitHub.svg" />

          {figmaUrl ? (
            <IconLink href={figmaUrl} label="Figma" iconSrc="/Figma.svg" />
          ) : (
            <div className="inline-flex flex-col items-center justify-center gap-2 opacity-50">
              <span
                className="
                  inline-flex items-center justify-center
                  w-[3.25rem] h-[3.25rem]
                  rounded-full
                  bg-purple-500
                "
              >
                <img src="/Figma.svg" alt="" className="w-6 h-6" />
              </span>
              <span className="caption">Figma</span>
            </div>
          )}
        </div>
      </div>

      {/* Donate — פסקה בפני עצמה + כפתור לעמוד תרומות */}
      <div className="mt-[1.8rem]">
        <p className="textm mb-[1.8rem] lg:mt-[2.4rem]">You are more then welcome to support the project via the donation page, but it will always remain accessible to everyone.
        </p>

        <div className="flex justify-center">
          <a
            href={donateUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btnPrimary"
          >
            Donate The Project
          </a>
        </div>
      </div>

      {/* עוד פסקאות אם צריך (textm) */}
      <div className="mt-[48px] space-y-[14px]">
        <p className="textm">{/* TODO */}</p>
        <p className="textm">{/* TODO */}</p>
      </div>
    </section>
  );
}
