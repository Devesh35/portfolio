import Link from "next/link";

import {
  entryMonths,
  entryStart,
  formatSpans,
  isOngoing,
  milestones,
  monthIndex,
  timeline,
  type Emphasis,
  type Track,
} from "@/content/timeline";
import { getProject, ORIGIN_LABEL } from "@/content/projects";
import { SkillIcon } from "@/components/skill-icon";

const TRACK_DOT: Record<Track, string> = {
  personal: "bg-ember",
  nirmitee: "bg-steel",
};

const TRACK_TEXT: Record<Track, string> = {
  personal: "text-ember",
  nirmitee: "text-steel",
};

const TRACK_LABEL: Record<Track, string> = {
  personal: "Personal",
  nirmitee: "Nirmitee.io",
};

/* Round 71: same weight cues as the desktop cards — the dot grows for a
   main assignment and hollows for support, the title dims with it. */
const EMPHASIS_LABEL: Partial<Record<Emphasis, string>> = { main: "Main assignment", support: "Support" };
const TITLE: Record<Emphasis, string> = { main: "text-text", standard: "text-text/90", support: "text-muted" };
const DOT: Record<Emphasis, string> = { main: "h-3 w-3", standard: "h-2.5 w-2.5", support: "h-2.5 w-2.5 !bg-transparent border" };
const DOT_BORDER: Record<Track, string> = { personal: "border-ember", nirmitee: "border-steel" };
const STACK_CHIPS = 3;

type Row =
  | { kind: "entry"; sort: number; entry: (typeof timeline)[number] }
  | { kind: "milestone"; sort: number; milestone: (typeof milestones)[number] };

/**
 * Narrow-screen timeline. The lane graph needs horizontal room it doesn't have
 * on a phone, so this is one spine with everything stacked in date order —
 * same data, same colours, no branches.
 */
function rowRank(row: Row): number {
  if (row.kind === "milestone") {
    if (row.milestone.kind === "now") return -3_000_000;
    return -row.sort + 0.5; // a milestone sharing a month sits below the entry
  }
  if (isOngoing(row.entry)) return -2_000_000 + (row.entry.track === "nirmitee" ? 0 : 1);
  return -row.sort;
}

export function CareerTimelineMobile() {
  const rows: Row[] = [
    ...timeline.map((entry) => ({ kind: "entry" as const, sort: entryStart(entry), entry })),
    ...milestones.map((milestone) => ({
      kind: "milestone" as const,
      sort: monthIndex(milestone.at),
      milestone,
    })),
    // Same rule as the desktop graph: "Present" first, then ongoing work
    // (client assignment ahead of personal), then everything else — finished
    // projects and milestones interleaved by date, newest first.
  ].sort((a, b) => rowRank(a) - rowRank(b));

  return (
    <ol className="relative ml-1 border-l border-line-bright pl-6">
      {rows.map((row, i) => {
        if (row.kind === "milestone") {
          const { milestone } = row;
          return (
            <li
              key={`m-${milestone.at}`}
              data-reveal
              style={{ "--reveal-delay": `${(i % 4) * 60}ms` } as React.CSSProperties}
              className="relative py-5"
            >
              <span className="absolute -left-[27px] top-7 h-1.5 w-1.5 rounded-full bg-line-bright" />
              <p
                className={`font-mono text-[0.6875rem] uppercase tracking-[0.16em] ${
                  milestone.kind === "now" ? "text-ember" : "text-dim"
                }`}
              >
                {milestone.label}
              </p>
              {milestone.detail && (
                <p className={`mt-1 font-mono text-[0.6875rem] ${milestone.kind === "now" ? "text-muted" : "text-dim/70"}`}>
                  {milestone.detail}
                </p>
              )}
            </li>
          );
        }

        const { entry } = row;
        const project = entry.slug ? getProject(entry.slug) : undefined;
        // first recorded metric, else how the work started — real data only
        const metric = project?.metrics[0];
        const outcome = metric ? `${metric.value} ${metric.label}` : project ? ORIGIN_LABEL[project.origin] : null;

        const body = (
          <>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className={`font-display text-xl font-semibold ${TITLE[entry.emphasis]}`}>{entry.label}</h3>
              <span
                className={`font-mono text-[0.625rem] uppercase tracking-[0.14em] ${TRACK_TEXT[entry.track]}`}
              >
                {TRACK_LABEL[entry.track]}
              </span>
              {entry.track !== "personal" && EMPHASIS_LABEL[entry.emphasis] && (
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-dim">
                  {EMPHASIS_LABEL[entry.emphasis]}
                </span>
              )}
            </div>
            <p className="mt-1.5 font-mono text-xs text-muted tabular">
              {formatSpans(entry.spans)}
              <span className="text-dim"> · {entryMonths(entry)} mo</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {project?.summary ?? "Client engagement at Nirmitee.io."}
            </p>
            {outcome && (
              <p className={`mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] ${metric ? "text-ember/90" : "text-dim"}`}>
                {outcome}
              </p>
            )}
            {project && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="font-mono text-[0.6875rem] text-muted">{project.role}</span>
                <ul className="flex flex-wrap gap-1.5">
                  {project.stack.slice(0, STACK_CHIPS).map((tech) => (
                    <li key={tech} className="flex items-center gap-1.5 border border-line px-1.5 py-0.5 font-mono text-[0.625rem] text-dim">
                      <SkillIcon name={tech} size={11} />
                      {tech}
                    </li>
                  ))}
                  {project.stack.length > STACK_CHIPS && (
                    <li className="px-1 py-0.5 font-mono text-[0.625rem] text-dim/70">+{project.stack.length - STACK_CHIPS}</li>
                  )}
                </ul>
              </div>
            )}
          </>
        );

        return (
          <li
            key={entry.label}
            data-reveal
            style={{ "--reveal-delay": `${(i % 4) * 60}ms` } as React.CSSProperties}
            className="relative py-6"
          >
            <span
              className={`absolute -left-[30px] top-8 rounded-full ${DOT[entry.emphasis]} ${TRACK_DOT[entry.track]} ${
                entry.emphasis === "support" ? DOT_BORDER[entry.track] : ""
              }`}
            />
            {project ? (
              <Link href={`/work/${project.slug}`} className="block">
                {body}
                <span className="mt-3 inline-block font-mono text-[0.6875rem] text-dim">Case study →</span>
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ol>
  );
}
