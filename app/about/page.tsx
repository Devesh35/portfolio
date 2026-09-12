import type { Metadata } from "next";
import Link from "next/link";

import { profile, lifecycle, principles } from "@/content/profile";
import { roles } from "@/content/experience";
import { resume } from "@/content/resume";
import { skillGroups } from "@/content/skills";
import { projects } from "@/content/projects";
import { experienceLabel, yearsSinceCareerStart } from "@/lib/experience";

export const metadata: Metadata = {
  title: "About",
  description: `Full Stack & DevOps Engineer in Pune with ${experienceLabel().toLowerCase()} across FinTech, AdTech, mobility, HealthTech and AIOps platforms.`,
  alternates: { canonical: "/about" },
};

/**
 * About — a workspace, not a résumé (Dev, 2026-09-10): a sticky rail of
 * facts and section anchors on the left, panelled sections on the right, the
 * same hairline-and-mono grammar as the project system views. No ordinal
 * numbers anywhere. Experience is a compact timeline; the per-project detail
 * lives on /work and is linked, not repeated.
 */

const SECTIONS = [
  { id: "work", label: "How I work" },
  { id: "think", label: "How I think" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "toolkit", label: "Toolkit" },
  { id: "beyond", label: "Beyond the job" },
] as const;

const toolCount = skillGroups.reduce((n, g) => n + g.items.length, 0);

export default function AboutPage() {
  const years = yearsSinceCareerStart();
  const style = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

  const facts: [string, React.ReactNode][] = [
    ["Role", profile.currentRole],
    ["Based in", profile.location],
    ["Experience", `${years} years`],
    ["Projects", `${projects.length} built`],
    ["Tools", `${toolCount} in the kit`],
    ["Languages", profile.languages.map((l) => l.name).join(" · ")],
  ];

  return (
    <div className="mx-auto max-w-[87.5rem] px-5 pb-28 pt-36 sm:px-8 sm:pt-44">
      {/* ------------------------------------------------------------- header */}
      <header className="max-w-[60rem]">
        <p className="animate-rise label">{profile.location}</p>
        <h1
          className="animate-rise font-display mt-5 text-[clamp(2.75rem,9vw,6rem)] font-bold"
          style={{ "--rise-delay": "100ms" } as React.CSSProperties}
        >
          About
        </h1>
        {/* About the person, not the projects, tech or numbers (Dev,
            2026-09-10) — those have their own pages and the rail below. */}
        <p
          className="animate-rise prose-body mt-8 text-lg sm:text-xl"
          style={{ "--rise-delay": "180ms" } as React.CSSProperties}
        >
          I&apos;m Devesh, an engineer who likes owning the whole thing. I&apos;m at my best
          when I understand a system end to end — where the data comes from, who touches
          it, what breaks and why — and I would rather sit with a problem until its shape is
          clear than start typing and hope.
        </p>
        <p
          className="animate-rise prose-body mt-5 text-lg"
          style={{ "--rise-delay": "240ms" } as React.CSSProperties}
        >
          I care about work that stays working. Shipping is the middle of the job, not the
          end; the part I&apos;m proud of is what happens after, when something I built is
          quietly doing its job for people who never have to think about it. Outside work I
          build tools for other developers and take photographs — two ways of doing the same
          thing, which is looking closely at how something actually works.
        </p>
      </header>

      <div className="rule-accent mt-16 w-full" />

      {/* ----------------------------------------------------- rail + content */}
      <div className="mt-12 gap-14 lg:grid lg:grid-cols-[15rem_1fr] xl:grid-cols-[17rem_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <dl data-reveal className="divide-y divide-line border-y border-line">
            {facts.map(([term, value]) => (
              <div key={term} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-dim">{term}</dt>
                <dd className="text-right font-mono text-xs text-text">{value}</dd>
              </div>
            ))}
          </dl>

          <nav data-reveal style={style(80)} aria-label="On this page" className="mt-8 hidden lg:block">
            <p className="label">On this page</p>
            <ul className="mt-3 space-y-1.5">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="link-wipe font-mono text-[0.8125rem] text-muted hover:text-text"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div data-reveal style={style(140)} className="mt-8 hidden gap-2 lg:flex lg:flex-col">
            <Link href="/work" className="btn btn-primary justify-center">
              See the work
            </Link>
            <Link href="/contact" className="btn justify-center">
              Get in touch
            </Link>
          </div>
        </aside>

        <div className="mt-14 min-w-0 space-y-24 lg:mt-0">
          {/* ---------------------------------------------------- lifecycle */}
          <section id="work" className="scroll-mt-28">
            <SectionHead title="How I work" note="What I have personally owned, phase by phase" />
            <ol className="mt-8 grid border-l border-t border-line sm:grid-cols-2 xl:grid-cols-3">
              {lifecycle.map((phase, i) => (
                <li
                  key={phase.id}
                  data-reveal
                  style={style(i * 60)}
                  className="reveal-item border-b border-r border-line bg-ground p-6"
                >
                  <h3 className="flex items-center gap-2.5 font-display text-lg font-semibold">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ember" />
                    {phase.title}
                  </h3>
                  <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">{phase.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* --------------------------------------------------- principles */}
          <section id="think" className="scroll-mt-28">
            <SectionHead title="How I think" note="Beliefs about building software, each with a project that shows it" />
            <ul className="mt-8 grid gap-x-10 md:grid-cols-2">
              {principles.map((principle, i) => (
                <li
                  key={principle.title}
                  data-reveal
                  style={style(i * 60)}
                  className="border-t border-line py-6"
                >
                  {/* The dash is a flex sibling, so a wrapped title keeps its
                      left edge under the first line instead of sliding under
                      the dash (round 75, phones). */}
                  <h3 className="flex items-start gap-3 font-display text-lg font-semibold">
                    <span aria-hidden="true" className="mt-[0.8em] h-px w-5 shrink-0 bg-ember" />
                    <span className="min-w-0">{principle.title}</span>
                  </h3>
                  <p className="mt-2.5 pl-8 text-[0.9rem] leading-relaxed text-muted">{principle.body}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* --------------------------------------------------- experience */}
          <section id="experience" className="scroll-mt-28">
            <SectionHead title="Experience" note={resume.company.blurb} />
            <ol className="mt-8">
              {roles.map((role, i) => {
                const roleProjects = role.projects
                  .map((slug) => projects.find((p) => p.slug === slug))
                  .filter((p): p is (typeof projects)[number] => !!p);
                return (
                  <li
                    key={`${role.company}-${role.title}`}
                    data-reveal
                    style={style(i * 100)}
                    className="grid gap-6 border-t border-line py-10 md:grid-cols-[11rem_1fr] md:gap-10"
                  >
                    <div className="md:pt-1">
                      <p className="font-mono text-xs text-ember">{role.period}</p>
                      <p className="mt-1.5 font-mono text-xs text-dim">{role.company}</p>
                      {role.end === null && (
                        <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-dim">
                          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ember" />
                          Current
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-display text-2xl font-semibold">{role.title}</h3>
                      <p className="prose-body mt-3">{role.summary}</p>
                      <ul className="mt-5 space-y-2.5">
                        {role.bullets.slice(0, 3).map((bullet) => (
                          <li key={bullet} className="flex gap-3 text-[0.9rem] leading-relaxed text-muted">
                            <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-line-bright" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      {/* The engagements of this role — cards, not repeated
                          bullets; every detail line lives on the project page. */}
                      {roleProjects.length > 0 && (
                        <ul className="mt-8 grid border-l border-t border-line sm:grid-cols-2">
                          {roleProjects.map((project) => (
                            <li key={project.slug} className="border-b border-r border-line">
                              <Link
                                href={`/work/${project.slug}`}
                                className="group/card reveal-item flex h-full flex-col bg-ground p-5 transition-colors duration-300 hover:bg-surface"
                              >
                                <div className="flex items-baseline justify-between gap-3">
                                  <span className="font-display text-base font-semibold transition-colors duration-300 group-hover/card:text-ember">
                                    {project.name}
                                  </span>
                                  <span className="font-mono text-[0.625rem] text-dim">{project.period}</span>
                                </div>
                                <span className="mt-1 font-mono text-[0.6875rem] text-dim">
                                  {project.domain} · {project.role}
                                </span>
                                <span className="mt-3 line-clamp-2 text-[0.85rem] leading-relaxed text-muted">
                                  {project.contribution}
                                </span>
                                <span className="mt-4 font-mono text-[0.6875rem] text-ember opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                                  Open project →
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="border-t border-line" />
          </section>

          {/* ---------------------------------------------------- education */}
          <section id="education" className="scroll-mt-28">
            <SectionHead title="Education" />
            <div data-reveal className="mt-8 grid gap-px border border-line bg-line md:grid-cols-[1.4fr_1fr]">
              <div className="bg-ground p-7">
                <p className="font-mono text-xs text-ember">{profile.education.period}</p>
                <h3 className="mt-3 font-display text-2xl font-semibold">{profile.education.degree}</h3>
                <p className="mt-1.5 text-muted">{profile.education.school}</p>
                <p className="mt-1 font-mono text-xs text-dim">
                  {profile.education.university} · {profile.education.place}
                </p>
                <p className="label mt-7">Final-year project</p>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{profile.education.project}</p>
              </div>
              <div className="grid grid-rows-[auto_1fr] gap-px bg-line">
                <div className="bg-ground p-7">
                  <p className="label">Result</p>
                  <p className="mt-2 font-display text-2xl font-semibold tabular">{profile.education.result}</p>
                </div>
                <div className="bg-ground p-7">
                  <p className="label">Certification</p>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{profile.certification}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------ toolkit */}
          <section id="toolkit" className="scroll-mt-28">
            <SectionHead
              title="Toolkit"
              note="Grouped the way a system flows, design to production"
              aside={
                <Link href="/systems" className="link-wipe font-mono text-sm text-muted hover:text-text">
                  All {toolCount} tools →
                </Link>
              }
            />
            <div className="mt-8 grid border-l border-t border-line sm:grid-cols-2 xl:grid-cols-3">
              {skillGroups.map((group, i) => (
                <Link
                  key={group.id}
                  href="/systems"
                  data-reveal
                  style={style(i * 50)}
                  className="group/tile reveal-item border-b border-r border-line bg-ground p-6 transition-colors duration-300 hover:bg-surface"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold transition-colors duration-300 group-hover/tile:text-ember">
                      {group.label}
                    </h3>
                    <span className="font-mono text-xs tabular text-dim">{group.items.length}</span>
                  </div>
                  <p className="mt-1 font-mono text-[0.6875rem] text-dim">{group.note}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {group.items.slice(0, 4).map((item) => item.name).join(", ")}
                    {group.items.length > 4 && "…"}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* ------------------------------------------------------- beyond */}
          <section id="beyond" className="scroll-mt-28">
            <SectionHead title="Beyond the job" />
            <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
              <div data-reveal className="bg-ground p-6 md:col-span-2">
                <p className="label">Recognition</p>
                <ul className="mt-4 space-y-3">
                  {profile.achievements.map((achievement) => (
                    <li key={achievement} className="flex gap-3 text-[0.9rem] leading-relaxed text-muted">
                      <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-ember-dim" />
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div data-reveal style={style(80)} className="bg-ground p-6">
                <p className="label">Outside work</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {profile.interests.map((item) => (
                    <li key={item} className="chip px-2 py-1 font-mono text-[0.6875rem]">
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="label mt-6">Strengths</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {profile.competencies.map((item) => (
                    <li key={item} className="chip px-2 py-1 font-mono text-[0.6875rem]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <div data-reveal className="flex flex-wrap gap-3 border-t border-line pt-10 lg:hidden">
            <Link href="/work" className="btn btn-primary">
              See the work
            </Link>
            <Link href="/contact" className="btn">
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHead({ title, note, aside }: { title: string; note?: string; aside?: React.ReactNode }) {
  return (
    <div data-reveal>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
        {aside}
      </div>
      {note && <p className="mt-2 font-mono text-xs text-dim">{note}</p>}
      <div className="rule-accent mt-5 w-full" />
    </div>
  );
}
