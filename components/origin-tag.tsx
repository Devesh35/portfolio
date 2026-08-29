import {
  ORIGIN_BLURB,
  ORIGIN_LABEL,
  ORIGIN_STATEMENT,
  type Origin,
} from "@/content/projects";

const TONE: Record<Origin, { border: string; chip: string; stroke: string }> = {
  greenfield: { border: "border-l-ember", chip: "border-ember/45 text-ember", stroke: "text-ember" },
  rebuild: { border: "border-l-ember", chip: "border-ember/45 text-ember", stroke: "text-ember" },
  inherited: { border: "border-l-steel", chip: "border-steel/40 text-steel", stroke: "text-steel" },
  support: { border: "border-l-line-bright", chip: "border-line-bright text-dim", stroke: "text-dim" },
};

/**
 * How the engagement started, drawn the same way the /work page draws a
 * career: as a commit graph. Built from zero is a line that begins here; a
 * rebuild is one line ending and a new one taking over; joining an existing
 * product is a branch merging into a line already running; support runs
 * dashed alongside it.
 */
const GLYPH: Record<Origin, React.ReactNode> = {
  greenfield: (
    <>
      <circle cx="16" cy="26" r="3.5" fill="currentColor" />
      <path d="M16 22.5 V6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 10 L16 5 L20 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  rebuild: (
    <>
      <path d="M10 27 V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
      <circle cx="10" cy="13.5" r="3" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.45" />
      <path d="M13 16.5 C 18 20, 22 19, 22 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="22" cy="10.5" r="3.5" fill="currentColor" />
      <path d="M22 7 V5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  inherited: (
    <>
      <path d="M20 27 V5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M8 25 C 8 18, 20 20, 20 13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="8" cy="26" r="3" fill="currentColor" />
      <circle cx="20" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </>
  ),
  support: (
    <>
      <path d="M12 27 V5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M12 24 C 20 22, 20 10, 12 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 5" />
      <circle cx="12" cy="24" r="2.5" fill="currentColor" />
      <circle cx="12" cy="8" r="2.5" fill="currentColor" />
    </>
  ),
};

/** Compact chip for project cards. */
export function OriginTag({ origin, className = "" }: { origin: Origin; className?: string }) {
  return (
    <span
      className={`border px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] ${TONE[origin].chip} ${className}`}
    >
      {ORIGIN_LABEL[origin]}
    </span>
  );
}

/** The project page's starting-point panel: glyph, statement, detail. */
export function OriginPanel({ origin, note }: { origin: Origin; note?: string }) {
  const tone = TONE[origin];
  return (
    <div className={`flex items-start gap-4 border border-line border-l-2 bg-surface/50 p-4 sm:gap-5 sm:p-5 ${tone.border}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        aria-hidden="true"
        className={`mt-0.5 shrink-0 ${tone.stroke}`}
      >
        {GLYPH[origin]}
      </svg>
      <div className="min-w-0">
        <p className="font-display text-base font-semibold sm:text-lg">{ORIGIN_STATEMENT[origin]}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{note ?? ORIGIN_BLURB[origin]}</p>
      </div>
    </div>
  );
}
