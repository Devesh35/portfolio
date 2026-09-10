"use client";

import Link from "next/link";
import { useState } from "react";

import { OriginTag } from "@/components/origin-tag";
import { SkillIcon } from "@/components/skill-icon";
import type { Origin } from "@/content/projects";

export interface LifecyclePhaseData {
  id: string;
  title: string;
  /** One-line role of the phase ("Plan & architect"). */
  tag: string;
  /** The claim the phase makes, as a sentence. */
  headline: string;
  body: string;
  /** Stack behind the phase — exact skill spellings, drawn as marks. */
  tools: readonly string[];
}

export interface LifecycleProjectLink {
  slug: string;
  name: string;
  domain: string;
  origin: Origin;
}

interface LifecycleExplorerProps {
  phases: readonly LifecyclePhaseData[];
  /** Phase id -> projects that carry that phase in `ownership`. Fully resolved
   *  server-side from the same ownership matrix the project pages use —
   *  nothing invented here. */
  projectsByPhase: Record<string, LifecycleProjectLink[]>;
  /** Phase id selected on first render, so the section never looks empty. */
  defaultPhaseId?: string;
}

/**
 * The delivery lifecycle as a workspace (Dev's reference, 2026-09-10): a
 * strip of six stage cells, then two panels — the stage's claim, body, key
 * technologies and a computed footer on the left; the projects that carried
 * the stage on the right. No ordinal numbers. useState only; data arrives
 * fully resolved from the server.
 */
export function LifecycleExplorer({ phases, projectsByPhase, defaultPhaseId = "design" }: LifecycleExplorerProps) {
  const fallbackId = phases[0]?.id ?? "";
  const [activeId, setActiveId] = useState(
    phases.some((phase) => phase.id === defaultPhaseId) ? defaultPhaseId : fallbackId,
  );

  const active = phases.find((phase) => phase.id === activeId) ?? phases[0];
  const activeProjects = active ? (projectsByPhase[active.id] ?? []) : [];
  const domains = new Set(activeProjects.map((project) => project.domain.split("·")[0].trim()));
  const fromZero = activeProjects.filter((project) => project.origin === "greenfield" || project.origin === "rebuild").length;

  return (
    <div>
      {/* ------------------------------------------------------------ strip */}
      <div role="tablist" aria-label="Parts of delivery" className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        {phases.map((phase) => {
          const isActive = phase.id === active?.id;
          return (
            <button
              key={phase.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(phase.id)}
              className={`reveal-item group/tab relative flex items-center gap-3.5 px-4 py-4 text-left transition-colors duration-300 ${
                isActive ? "bg-surface" : "bg-ground hover:bg-surface/60"
              }`}
              style={isActive ? { boxShadow: "inset 0 0 0 1px var(--color-ember), 0 0 24px -8px rgb(255 122 69 / 0.45)" } : undefined}
            >
              <span className={`shrink-0 transition-colors duration-300 ${isActive ? "text-ember" : "text-dim group-hover/tab:text-muted"}`}>
                <PhaseGlyph id={phase.id} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block font-display text-sm font-semibold ${isActive ? "text-ember" : "text-text"}`}>{phase.title}</span>
                <span className="mt-0.5 block truncate font-mono text-[0.6875rem] text-dim">{phase.tag}</span>
              </span>
              <span aria-hidden="true" className={`shrink-0 font-mono text-xs transition-colors ${isActive ? "text-ember" : "text-line-bright"}`}>
                ›
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* ------------------------------------------------------ detail */}
          <div className="panel flex flex-col p-6 sm:p-8">
            <p className="label flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-ember" />
              {active.title}
            </p>
            <h3 className="font-display mt-4 text-2xl font-semibold sm:text-[1.75rem]">{active.headline}</h3>
            <p className="prose-body mt-4 text-[0.95rem] sm:text-base">{active.body}</p>

            <div className="mt-7 border border-line p-4 sm:p-5">
              <p className="label">Key technologies</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {active.tools.map((tool) => (
                  <li key={tool} className="chip px-3 py-2 font-mono text-xs">
                    <SkillIcon name={tool} size={14} />
                    {tool}
                  </li>
                ))}
              </ul>
            </div>

            {/* Counted from the projects on the right — nothing typed by hand. */}
            <dl className="mt-auto grid grid-cols-3 gap-px border border-line bg-line pt-0 [&>div]:bg-ground">
              <Stat value={activeProjects.length} label="Projects" />
              <Stat value={fromZero} label="Built or rebuilt from zero" />
              <Stat value={domains.size} label={domains.size === 1 ? "Domain" : "Domains"} />
            </dl>
          </div>

          {/* ----------------------------------------------------- projects */}
          <div className="panel p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <p className="label flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-4 bg-ember" />
                Where I did this
              </p>
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-dim">
                {activeProjects.length} {activeProjects.length === 1 ? "project" : "projects"}
              </span>
            </div>
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {activeProjects.length > 0 ? (
                activeProjects.map((project) => (
                  <li key={project.slug}>
                    <Link
                      href={`/work/${project.slug}`}
                      className="group/row reveal-item flex items-center gap-4 py-3 pr-1 transition-colors hover:text-ember"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center border border-line bg-ground text-dim transition-colors group-hover/row:border-ember/50 group-hover/row:text-ember">
                        <DomainGlyph domain={project.domain} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-text transition-colors group-hover/row:text-ember">{project.name}</span>
                        <span className="block truncate font-mono text-[0.6875rem] text-dim">{project.domain}</span>
                      </span>
                      <OriginTag origin={project.origin} />
                      <span aria-hidden="true" className="font-mono text-xs text-line-bright transition-colors group-hover/row:text-ember">
                        ›
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="py-3 text-sm text-dim">No tagged projects yet.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="p-4">
      <dd className="font-display text-2xl font-semibold tabular">{value}</dd>
      <dt className="mt-1 font-mono text-[0.6875rem] leading-snug text-dim">{label}</dt>
    </div>
  );
}

/** One hairline glyph per stage, 24px grid. */
function PhaseGlyph({ id }: { id: string }) {
  const paths: Record<string, React.ReactNode> = {
    design: (
      <>
        <path d="M9.5 18.5h5M10.5 21h3" />
        <path d="M12 3a6.5 6.5 0 0 0-3.9 11.7c.7.6 1.1 1.3 1.2 2.1h5.4c.1-.8.5-1.5 1.2-2.1A6.5 6.5 0 0 0 12 3Z" />
      </>
    ),
    lead: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
        <circle cx="16.5" cy="9" r="2.4" />
        <path d="M15.5 14.6c2.7 0 5 1.8 5 4.6" />
      </>
    ),
    build: (
      <>
        <path d="M12 3l8 4.6v8.8L12 21l-8-4.6V7.6z" />
        <path d="M4 7.6l8 4.6 8-4.6M12 12.2V21" />
      </>
    ),
    test: (
      <>
        <path d="M12 3l7.5 3v6c0 4.4-3.1 7.6-7.5 9-4.4-1.4-7.5-4.6-7.5-9V6z" />
        <path d="M8.8 12.2l2.2 2.2 4.4-4.4" />
      </>
    ),
    ship: (
      <>
        <path d="M14 4c3 1 5.5 3.5 6 7l-4.5 4.5-6-6L14 4Z" />
        <path d="M9.5 9.5L5 11l2 2M14.5 14.5L13 19l-2-2M6.5 17.5l-3 3" />
      </>
    ),
    operate: (
      <>
        <path d="M4 20V11M9.5 20V6M15 20v-9M20.5 20V3.5" />
      </>
    ),
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[id]}
    </svg>
  );
}

/** A glyph by domain keyword, so the project rows read at a glance. */
function DomainGlyph({ domain }: { domain: string }) {
  const d = domain.toLowerCase();
  let path: React.ReactNode;
  if (d.includes("real estate")) path = <path d="M3.5 11L12 4l8.5 7M6 9.5V20h12V9.5M10 20v-6h4v6" />;
  else if (d.includes("aiops") || d.includes("observab")) path = <path d="M3.5 17l4.5-6 3.5 4 4-7 5 9" />;
  else if (d.includes("adtech") || d.includes("commerce")) path = <path d="M3.5 5h2.5l2 10h10l2-7H7M9.5 19.5h.01M16.5 19.5h.01" />;
  else if (d.includes("mobility")) path = <path d="M5 16l1.5-6h11L19 16M4 16h16v3H4zM7.5 19.5v1.5M16.5 19.5v1.5M8 13h.01M16 13h.01" />;
  else if (d.includes("sports")) path = <><circle cx="12" cy="12" r="8" /><path d="M12 4c3 3 3 13 0 16M4.5 9.5h15M4.5 14.5h15" /></>;
  else if (d.includes("health")) path = <path d="M12 20s-7.5-4.5-7.5-10A4 4 0 0 1 12 8a4 4 0 0 1 7.5 2c0 5.5-7.5 10-7.5 10Z" />;
  else if (d.includes("fintech")) path = <path d="M4 20V11M9.5 20V6M15 20v-9M20.5 20V3.5" />;
  else if (d.includes("hospitality")) path = <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 1-3 4-3 7h3v11M16 3v7" />;
  else if (d.includes("developer")) path = <path d="M14.5 5.5a4 4 0 0 1 5-1l-2.8 2.8.7 2.3 2.3.7 2.8-2.8a4 4 0 0 1-5.4 4.9l-6.6 6.6a1.8 1.8 0 0 1-2.5-2.5l6.6-6.6a4 4 0 0 1-.1-4.4Z" />;
  else path = <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M10 10v10" /></>;
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}
