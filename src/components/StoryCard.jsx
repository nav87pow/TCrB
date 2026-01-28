import React from "react";

export default function StoryCard({ text, imageSrc, imageAlt = "" }) {
  return (
    <article className="w-[14.8125rem] h-[21.9375rem] flex flex-col shrink-0">
      {/* Text block */}
      <div
        className="
          flex items-end justify-start
          gap-[0.625rem]
          rounded-t-[0.5rem]
          bg-[#FAFAFA]
        "
      >
        <div
          className="
            flex 
            flex-col 
            gap-[6px] 
            min-w-0 
            px-[0.75rem] pt-[1rem] pb-[2.25rem]
          "
        >
          {text ? <p className="headlines">{text}</p> : null}
        </div>
      </div>

      {/* Image block (pulled up by 16px) */}
      <div className="-mt-[16px]">
        <div
          className="
            w-[14.8125rem] h-[16.25rem]
            rounded-[0.5rem]
            border border-[#FAFAFA]
            overflow-hidden
            bg-[lightgray]
          "
          style={{ borderWidth: "0.4px" }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </article>
  );
}
