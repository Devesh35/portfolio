import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { SystemsTree, type TreeGroup } from "@/components/systems-tree";
import { evidenceFor, skillGroups } from "@/content/skills";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { yearsSinceCareerStart } from "@/lib/experience";

export const metadata: Metadata = {
  title: "Systems",
  description:
    "Every tool Devesh Singh works with, laid out the way a system flows — design to production — and linked to the projects that used it.",
  alternates: { canonical: "/systems" },
};

const normalise = (value: string) => value.trim().toLowerCase();

/**
 * Resolve the tree at build time: each skill's evidence (the projects whose
 * stacks list it, with the project's own how-line when recorded), plus dimmed
 * cross-listed copies (`alsoIn`) so managed services show up where a reader
 * expects them without being double-counted. The client tree receives plain
 * data.
 */
function buildTreeGroups(): TreeGroup[] {
  const labelOf = new Map(skillGroups.map((group) => [group.id, group.label]));

  const groups: TreeGroup[] = skillGroups.map((group) => ({
    id: group.id,
    label: group.label,
    note: group.note,
    skills: group.items.map((skill) => {
      const names = [skill.name, ...(skill.aliases ?? [])].map(normalise);
      return {
        name: skill.name,
        note: skill.note ?? null,
        pending: skill.pending ?? false,
        dimmed: false,
        homeLabel: null,
        subgroup: skill.subgroup ?? null,
        evidence: evidenceFor(skill)
          .map((slug) => projects.find((project) => project.slug === slug))
          .filter((project) => project !== undefined)
          .map((project) => ({
            slug: project.slug,
            name: project.name,
            how:
              project.skillsUsed?.find((used) => names.includes(normalise(used.name)))?.how ??
              null,
          })),
      };
    }),
  }));

  // Cross-listed copies, appended after the target group's own chips.
  const byId = new Map(groups.map((group) => [group.id, group]));
  for (const source of skillGroups) {
    for (const skill of source.items) {
      for (const targetRef of skill.alsoIn ?? []) {
        // "cloud/AWS" targets a subgroup inside the group; "data" the group.
        const [targetId, targetSubgroup] = targetRef.split("/");
        const target = byId.get(targetId);
        const resolved = byId
          .get(source.id)
          ?.skills.find((entry) => entry.name === skill.name);
        if (!target || !resolved) continue;
        target.skills.push({
          ...resolved,
          dimmed: true,
          homeLabel: labelOf.get(source.id) ?? source.label,
          subgroup: targetSubgroup ?? null,
        });
      }
    }
  }

  return groups;
}

export default function SystemsPage() {
  const groups = buildTreeGroups();
  const total = skillGroups.reduce((sum, group) => sum + group.items.length, 0);
  const domains = new Set(projects.map((p) => p.domain.split("·")[0].trim())).size;
  const years = yearsSinceCareerStart();

  const stats = [
    { value: total, label: "Tools" },
    { value: projects.length, label: "Projects" },
    { value: domains, label: "Domains" },
    { value: years, label: "Yrs building" },
  ];

  return (
    <div className="mx-auto max-w-[87.5rem] px-5 pb-28 pt-36 sm:px-8 sm:pt-44">
      <header className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div>
          <p className="animate-rise label inline-flex items-center gap-2 border border-ember/40 px-3 py-1.5 text-ember">
            <span aria-hidden="true">◈</span> Skill tree
          </p>
          <h1
            className="animate-rise font-display mt-6 text-[clamp(2.75rem,8vw,5.5rem)] font-bold leading-[1.02]"
            style={{ "--rise-delay": "100ms" } as React.CSSProperties}
          >
            Systems
            <br />
            <span className="text-muted">
              from idea to <span className="text-ember">production.</span>
            </span>
          </h1>
          <p
            className="animate-rise prose-body mt-6 max-w-xl text-lg"
            style={{ "--rise-delay": "180ms" } as React.CSSProperties}
          >
            The stack, laid out the way a system actually flows — design to
            production. Click any tool to see which projects used it and what
            I did there.
          </p>
        </div>

        {/* How to read the tree. Every mark is explained, nothing is a rating. */}
        <div
          className="animate-rise panel p-5 font-mono text-[0.6875rem] leading-[2.1] text-dim lg:justify-self-end"
          style={{ "--rise-delay": "220ms" } as React.CSSProperties}
        >
          <p><span className="text-muted">dimmed ·</span> — cross-listed, lives elsewhere</p>
          <p><span className="text-muted">chip click</span> — opens its projects</p>
          <p><span className="text-muted">/ or Ctrl K</span> — search</p>
        </div>
      </header>

      <dl
        className="animate-rise mt-12 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4"
        style={{ "--rise-delay": "280ms" } as React.CSSProperties}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="reveal-item bg-ground p-5">
            <dd className="font-display text-3xl font-semibold tabular">{stat.value}</dd>
            <dt className="label mt-1">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-14" data-reveal>
        {/* useSearchParams (the ?skill= deep link) requires a Suspense
            boundary; the fallback never shows in practice. */}
        <Suspense fallback={null}>
          <SystemsTree groups={groups} />
        </Suspense>
      </div>

      {/* ------------------------------------------------------- non-technical */}
      <section className="mt-24 grid gap-12 border-t border-line pt-16 md:grid-cols-2">
        <div data-reveal>
          <h2 className="label">Beyond the stack</h2>
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {profile.competencies.map((item) => (
              <li key={item} className="chip px-2.5 py-1.5 font-mono text-[0.6875rem]">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal style={{ "--reveal-delay": "110ms" } as React.CSSProperties}>
          <h2 className="label">Languages</h2>
          <dl className="mt-5 divide-y divide-line border-y border-line">
            {profile.languages.map((language) => (
              <div key={language.name} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[0.9375rem] text-muted">{language.name}</dt>
                <dd className="font-mono text-xs text-dim">{language.level}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div data-reveal className="mt-20 flex flex-wrap gap-3 border-t border-line pt-12">
        <Link href="/work" className="btn btn-primary">
          See where it was used
        </Link>
        <Link href="/contact" className="btn">
          Get in touch
        </Link>
      </div>
    </div>
  );
}
