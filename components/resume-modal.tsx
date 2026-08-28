"use client";

import {profile} from "@/content/profile";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Résumé viewer.
 *
 * The frame shows /resume.html rather than the PDF: an embedded PDF renders
 * blank in iOS Safari and several mobile browsers, and both files are generated
 * from the same data, so the HTML is the same document without the failure mode.
 * The download button hands over the PDF.
 *
 * Built on <dialog> so focus trapping, Escape and inertness come from the
 * platform rather than from hand-rolled key handlers.
 */

const ResumeContext = createContext<{open: () => void} | null>(null);

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context)
    throw new Error("useResume must be used inside <ResumeProvider>");
  return context;
}

/** Width the résumé is laid out at. Narrower screens scale it down rather than
 *  letting a print document reflow into a phone column. */
const PAGE_WIDTH = 794;   // 595pt at 96dpi — the résumé page, exactly

export function ResumeProvider({children}: {children: React.ReactNode}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(1);

  // The frame is only mounted once the dialog has been opened, so the résumé
  // never costs anything on first paint.
  const [mounted, setMounted] = useState(false);

  const open = useCallback(() => {
    setMounted(true);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Fit the fixed-width page to whatever room the dialog has.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / PAGE_WIDTH));
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [mounted]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Clicking the backdrop closes; clicking the panel does not.
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) close();
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, [close]);

  return (
    <ResumeContext.Provider value={{open}}>
      {children}

      <dialog ref={dialogRef} className="resume-dialog" aria-label="Résumé">
        {/* Focus opens on Close, not Download: showModal() focuses the first
            focusable child, and a permanently filled Download button reads as
            stuck rather than focused. */}
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-line bg-surface px-4 py-3">
            <a
              href={profile.resume.href}
              download={profile.resume.downloadAs}
              className="btn btn-primary !py-2 !px-3.5 !text-xs w-[124px] text-center">
              Download PDF
            </a>
            <p className="hidden font-mono text-[0.6875rem] text-dim sm:block">
              Updated {profile.resume.updated}
            </p>
            <div className="w-[124px] flex justify-end">
              <button
                type="button"
                autoFocus
                onClick={close}
                aria-label="Close résumé"
                className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-muted transition-colors duration-300 hover:border-ember hover:text-ember">
                <span aria-hidden="true" className="text-lg leading-none">
                  ×
                </span>
              </button>
            </div>{" "}
          </div>

          <div
            ref={frameRef}
            className="min-h-0 flex-1 overflow-hidden bg-[#eceff2]">
            {mounted && (
              <>
                {!loaded && (
                  <p className="p-6 font-mono text-xs text-dim">
                    Loading résumé…
                  </p>
                )}
                <iframe
                  src="/resume.html"
                  title="Résumé"
                  onLoad={() => setLoaded(true)}
                  style={
                    scale < 1
                      ? {
                          // Too narrow for the page: render at full width and
                          // scale down, rather than letting print CSS reflow.
                          width: PAGE_WIDTH,
                          height: `${100 / scale}%`,
                          transform: `scale(${scale})`,
                          transformOrigin: "top left",
                        }
                      : {width: "100%", height: "100%"}
                  }
                  className={`border-0 ${loaded ? "block" : "hidden"}`}
                />
              </>
            )}
          </div>
        </div>
      </dialog>
    </ResumeContext.Provider>
  );
}
