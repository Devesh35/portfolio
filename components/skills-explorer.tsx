"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { SkillIcon } from "@/components/skill-icon";

export interface ExplorerEvidence {
  slug: string;
  name: string;
  /** What the tool did on that project, when the project records it. */
  how: string | null;
}

export interface ExplorerSkill {
  name: string;
  note: string | null;
  evidence: ExplorerEvidence[];
}

export interface ExplorerGroup {
  id: string;
  label: string;
  note: string;
  skills: ExplorerSkill[];
}

/**
 * The skills page's working surface. Every tool is a button: selecting it
 * shows which projects used it and what it did there. Search
 * narrows the wall of names to the one a reader came looking for.
 *
 * Plain useState; the data arrives fully resolved from the server component.
 */
export function SkillsExplorer({ groups }: { groups: ExplorerGroup[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Site search deep-links here as /skills?skill=<name> — open that chip.
  useEffect(() => {
    // Deferred a tick: state set after hydration, per react-hooks lint.
    const timer = setTimeout(() => {
      const wanted = new URLSearchParams(window.location.search).get("skill");
      if (!wanted) return;
      const match = groups
        .flatMap((group) => group.skills)
        .find((skill) => skill.name.toLowerCase() === wanted.toLowerCase());
      if (!match) return;
      setActive(match.name);
      requestAnimationFrame(() => {
        rootRef.current
          ?.querySelector('[aria-expanded="true"]')
          ?.scrollIntoView({ block: "center" });
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [groups]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    const flat = q.replace(/[^a-z0-9]/g, "");
    return groups
      .map((group) => ({
        ...group,
        skills: group.skills.filter(
          (skill) =>
            skill.name.toLowerCase().includes(q) ||
            skill.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(flat),
        ),
      }))
      .filter((group) => group.skills.length > 0);
  }, [groups, query]);

  const shown = visible.reduce((n, group) => n + group.skills.length, 0);

  return (
    <div ref={rootRef}>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <label className="flex w-full max-w-sm items-baseline gap-3 border-b border-line-bright pb-2 focus-within:border-ember">
          <span className="font-mono text-xs text-dim" aria-hidden="true">
            /
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter tools…"
            className="w-full bg-transparent font-mono text-sm text-text placeholder:text-dim focus:outline-none"
            aria-label="Filter skills"
          />
        </label>
        <p className="font-mono text-xs text-dim" aria-live="polite">
          {shown} tools{query && " matching"} · click one to see where it was used
        </p>
      </div>

      <div className="mt-12 space-y-16">
        {visible.map((group) => {
          const activeSkill = group.skills.find((skill) => skill.name === active);

          return (
            <section key={group.id}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">{group.label}</h2>
                <p className="font-mono text-xs text-dim">{group.note}</p>
              </div>
              <div className="rule-accent mt-5 w-full" />

              <ul className="mt-6 flex flex-wrap gap-2">
                {group.skills.map((skill) => {
                  const isActive = skill.name === active;
                  return (
                    <li key={skill.name}>
                      <button
                        type="button"
                        onClick={() => setActive(isActive ? null : skill.name)}
                        aria-expanded={isActive}
                        className="chip px-3 py-1.5 font-mono text-[0.8125rem]"
                      >
                        <SkillIcon name={skill.name} />
                        {skill.name}
                        {skill.evidence.length > 0 && (
                          <span className={isActive ? "text-ember/70" : "text-dim"}>
                            {" "}
                            · {skill.evidence.length}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {activeSkill && (
                <div className="animate-rise mt-5 border border-line border-l-2 border-l-ember bg-surface/60 p-5 sm:p-6">
                  {activeSkill.evidence.length > 0 ? (
                    <dl className="space-y-5">
                      {activeSkill.evidence.map((item) => (
                        <div key={item.slug} className="grid gap-1.5 sm:grid-cols-[12rem_1fr] sm:gap-6">
                          <dt>
                            <Link
                              href={`/work/${item.slug}`}
                              className="link-wipe font-display text-base font-semibold transition-colors duration-200 hover:text-ember"
                            >
                              {item.name} →
                            </Link>
                          </dt>
                          <dd className="text-sm leading-relaxed text-muted">
                            {item.how ?? "Used on this project."}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="font-mono text-xs text-dim">
                      {activeSkill.note ?? "Used across projects, not tied to a single one here."}
                    </p>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {shown === 0 && (
          <p className="font-mono text-sm text-dim">
            Nothing matches “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}
