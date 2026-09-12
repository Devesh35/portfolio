"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SkillIcon } from "@/components/skill-icon";

export interface TreeEvidence {
  slug: string;
  name: string;
  /** What the tool did on that project, when the project records it. */
  how: string | null;
}

export interface TreeSkill {
  name: string;
  note: string | null;
  /** New entry, no project evidence yet — same chip as every other (Dev:
   *  no special borders); the detail panel's note carries the caveat. */
  pending: boolean;
  /** Cross-listed copy — dimmed; its home node is `homeLabel`. */
  dimmed: boolean;
  homeLabel: string | null;
  subgroup: string | null;
  evidence: TreeEvidence[];
}

export interface TreeGroup {
  id: string;
  label: string;
  note: string;
  skills: TreeSkill[];
}

/** Per-node accent colours. The colour lives in the node chrome — icon tile,
 *  border tint, top wash, subgroup labels — never on the chips themselves
 *  (Dev: every chip keeps the same border). */
const ACCENT: Record<string, string> = {
  design: "#ff7a45", // ember — where everything starts
  web: "#7fbcff", // steel
  api: "#a78bfa", // violet
  data: "#4fd1a5", // mint
  test: "#e5c07b", // gold
  integrations: "#a78bfa",
  container: "#7fbcff",
  cicd: "#e5c07b",
  production: "#ff7a45",
  cloud: "#7fbcff",
  workbench: "#8b96a5", // dim — deliberately off the pipeline
  "ai-tools": "#c792ea", // orchid — same off-pipeline family as workbench
};

const tint = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${alpha})`;
};

/** Node icons, drawn to the site's hairline weight (see nav-icon.tsx). */
const NODE_ICON: Record<string, React.ReactNode> = {
  design: (
    <>
      <circle cx="12" cy="9.5" r="3.2" />
      <path d="M12 12.7v7.9M8.2 20.6h7.6" />
    </>
  ),
  web: (
    <>
      <rect x="3" y="4.8" width="18" height="12.4" rx="1.2" />
      <path d="M9.4 20.8h5.2M12 17.2v3.6" />
    </>
  ),
  api: <path d="m9 7.5-5 4.5 5 4.5M15 7.5l5 4.5-5 4.5" />,
  data: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="2.8" />
      <path d="M4.5 6v12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8V6" />
      <path d="M4.5 12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" />
    </>
  ),
  test: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.2 12.3 2.6 2.6 5-5.2" />
    </>
  ),
  integrations: (
    <>
      <path d="M9 3.6v4.2M15 3.6v4.2" />
      <path d="M6.6 7.8h10.8v3.4a5.4 5.4 0 0 1-10.8 0Z" />
      <path d="M12 16.6v3.8" />
    </>
  ),
  container: (
    <>
      <path d="m12 3.4 8 4.2v8.8l-8 4.2-8-4.2V7.6Z" />
      <path d="M4 7.6l8 4.2 8-4.2M12 11.8v8.8" />
    </>
  ),
  cicd: (
    <>
      <path d="M5 8.2a8 8 0 0 1 13.6-1.3M19 15.8a8 8 0 0 1-13.6 1.3" />
      <path d="M18.9 3.4v3.8h-3.8M5.1 20.6v-3.8h3.8" />
    </>
  ),
  cloud: (
    <path d="M7 18.4a4.2 4.2 0 0 1-.6-8.36 6 6 0 0 1 11.5 1.7 3.6 3.6 0 0 1-.6 6.66Z" />
  ),
  production: <path d="M3.5 13.8h3.4l2.3-6.4 3.4 9.6 2.5-5.6 1.3 2.4h4.1" />,
  workbench: (
    <path d="M13.8 5.6a4.4 4.4 0 0 1 5.8-1l-3 3 .8 2.4 2.4.8 3-3a4.4 4.4 0 0 1-6.4 5.2l-6.8 6.8a1.8 1.8 0 0 1-2.6-2.6l6.8-6.8a4.4 4.4 0 0 1 0-4.8Z" transform="scale(0.82) translate(2.2 2.6)" />
  ),
  "ai-tools": (
    <>
      <path d="M12 3.4c.4 3 1.3 4.9 2.3 5.9s2.9 1.9 5.9 2.3c-3 .4-4.9 1.3-5.9 2.3s-1.9 2.9-2.3 5.9c-.4-3-1.3-4.9-2.3-5.9s-2.9-1.9-5.9-2.3c3-.4 4.9-1.3 5.9-2.3s1.9-2.9 2.3-5.9Z" />
      <path d="M19 3.6c.15 1.1.5 1.8.85 2.15S20.7 6.3 21.8 6.45c-1.1.15-1.8.5-2.15.85S19 8.15 18.85 9.25c-.15-1.1-.5-1.8-.85-2.15S17.3 6.6 16.2 6.45c1.1-.15 1.8-.5 2.15-.85S18.85 4.7 19 3.6Z" />
    </>
  ),
};

function NodeGlyph({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {NODE_ICON[id] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

/** Decorative opening-quote mark, drawn to the same hairline weight as the
 *  node icons — used on the pull-quote card under the right rail. */
function QuoteGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 22"
      width="34"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-line-bright"
    >
      <path d="M4.5 13.2c0-4.6 2.7-7.6 6.6-8.6M4.5 13.2c0 2.9 1.9 4.7 4.5 4.7s4.5-1.8 4.5-4.7-1.9-4.6-4.5-4.6" />
      <path d="M18.5 13.2c0-4.6 2.7-7.6 6.6-8.6M18.5 13.2c0 2.9 1.9 4.7 4.5 4.7s4.5-1.8 4.5-4.7-1.9-4.6-4.5-4.6" />
    </svg>
  );
}

/* ------------------------------------------------------------- connectors --
   Percent-coordinate SVGs, the /work commit-graph idiom: steel strokes,
   junction dots. No measuring — non-scaling strokes keep the hairline weight
   at any width. Hidden on mobile, where the nodes simply stack. */

const CONNECTOR = "stroke-ember/55";

/** A dot that survives preserveAspectRatio="none": a zero-length round-capped
 *  stroke never stretches, where a <circle> would smear into an ellipse. */
const Junction = ({ x, y }: { x: number; y: number }) => (
  <path
    d={`M${x} ${y} h0.01`}
    className="stroke-ember"
    strokeWidth="5"
    strokeLinecap="round"
    vectorEffect="non-scaling-stroke"
  />
);

function BranchDown({ xs }: { xs: number[] }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="hidden h-10 w-full sm:block"
    >
      {xs.map((x) => (
        <path
          key={x}
          d={`M50 0 C 50 22, ${x} 16, ${x} 40`}
          className={CONNECTOR}
          fill="none"
          strokeWidth="1.3"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {xs.map((x) => (
        <path
          key={`a${x}`}
          d={`M${x - 0.55} 35.6 L${x} 40 L${x + 0.55} 35.6 Z`}
          className="fill-ember/85 stroke-ember/85"
          strokeWidth="0.8"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <Junction x={50} y={2.5} />
    </svg>
  );
}

function MergeDown({ xs, to = 50 }: { xs: number[]; to?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="hidden h-10 w-full sm:block"
    >
      {xs.map((x) => (
        <path
          key={x}
          d={`M${x} 0 C ${x} 24, ${to} 18, ${to} 40`}
          className={CONNECTOR}
          fill="none"
          strokeWidth="1.3"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <path
        d={`M${to - 0.55} 35.1 L${to} 39.5 L${to + 0.55} 35.1 Z`}
        className="fill-ember/85 stroke-ember/85"
        strokeWidth="0.8"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {xs.map((x) => (
        <Junction key={x} x={x} y={2} />
      ))}
    </svg>
  );
}

function StraightDown() {
  return (
    <div aria-hidden="true" className="flex h-9 flex-col items-center">
      <span className="w-px flex-1 bg-ember/45" />
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="-mt-px">
        <path
          d="M1 0.5 L5 5.5 L9 0.5 Z"
          fill="var(--color-ember)"
          fillOpacity="0.85"
          stroke="var(--color-ember)"
          strokeOpacity="0.85"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------- the tree */

interface SystemsTreeProps {
  groups: TreeGroup[];
}

/**
 * The Systems page's working surface: the stack as one build-to-production
 * tree. Every chip is a button — selecting it shows which projects used the
 * tool and what it did there, in the right rail on wide screens and inline
 * under the node otherwise.
 *
 * Plain useState; data arrives fully resolved from the server component.
 * ?skill= deep links (from site search) select and scroll to the chip.
 */
export function SystemsTree({ groups }: SystemsTreeProps) {
  const [active, setActive] = useState<string | null>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();

  const byId = new Map(groups.map((group) => [group.id, group]));

  /* The active skill's primary (non-dimmed) record, for the detail panel.
     Plain computation — the React Compiler memoizes it. */
  let activeSkill: { group: TreeGroup; skill: TreeSkill } | null = null;
  if (active) {
    for (const group of groups) {
      const hit = group.skills.find(
        (skill) => skill.name === active && !skill.dimmed,
      );
      if (hit) {
        activeSkill = { group, skill: hit };
        break;
      }
    }
  }

  /* Deep link: /systems?skill=Apache%20Kafka opens that chip. Deferred a
     tick so the first client render matches the server HTML. */
  useEffect(() => {
    const wanted = params.get("skill");
    if (!wanted) return;
    const timer = setTimeout(() => {
      setActive(wanted);
      treeRef.current
        ?.querySelector(`[data-skill=${JSON.stringify(wanted)}]`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 0);
    return () => clearTimeout(timer);
  }, [params]);

  const select = (name: string) => setActive((current) => (current === name ? null : name));

  /* ------------------------------------------------------------ rendering */

  const chip = (groupId: string, skill: TreeSkill) => {
    const isActive = skill.name === active;
    return (
      <li key={`${groupId}-${skill.name}`}>
        <button
          type="button"
          data-skill={skill.dimmed ? undefined : skill.name}
          onClick={() => select(skill.name)}
          aria-expanded={isActive}
          title={skill.dimmed ? `Cross-listed — lives under ${skill.homeLabel}` : undefined}
          className={`chip px-2.5 py-1.5 font-mono text-[0.75rem] transition-opacity ${
            skill.dimmed ? "opacity-50" : ""
          }`}
        >
          <SkillIcon name={skill.name} size={13} />
          {skill.name}
          {skill.dimmed && <span className="text-steel"> ·</span>}
        </button>
      </li>
    );
  };

  /** Rows of at most four chips (Dev: 2-4 per line, never more) — except the
   *  Workbench, which flows freely (Dev, 2026-09-10). A row can still wrap on
   *  narrow screens — wrapping only ever puts FEWER on a line. */
  const chipRows = (groupId: string, skills: TreeSkill[], topMargin: string) => {
    // A long name (the Meta Business APIs chip) takes two of a row's four
    // slots, so the chips after it are not pushed onto lines of their own.
    const perRow = groupId === "workbench" ? Infinity : 4;
    const slots = (skill: TreeSkill) => (skill.name.length > 28 ? 2 : 1);
    const rows: TreeSkill[][] = [[]];
    let used = 0;
    for (const skill of skills) {
      const last = rows[rows.length - 1];
      if (last.length > 0 && used + slots(skill) > perRow) {
        rows.push([skill]);
        used = slots(skill);
      } else {
        last.push(skill);
        used += slots(skill);
      }
    }
    return rows.map((row, i) => (
      <ul key={i} className={`${i === 0 ? topMargin : "mt-1.5"} flex flex-wrap gap-1.5`}>
        {row.map((skill) => chip(groupId, skill))}
      </ul>
    ));
  };

  const chipList = (group: TreeGroup, color: string) => {
    const subgroups = [...new Set(group.skills.map((skill) => skill.subgroup))];
    if (subgroups.length === 1 && subgroups[0] === null) {
      return chipRows(group.id, group.skills, "mt-4");
    }
    return subgroups.map((subgroup) => (
      <div key={subgroup ?? "rest"}>
        {subgroup && (
          <p
            className="mt-4 font-mono text-[0.625rem] uppercase tracking-[0.16em]"
            style={{ color: tint(color, 0.8) }}
          >
            {subgroup}
          </p>
        )}
        {chipRows(
          group.id,
          group.skills.filter((skill) => skill.subgroup === subgroup),
          "mt-2",
        )}
      </div>
    ));
  };

  /** Inline detail under a node — shown below xl, where there is no rail. */
  const inlineDetail = (groupId: string) => {
    if (!activeSkill || activeSkill.group.id !== groupId) return null;
    return (
      <div className="mt-5 xl:hidden">
        <SkillDetail group={activeSkill.group} skill={activeSkill.skill} onClose={() => setActive(null)} />
      </div>
    );
  };

  /** Off-pipeline strip: same visual treatment as a node, but laid out as a
   *  wide horizontal band (icon tile + title at the left, chips flowing
   *  freely at the right) rather than the pipeline's vertical card. Used for
   *  Workbench and AI Tools, which sit side by side below the tree with no
   *  connector feeding either. */
  const offPipelineStrip = (id: string) => {
    const group = byId.get(id);
    if (!group) return null;
    const color = ACCENT[id] ?? "#8b96a5";
    return (
      <section
        aria-label={group.label}
        className="rounded-md border border-line bg-surface p-5 sm:p-6"
        style={{
          ["--reveal" as string]: color,
          borderTopWidth: 2,
          borderTopColor: color,
          boxShadow: "0 1px 0 rgb(0 0 0 / 0.35)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex items-center gap-3.5 lg:w-60 lg:shrink-0">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[5px] border border-line bg-ground"
              style={{ color }}
            >
              <NodeGlyph id={id} />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">{group.label}</h2>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-dim">{group.note}</p>
            </div>
          </div>
          <div className="min-w-0 flex-1 lg:-mt-2.5">
            {chipRows(group.id, group.skills, "mt-0 lg:mt-4")}
          </div>
        </div>
        {inlineDetail(id)}
      </section>
    );
  };

  const node = (id: string, options?: { icon?: string; fit?: boolean }) => {
    const group = byId.get(id);
    if (!group) return null;
    const color = ACCENT[group.id] ?? "#7fbcff";
    // Design (the origin) and Production (the destination) glow.
    const lit = group.id === "design" || group.id === "production";
    // Same card as the project system views' nodes (Dev, 2026-09-10): a flat
    // surface, a coloured top rule, glyph tile, title + mono caption.
    return (
      <section
        aria-label={group.label}
        className={`rounded-md border bg-surface p-5 sm:p-6 ${
          options?.fit ? "mx-auto w-fit min-w-[min(100%,24rem)] max-w-full" : ""
        }`}
        style={{
          ["--reveal" as string]: color,
          borderTopWidth: 2,
          borderTopColor: color,
          borderRightColor: lit ? tint(color, 0.45) : "var(--color-line)",
          borderBottomColor: lit ? tint(color, 0.45) : "var(--color-line)",
          borderLeftColor: lit ? tint(color, 0.45) : "var(--color-line)",
          boxShadow: lit ? `0 0 36px -10px ${tint(color, 0.45)}, 0 1px 0 rgb(0 0 0 / 0.35)` : "0 1px 0 rgb(0 0 0 / 0.35)",
        }}
      >
        <div className="flex items-center gap-3.5">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[5px] border border-line bg-ground"
            style={{ color }}
          >
            <NodeGlyph id={options?.icon ?? group.id} />
          </span>
          <div>
            <h2
              className="font-display text-lg font-semibold"
              style={group.id === "production" ? { color } : undefined}
            >
              {group.label}
            </h2>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-dim">{group.note}</p>
          </div>
        </div>
        {chipList(group, color)}
        {inlineDetail(group.id)}
      </section>
    );
  };

  return (
    <div ref={treeRef}>
      {/* --------------------------------------------------- tree + rail */}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0">
          {node("design", { fit: true })}

          <BranchDown xs={[17, 50, 83]} />

          <div className="mt-3 grid gap-5 sm:mt-0 sm:grid-cols-3">
            {node("web")}
            {node("api")}
            {node("data")}
          </div>

          <MergeDown xs={[17, 50, 83]} />

          <div className="mt-3 grid gap-5 sm:mt-0 sm:grid-cols-[1fr_1.4fr] sm:items-start">
            {node("test")}
            {node("integrations")}
          </div>

          <StraightDown />
          {node("container", { fit: true })}
          <StraightDown />
          {node("cicd", { fit: true })}
          <StraightDown />

          {node("cloud", { fit: true })}

          <StraightDown />
          {node("production", { fit: true })}
        </div>

        {/* Right rail — wide screens only; below xl the detail is inline.
            Sticky so it tracks the reader down the (much taller) tree column. */}
        <aside className="hidden xl:sticky xl:top-28 xl:block xl:self-start">
          <div>
            {activeSkill ? (
              <SkillDetail
                group={activeSkill.group}
                skill={activeSkill.skill}
                onClose={() => setActive(null)}
              />
            ) : (
              <div className="panel p-6">
                <p className="label">Selected tool</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Click any tool in the tree to see which projects used it and
                  what it did there.
                </p>
              </div>
            )}
          </div>

          <div className="panel mt-6 p-6">
            <QuoteGlyph />
            <p className="mt-4 font-display text-[1.0625rem] font-medium leading-snug text-text">
              A good stack doesn’t just build features. It enables team velocity and long-term maintainability.
            </p>
            <p className="mt-4 text-right font-mono text-[0.6875rem] text-dim">— Devesh Singh</p>
          </div>
        </aside>
      </div>

      {/* Workbench and AI Tools — everyday tooling, deliberately OFF the
          pipeline: side by side, no connector feeding either. Stacks to one
          column below lg. */}
      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        {offPipelineStrip("workbench")}
        {offPipelineStrip("ai-tools")}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ detail card */

function SkillDetail({
  group,
  skill,
  onClose,
}: {
  group: TreeGroup;
  skill: TreeSkill;
  onClose: () => void;
}) {
  return (
    <div className="animate-rise border border-line border-l-2 border-l-ember bg-surface/60 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2.5 font-display text-lg font-semibold">
            <SkillIcon name={skill.name} size={16} />
            {skill.name}
          </p>
          <p className="mt-1 font-mono text-[0.6875rem] text-dim">
            {group.label}
            {skill.evidence.length > 0 && <> · used in {skill.evidence.length} project{skill.evidence.length === 1 ? "" : "s"}</>}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="font-mono text-xs text-dim hover:text-text"
        >
          ✕
        </button>
      </div>

      {skill.evidence.length > 0 ? (
        <dl className="mt-5 space-y-4">
          {skill.evidence.map((item) => (
            <div key={item.slug}>
              <dt>
                <Link
                  href={`/work/${item.slug}`}
                  className="link-wipe font-display text-[0.9375rem] font-semibold transition-colors duration-200 hover:text-ember"
                >
                  {item.name} →
                </Link>
              </dt>
              {item.how && (
                <dd className="mt-1 text-sm leading-relaxed text-muted">{item.how}</dd>
              )}
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-5 font-mono text-xs leading-relaxed text-dim">
          {skill.note ?? "Used across projects, not tied to a single one here."}
        </p>
      )}
    </div>
  );
}
