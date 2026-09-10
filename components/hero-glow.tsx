"use client";

import { useEffect, useRef } from "react";

/**
 * An ember glow that follows the cursor across the hero. Pure enhancement:
 * renders nothing visible until the mouse moves over the section, updates a
 * CSS variable directly (no React state, no re-renders), and never appears
 * on touch devices — there is no mousemove to trigger it.
 */
export function HeroGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    const parent = node?.parentElement;
    if (!node || !parent) return;

    const onMove = (event: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      node.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
      node.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
      node.style.opacity = "1";
    };
    const onLeave = () => {
      node.style.opacity = "0";
    };

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(640px circle at var(--glow-x, 50%) var(--glow-y, 35%), rgb(255 122 69 / 0.13), transparent 70%)",
      }}
    />
  );
}
