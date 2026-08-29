import { ORIGIN_BLURB, ORIGIN_LABEL, type Origin } from "@/content/projects";

const TONE: Record<Origin, string> = {
  greenfield: "border-ember/45 text-ember",
  rebuild: "border-ember/45 text-ember",
  inherited: "border-steel/40 text-steel",
  support: "border-line-bright text-dim",
};

/**
 * How the engagement started. A reader's first question about any portfolio
 * project is how much of it the author is actually answerable for — this
 * answers it on the card, before they read a word of the write-up.
 */
export function OriginTag({
  origin,
  className = "",
  showBlurb = false,
}: {
  origin: Origin;
  className?: string;
  showBlurb?: boolean;
}) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span
        className={`border px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] ${TONE[origin]}`}
      >
        {ORIGIN_LABEL[origin]}
      </span>
      {showBlurb && (
        <span className="font-mono text-[0.6875rem] text-dim">{ORIGIN_BLURB[origin]}</span>
      )}
    </span>
  );
}
