"use client";

import { useCallback, useEffect, useState } from "react";

import { ArchitecturePreview } from "@/components/architecture-preview";
import { ArchitectureSceneLazy } from "@/components/architecture-scene-loader";

/**
 * Below the scene breakpoint (see architecture-scene-loader.tsx) the hero
 * shows a still of the illustration — a desktop screenshot, saved as
 * public/architecture-preview.webp — and tapping it opens the live 3D
 * scene in a full-screen modal (round 43, Dev). The three.js chunk is only
 * fetched once the modal opens, so the phone page stays light until then.
 */
export function ArchitectureMobile() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the interactive architecture illustration"
        className="group relative mt-8 block w-full overflow-hidden border border-line bg-ground text-left"
      >
        <ArchitecturePreview sizes="(max-width: 992px) 100vw, 0px" />
        <span className="label pointer-events-none absolute bottom-3 left-3 border border-line bg-ground/85 px-2 py-1 text-ember">
          Tap to explore in 3D
        </span>
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Interactive architecture illustration" className="fixed inset-0 z-[100] flex flex-col bg-ground">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ember">Software architecture, as a building</p>
            <button type="button" onClick={close} className="btn px-3 py-1 font-mono text-sm" aria-label="Close">
              Close
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <ArchitectureSceneLazy hint={false} feather={false} fallback={false} />
          </div>
          <p className="border-t border-line px-4 py-2 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-dim">
            Drag to rotate · Pinch to zoom · Two fingers to pan · Double-tap to reset
          </p>
        </div>
      )}
    </>
  );
}
