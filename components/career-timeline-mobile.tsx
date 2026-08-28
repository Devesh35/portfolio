import Link from "next/link";

import {
  entryMonths,
  entryStart,
  formatSpans,
  isOngoing,
  milestones,
  monthIndex,
  timeline,
  type Track,
} from "@/content/timeline";
import { getProject } from "@/content/projects";

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
                <p className="mt-1 font-mono text-[0.6875rem] text-dim/70">{milestone.detail}</p>
              )}
            </li>
          );
        }

        const { entry } = row;
        const project = entry.slug ? getProject(entry.slug) : undefined;

        const body = (
          <>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-display text-xl font-semibold">{entry.label}</h3>
              <span
                className={`font-mono text-[0.625rem] uppercase tracking-[0.14em] ${TRACK_TEXT[entry.track]}`}
              >
                {TRACK_LABEL[entry.track]}
              </span>
            </div>
            <p className="mt-1.5 font-mono text-xs text-muted tabular">
              {formatSpans(entry.spans)}
              <span className="text-dim"> · {entryMonths(entry)} mo</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {project?.summary ?? "Client engagement at Nirmitee.io."}
            </p>
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
              className={`absolute -left-[30px] top-8 h-2.5 w-2.5 rounded-full ${TRACK_DOT[entry.track]}`}
            />
            {project ? (
              <Link href={`/work/${project.slug}`} className="block">
                {body}
                <span className="mt-2 inline-block font-mono text-[0.6875rem] text-dim">
                  Read the case study →
                </span>
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
