import type { Metadata } from "next";
import Link from "next/link";

import { SkillsExplorer, type ExplorerGroup } from "@/components/skills-explorer";
import { evidenceFor, skillGroups } from "@/content/skills";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { yearsSinceCareerStart } from "@/lib/experience";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Every tool Devesh Singh works with, linked to the projects that used it and what it did there.",
  alternates: { canonical: "/skills" },
};

const normalise = (value: string) => value.trim().toLowerCase();

/**
 * Resolve each skill to its evidence at build time: the projects whose stack
 * lists it, and — when the project records it — what the tool actually did
 * there (Project.skillsUsed). The client explorer receives plain data.
 */
function buildExplorerGroups(): ExplorerGroup[] {
  return skillGroups.map((group) => ({
    id: group.id,
    label: group.label,
    note: group.note,
    skills: group.items.map((skill) => {
      const names = [skill.name, ...(skill.aliases ?? [])].map(normalise);
      return {
        name: skill.name,
        note: skill.note ?? null,
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
}

export default function SkillsPage() {
  const groups = buildExplorerGroups();
  const total = skillGroups.reduce((sum, group) => sum + group.items.length, 0);
  const years = yearsSinceCareerStart();

  return (
    <div className="mx-auto max-w-6xl px-5 pb-28 pt-36 sm:px-8 sm:pt-44">
      <header>
        <p className="animate-rise label">{total} tools · {projects.length} projects</p>
        <h1
          className="animate-rise font-display mt-5 text-[clamp(2.75rem,9vw,6rem)] font-bold"
          style={{ "--rise-delay": "100ms" } as React.CSSProperties}
        >
          Skills
        </h1>
        <p
          className="animate-rise prose-body mt-6 text-lg"
          style={{ "--rise-delay": "180ms" } as React.CSSProperties}
        >
          Everything listed here has been used on a real project. Click a tool to see
          which projects used it and what it did there. {years} years of work, split
          between application code and the infrastructure it runs on.
        </p>
      </header>

      <div className="mt-16" data-reveal>
        <SkillsExplorer groups={groups} />
      </div>

      {/* ------------------------------------------------------- non-technical */}
      <section className="mt-24 grid gap-12 border-t border-line pt-16 md:grid-cols-2">
        <div data-reveal>
          <h2 className="label">Beyond the stack</h2>
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {profile.competencies.map((item) => (
              <li
                key={item}
                className="chip px-2.5 py-1.5 font-mono text-[0.6875rem]"
              >
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
