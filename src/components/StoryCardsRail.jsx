import React from "react";

const StoryCardsRail = React.forwardRef(function StoryCardsRail({ children }, ref) {
  const railInnerRef = React.useRef(null);

  // מאפשר גם ref חיצוני וגם ref פנימי לאותו אלמנט
  const setRefs = (node) => {
    railInnerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const dragState = React.useRef({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    pointerId: null,
  });

  const [isDragging, setIsDragging] = React.useState(false);

  const onPointerDown = (e) => {
    // Drag רק בעכבר (לא בטאץ’ כדי לא לפגוע ב-swipe טבעי במובייל)
    if (e.pointerType !== "mouse") return;

    const el = railInnerRef.current;
    if (!el) return;

    dragState.current.isDown = true;
    dragState.current.pointerId = e.pointerId;
    dragState.current.startX = e.clientX;
    dragState.current.startScrollLeft = el.scrollLeft;

    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // לא קריטי
    }

    setIsDragging(true);
  };

  const onPointerMove = (e) => {
    const el = railInnerRef.current;
    if (!el) return;
    if (!dragState.current.isDown) return;
    if (dragState.current.pointerId !== e.pointerId) return;

    // מונע בחירת טקסט/drag תמונות בזמן גרירה
    e.preventDefault();

    const dx = e.clientX - dragState.current.startX;
    // גרירה ימינה צריכה להזיז תוכן שמאלה (לכן מינוס)
    el.scrollLeft = dragState.current.startScrollLeft - dx;
  };

  const endDrag = (e) => {
    if (!dragState.current.isDown) return;

    dragState.current.isDown = false;

    const el = railInnerRef.current;
    if (el && dragState.current.pointerId != null) {
      try {
        el.releasePointerCapture(dragState.current.pointerId);
      } catch {
        // לא קריטי
      }
    }

    dragState.current.pointerId = null;
    setIsDragging(false);
  };

  const count = React.Children.count(children);
  if (count === 0) return null;

  return (
    <div
      ref={setRefs}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={(e) => {
        // אם העכבר עזב בזמן לחיצה — נסיים גרירה
        if (dragState.current.isDown && e.pointerType === "mouse") endDrag(e);
      }}
      className={`
        w-screen
        overflow-x-auto overflow-y-hidden
        pb-[5.375rem]

        select-none
        ${isDragging ? "cursor-grabbing" : "cursor-grab"}

        [scrollbar-width:none]
        [-ms-overflow-style:none]
        [&::-webkit-scrollbar]:hidden
      `}
    >
      <div className="flex w-max gap-[14px] ml-[36px] lg:gap-[34px] lg:mt-6"> 
        {React.Children.map(children, (node, idx) => (
          <div key={idx} className={`shrink-0 ${idx === count - 1 ? "mr-[36px]" : ""}`}>
            {node}
          </div>
        ))}
      </div>
    </div>
  );
});

export default StoryCardsRail;
