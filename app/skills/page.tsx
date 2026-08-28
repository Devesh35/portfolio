import type { Metadata } from "next";
import Link from "next/link";

import { skillGroups, evidenceFor } from "@/content/skills";
import { getProject, projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { yearsSinceCareerStart } from "@/lib/experience";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Everything Devesh Singh works with across frontend, backend, data, cloud, infrastructure as code, CI/CD, testing and integrations — each linked to the projects that used it.",
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
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
          Everything below has shipped something. Where a tool was used on a project on
          this site, the project is named next to it — a skills list you can check is worth
          more than one you have to take on faith.
        </p>
        <p
          className="animate-rise prose-body mt-4 text-lg"
          style={{ "--rise-delay": "220ms" } as React.CSSProperties}
        >
          {years} years of it, weighted toward the seam between the application and the
          infrastructure it runs on.
        </p>
      </header>

      <div className="mt-20 space-y-20">
        {skillGroups.map((group, groupIndex) => (
          <section key={group.id}>
            <div data-reveal className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-mono text-xs text-ember">
                {String(groupIndex + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">{group.label}</h2>
              <p className="font-mono text-xs text-dim">{group.note}</p>
            </div>
            <div data-rule className="mt-5 h-px w-full bg-line" />

            <ul className="mt-8 divide-y divide-line border-y border-line">
              {group.items.map((skill, i) => {
                const evidence = evidenceFor(skill);

                return (
                  <li
                    key={skill.name}
                    data-reveal
                    style={{ "--reveal-delay": `${Math.min(i, 6) * 45}ms` } as React.CSSProperties}
                    className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-baseline sm:gap-8"
                  >
                    <span className="font-display text-lg font-medium">{skill.name}</span>

                    {evidence.length > 0 ? (
                      <ul className="flex flex-wrap gap-x-2 gap-y-1.5">
                        {evidence.map((slug) => {
                          const project = getProject(slug);
                          if (!project) return null;
                          return (
                            <li key={slug}>
                              <Link
                                href={`/work/${slug}`}
                                className="border border-line px-2 py-0.5 font-mono text-[0.6875rem] text-dim transition-colors duration-300 hover:border-ember hover:text-ember"
                              >
                                {project.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="font-mono text-[0.6875rem] text-dim">
                        {skill.note ?? "Used across delivery, not tied to one project"}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* ------------------------------------------------------- non-technical */}
      <section className="mt-24 grid gap-12 border-t border-line pt-16 md:grid-cols-2">
        <div data-reveal>
          <h2 className="label">Beyond the stack</h2>
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {profile.competencies.map((item) => (
              <li
                key={item}
                className="border border-line px-2.5 py-1.5 font-mono text-[0.6875rem] text-muted"
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
