import { PHASE_LABEL, sortPhases, type Phase } from "@/content/projects";

/**
 * Which parts of the lifecycle Dev owned on a project.
 * Rendered from data, so it can never claim more than content/projects.ts says.
 */
export function PhaseTags({ phases, size = "sm" }: { phases: Phase[]; size?: "sm" | "md" }) {
  const ordered = sortPhases(phases);
  if (ordered.length === 0) return null;

  return (
    <ul
      className={`flex flex-wrap items-center ${size === "md" ? "gap-x-3 gap-y-2" : "gap-x-2 gap-y-1.5"}`}
      aria-label="Lifecycle phases owned"
    >
      {ordered.map((phase, i) => (
        <li key={phase} className="flex items-center gap-2">
          {i > 0 && <span className="h-px w-2 bg-line-bright" aria-hidden="true" />}
          <span
            className={`font-mono uppercase tracking-[0.14em] text-ember-soft ${
              size === "md" ? "text-[0.6875rem]" : "text-[0.625rem]"
            }`}
          >
            {PHASE_LABEL[phase]}
          </span>
        </li>
      ))}
    </ul>
  );
}
