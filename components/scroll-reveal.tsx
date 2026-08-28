"use client";

import { useEffect } from "react";

/**
 * One IntersectionObserver for the whole page.
 *
 * Any element can opt in with `data-reveal` (fade + rise) or `data-rule`
 * (horizontal wipe). Stagger with an inline `--reveal-delay`. Elements added
 * later by navigation are picked up by the MutationObserver.
 *
 * Deliberately not a wrapper component: wrapping every revealed node in an
 * extra <div> would fight the grid layouts these sit inside.
 */
export function ScrollReveal() {
  useEffect(() => {
    const selector = "[data-reveal]:not([data-reveal='in']), [data-rule]:not([data-rule='in'])";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.querySelectorAll<HTMLElement>(selector).forEach(markVisible);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          markVisible(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    const observeAll = () =>
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => observer.observe(el));

    observeAll();

    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}

function markVisible(el: HTMLElement) {
  if (el.hasAttribute("data-rule")) el.setAttribute("data-rule", "in");
  else el.setAttribute("data-reveal", "in");
}
