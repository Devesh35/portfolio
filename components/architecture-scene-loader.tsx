"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * `next/dynamic` with `ssr: false` needs a Client Component boundary —
 * app/page.tsx is a Server Component, so this thin wrapper is where that
 * boundary lives. The heavy three.js module only loads in the browser.
 */
// Nothing is shown while the chunk loads (Dev, round 53) — the rendered
// still is only the no-WebGL fallback, handled inside ArchitectureScene.
export const ArchitectureSceneLazy = dynamic(
  () => import("@/components/architecture-scene").then((mod) => mod.ArchitectureScene),
  { ssr: false, loading: () => null },
);

/** The breakpoint above which the hero shows the live scene inline (round 43: 992px, was 1280). */
export const SCENE_MIN_WIDTH = 992;

// The hero column that hosts this is only ever shown at that width and up
// (`min-[992px]:block` in app/page.tsx) — but that's a CSS display toggle,
// not a mount gate, so without this check a phone would still fetch the
// three.js chunk, open a WebGL context and run the render loop for a scene
// it can never see. Gate the mount itself on the same breakpoint. Below it
// the hero shows a still preview that opens the scene in a modal instead —
// see components/architecture-mobile.tsx.
export function ArchitectureSceneGate() {
  // Starts false on both server and client so hydration matches; the real
  // value can only be known client-side (matchMedia needs `window`), so it
  // has to be set from an effect rather than a lazy initializer.
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${SCENE_MIN_WIDTH}px)`);
    // Reading matchMedia's current value has no subscription point of its
    // own before this — the listener below is what keeps it in sync after.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWide(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setWide(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  if (!wide) return null;
  return <ArchitectureSceneLazy />;
}
