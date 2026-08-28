import Link from "next/link";

import { formatSpans, entryMonths, type Track, type Emphasis } from "@/content/timeline";
import { buildTimelineLayout, SPINE_X, YEAR_COL } from "@/lib/timeline-layout";
import { getProject } from "@/content/projects";
import { TimelineFocus } from "@/components/timeline-focus";

const TRACK_COLOR: Record<Track, string> = {
  personal: "var(--color-ember)",
  nirmitee: "var(--color-steel)",
};

const TRACK_TEXT: Record<Track, string> = {
  personal: "text-ember",
  nirmitee: "text-steel",
};

const TRACK_BORDER: Record<Track, string> = {
  personal: "border-l-ember",
  nirmitee: "border-l-steel",
};

const TRACK_LABEL: Record<Track, string> = {
  personal: "Personal",
  nirmitee: "Nirmitee.io",
};

const STROKE: Record<Emphasis, number> = { main: 2.5, support: 1.5, standard: 1.8 };
const BRANCH_OPACITY: Record<Emphasis, number> = { main: 1, support: 0.65, standard: 0.85 };

const EMPHASIS_LABEL: Partial<Record<Emphasis, string>> = {
  main: "Main assignment",
  support: "Support",
};

export function CareerTimeline() {
  const layout = buildTimelineLayout();
  const { graphWidth, cardX } = layout;

  return (
    <TimelineFocus className="relative" style={{ height: layout.height }}>
      {/* ---------------------------------------------------------- the graph */}
      <svg
        className="pointer-events-none absolute inset-y-0 left-0"
        width={cardX}
        height={layout.height}
        viewBox={`0 0 ${cardX} ${layout.height}`}
        fill="none"
        aria-hidden="true"
      >
        {layout.years.map((tick) => (
          <g key={tick.year}>
            <line
              x1={YEAR_COL + 8}
              y1={tick.y}
              x2={graphWidth}
              y2={tick.y}
              stroke="var(--color-line)"
              strokeWidth={1}
              opacity={0.55}
            />
            <text
              x={YEAR_COL}
              y={tick.y + 4}
              textAnchor="end"
              fill="var(--color-dim)"
              className="font-mono"
              fontSize={11}
              letterSpacing="0.08em"
            >
              {tick.year}
            </text>
          </g>
        ))}

        {/* dotted links from spine moments to milestone labels */}
        {layout.milestones.map(
          ({ milestone, leader }) =>
            leader && (
              <path
                key={`${milestone.at}-leader`}
                d={leader}
                stroke="var(--color-line-bright)"
                strokeWidth={1}
                strokeDasharray="1 5"
                strokeLinecap="round"
                opacity={0.7}
              />
            ),
        )}

        {/* main line — education through to now */}
        <line
          x1={SPINE_X}
          y1={layout.spineTop}
          x2={SPINE_X}
          y2={layout.spineBottom}
          stroke="var(--color-line-bright)"
          strokeWidth={2}
        />
        <circle
          cx={SPINE_X}
          cy={layout.spineTop}
          r={9}
          stroke="var(--color-ember)"
          strokeWidth={1}
          opacity={0.35}
        />
        <circle cx={SPINE_X} cy={layout.spineTop} r={5} fill="var(--color-ember)" />
        <circle
          cx={SPINE_X}
          cy={layout.spineBottom}
          r={4}
          fill="var(--color-ground)"
          stroke="var(--color-line-bright)"
          strokeWidth={2}
        />

        {layout.milestones.map(({ milestone, dotY }) =>
          milestone.kind === "event" ? (
            <circle
              key={milestone.at}
              cx={SPINE_X}
              cy={dotY}
              r={3.5}
              fill="var(--color-ground)"
              stroke="var(--color-line-bright)"
              strokeWidth={2}
            />
          ) : null,
        )}

        {layout.entries.map((item) => {
          const color = TRACK_COLOR[item.entry.track];
          const project = item.entry.slug ? getProject(item.entry.slug) : undefined;
          const emphasis = item.entry.emphasis;

          const branch = (
            <g
              key={item.entry.label}
              data-reveal
              data-tl={item.key}
              style={{ "--reveal-delay": `${item.lane * 90}ms` } as React.CSSProperties}
            >
              {/* leader from branch to card, under everything of this entry */}
              <path
                d={item.leader}
                stroke={color}
                strokeWidth={1}
                opacity={0.4}
              />

              {item.segments.map((segment, i) =>
                segment.dashed ? (
                  <path
                    key={`${item.entry.label}-seg-${i}`}
                    d={segment.d}
                    stroke={color}
                    strokeWidth={1.3}
                    strokeDasharray="2 6"
                    strokeLinecap="round"
                    opacity={0.5}
                  />
                ) : (
                  <path
                    key={`${item.entry.label}-seg-${i}`}
                    className={emphasis === "support" ? undefined : "branch-path"}
                    style={{ "--len": segment.length } as React.CSSProperties}
                    d={segment.d}
                    stroke={color}
                    strokeWidth={STROKE[emphasis]}
                    strokeLinecap="round"
                    strokeDasharray={emphasis === "support" ? "5 4" : undefined}
                    opacity={BRANCH_OPACITY[emphasis]}
                  />
                ),
              )}

              {item.pauses.map((pause) => (
                <text
                  key={`${item.entry.label}-pause-${pause.yTop}`}
                  x={item.laneX - 8}
                  y={(pause.yTop + pause.yBottom) / 2 + 3}
                  textAnchor="end"
                  fill="var(--color-dim)"
                  className="font-mono"
                  fontSize={10}
                  letterSpacing="0.1em"
                >
                  paused
                </text>
              ))}

              {item.junctions.map((junction) => (
                <circle
                  key={`${item.entry.label}-j-${junction.kind}`}
                  cx={SPINE_X}
                  cy={junction.y}
                  r={3}
                  fill={color}
                />
              ))}

              {item.openY !== null && (
                <circle
                  cx={item.laneX}
                  cy={item.openY}
                  r={4.5}
                  fill="var(--color-ground)"
                  stroke={color}
                  strokeWidth={2.5}
                />
              )}

              {/* invisible hit area so the branch itself is hoverable */}
              <path
                d={`M ${item.laneX} ${item.branchTop} L ${item.laneX} ${item.branchBottom}`}
                stroke="transparent"
                strokeWidth={18}
                style={{
                  pointerEvents: "stroke",
                  cursor: project ? "pointer" : "default",
                }}
              />
            </g>
          );

          return project ? (
            <a key={item.entry.label} href={`/work/${project.slug}`}>
              {branch}
            </a>
          ) : (
            branch
          );
        })}
      </svg>

      {/* ----------------------------------------------------------- the cards */}
      <div className="absolute inset-0">
        {layout.milestones.map(({ milestone, labelY }) => (
          <div
            key={milestone.at}
            data-reveal
            className="absolute flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
            style={{ top: labelY, left: cardX, right: 0 }}
          >
            <span
              className={`font-mono text-[0.6875rem] uppercase tracking-[0.16em] ${
                milestone.kind === "now" ? "text-ember" : "text-dim"
              }`}
            >
              {milestone.label}
            </span>
            {milestone.detail && (
              <span className="font-mono text-[0.6875rem] text-dim/70">{milestone.detail}</span>
            )}
          </div>
        ))}

        {layout.entries.map((item) => {
          const { entry } = item;
          const project = entry.slug ? getProject(entry.slug) : undefined;
          const months = entryMonths(entry);

          const body = (
            <>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3
                  className={`font-display text-xl font-semibold ${
                    project ? "transition-colors duration-300 group-hover/row:text-ember" : ""
                  }`}
                >
                  {entry.label}
                </h3>
                <span className={`font-mono text-[0.625rem] uppercase tracking-[0.14em] ${TRACK_TEXT[entry.track]}`}>
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
                <span className="text-dim"> · {months} mo</span>
              </p>

              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                {project?.summary ?? "Client engagement at Nirmitee.io."}
              </p>

              <span className="mt-2 inline-block font-mono text-[0.6875rem] text-dim transition-colors duration-300 group-hover/row:text-ember">
                {project ? "Read the case study →" : (entry.note ?? "No case study yet")}
              </span>
            </>
          );

          const shell = `group/row block border-l-2 pl-5 ${TRACK_BORDER[entry.track]}`;

          return (
            <div
              key={entry.label}
              data-reveal
              data-tl={item.key}
              style={
                {
                  top: item.cardY,
                  left: cardX,
                  "--reveal-delay": `${item.lane * 70}ms`,
                } as React.CSSProperties
              }
              className="absolute right-0"
            >
              {project ? (
                <Link href={`/work/${project.slug}`} className={shell}>
                  {body}
                </Link>
              ) : (
                <div className={shell}>{body}</div>
              )}
            </div>
          );
        })}
      </div>
    </TimelineFocus>
  );
}
