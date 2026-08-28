"use client";

import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Hover pairing for the career timeline. Branch, leader and card share a
 * `data-tl` key; hovering any of them lights the trio and dims the rest.
 *
 * Event delegation on the wrapper — the graph itself stays a static server
 * render, and this stays the only client code the timeline ships.
 */
export function TimelineFocus({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const setHot = useCallback((key: string | null) => {
    const root = ref.current;
    if (!root) return;
    if (key) root.setAttribute("data-hot", key);
    else root.removeAttribute("data-hot");
    root.querySelectorAll("[data-tl]").forEach((el) => {
      el.classList.toggle("tl-hot", el.getAttribute("data-tl") === key);
    });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onPointerOver={(event) => {
        const hit = (event.target as Element).closest("[data-tl]");
        setHot(hit ? hit.getAttribute("data-tl") : null);
      }}
      onPointerLeave={() => setHot(null)}
    >
      {children}
    </div>
  );
}
