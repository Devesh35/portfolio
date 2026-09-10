"use client";

import { useEffect } from "react";

/**
 * Fluent-style "reveal highlight" (the Windows 10 idiom): as the cursor
 * travels, the borders of nearby items light up, and the hovered item gets a
 * soft fill at the cursor point. This component only writes CSS variables
 * (--rx / --ry / --reveal-o) onto `.chip` and `.reveal-item` elements near
 * the cursor — the drawing lives in globals.css, and the light's colour comes
 * from each element's `--reveal` (ember by default, the node accent inside
 * the systems tree).
 *
 * rAF-throttled; the element list is re-queried at most ~once a second, and
 * only elements inside the radius are touched each frame. Touch devices never
 * fire mousemove, so they pay nothing.
 */

const RADIUS = 170;

export function RevealHighlight() {
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    let els: HTMLElement[] = [];
    let cachedAt = 0;
    let lit = new Set<HTMLElement>();
    let frame = 0;

    const onMove = (event: MouseEvent) => {
      const { clientX: x, clientY: y } = event;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const now = performance.now();
        if (now - cachedAt > 1000) {
          els = Array.from(
            document.querySelectorAll<HTMLElement>(".chip, .btn, .reveal-item"),
          );
          cachedAt = now;
        }
        const nextLit = new Set<HTMLElement>();
        for (const el of els) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0) continue;
          // Distance from the cursor to the nearest point of the element.
          const dx = x - Math.max(rect.left, Math.min(x, rect.right));
          const dy = y - Math.max(rect.top, Math.min(y, rect.bottom));
          const dist = Math.hypot(dx, dy);
          if (dist >= RADIUS) continue;
          el.style.setProperty("--rx", `${Math.round(x - rect.left)}px`);
          el.style.setProperty("--ry", `${Math.round(y - rect.top)}px`);
          el.style.setProperty("--reveal-o", (1 - dist / RADIUS).toFixed(3));
          nextLit.add(el);
        }
        for (const el of lit) {
          if (!nextLit.has(el)) el.style.setProperty("--reveal-o", "0");
        }
        lit = nextLit;
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
