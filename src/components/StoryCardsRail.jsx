import React from "react";

export default function StoryCardsRail({ children }) {
  const count = React.Children.count(children);
  if (count === 0) return null;

  return (
    <div
      className="
        w-screen
        overflow-x-auto overflow-y-hidden
        pb-[24px]

        [scrollbar-width:none]
        [-ms-overflow-style:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      <div className="flex gap-[14px] px-[36px]">
        {React.Children.map(children, (node, idx) => (
          <div key={idx} className="shrink-0">
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}
