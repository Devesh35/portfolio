import type { Metadata } from "next";
import Link from "next/link";

import { profile, lifecycle } from "@/content/profile";
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

export default function AboutPage() {
  const years = yearsSinceCareerStart();

  return (
    <div className="mx-auto max-w-5xl px-5 pb-28 pt-36 sm:px-8 sm:pt-44">
      <header>
        <p className="animate-rise label">{profile.location}</p>
        <h1
          className="animate-rise font-display mt-5 text-[clamp(2.75rem,9vw,6rem)] font-bold"
          style={{ "--rise-delay": "100ms" } as React.CSSProperties}
        >
          About
        </h1>
        <p
          className="animate-rise prose-body mt-8 text-lg sm:text-xl"
          style={{ "--rise-delay": "180ms" } as React.CSSProperties}
        >
          {profile.intro}
        </p>
        <p
          className="animate-rise prose-body mt-5 text-lg"
          style={{ "--rise-delay": "240ms" } as React.CSSProperties}
        >
          {years} years and {projects.length} projects in, the pattern is consistent: I take
          work from requirements and system design through to a deployment I stay
          responsible for. The infrastructure half isn&apos;t a side interest — it&apos;s the
          half that decides whether the other half ever reaches anyone.
        </p>
      </header>

      {/* ------------------------------------------------------------- lifecycle */}
      <section className="mt-24">
        <div data-reveal className="flex items-baseline gap-4">
          <h2 className="font-display text-3xl font-semibold">How I work</h2>
        </div>
        <div data-rule className="mt-6 h-px w-full bg-line" />

        <ol className="mt-10 divide-y divide-line border-y border-line">
          {lifecycle.map((phase, i) => (
            <li
              key={phase.id}
              data-reveal
              style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
              className="grid gap-2 py-6 sm:grid-cols-[10rem_1fr] sm:gap-8"
            >
              <h3 className="font-display text-xl font-semibold">{phase.title}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-muted">{phase.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* -------------------------------------------------------------- timeline */}
      <section className="mt-24">
        <div data-reveal className="flex items-baseline gap-4">
          <h2 className="font-display text-3xl font-semibold">Experience</h2>
        </div>
        <div data-rule className="mt-6 h-px w-full bg-line" />

        <ol className="mt-12 space-y-14">
          {roles.map((role, i) => (
            <li
              key={`${role.company}-${role.title}`}
              data-reveal
              style={{ "--reveal-delay": `${i * 120}ms` } as React.CSSProperties}
              className="relative border-l border-line pl-7 sm:pl-10"
            >
              <span className="absolute -left-[4.5px] top-2 h-2 w-2 rounded-full bg-ember" />

              <p className="font-mono text-xs text-dim">{role.period}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">{role.title}</h3>
              <p className="mt-1 font-mono text-sm text-ember">{role.company}</p>
              <p className="prose-body mt-4">{role.summary}</p>

              <ul className="mt-5 space-y-3">
                {role.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted">
                    <span className="mt-2.5 h-px w-3 shrink-0 bg-line-bright" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* The full engagement detail — same source as the résumé, so
                  every point listed there is listed here too. Roles match by
                  index: both lists are newest-first. */}
              {resume.roles[i] && resume.roles[i].projects.length > 0 && (
                <div className="mt-9 space-y-9 border-t border-line pt-7">
                  {resume.roles[i].projects.map((detail) => (
                    <div key={detail.heading}>
                      <h4 className="font-display text-lg font-semibold text-text/90">
                        {detail.heading}
                      </h4>
                      <ul className="mt-4 space-y-2.5">
                        {detail.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted"
                          >
                            <span className="mt-2.5 h-px w-3 shrink-0 bg-line-bright" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <ul className="mt-7 flex flex-wrap gap-1.5">
                {role.projects.map((slug) => {
                  const project = projects.find((p) => p.slug === slug);
                  if (!project) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/work/${slug}`}
                        className="border border-line px-2 py-1 font-mono text-[0.6875rem] text-dim transition-colors duration-300 hover:border-ember hover:text-ember"
                      >
                        {project.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------- education */}
      <section className="mt-24">
        <div data-reveal className="flex items-baseline gap-4">
          <h2 className="font-display text-3xl font-semibold">Education</h2>
        </div>
        <div data-rule className="mt-6 h-px w-full bg-line" />

        <div data-reveal className="panel mt-10 p-7 sm:p-9">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h3 className="font-display text-2xl font-semibold">{profile.education.degree}</h3>
            <span className="font-mono text-xs text-ember">{profile.education.period}</span>
          </div>
          <p className="mt-2 text-lg text-muted">{profile.education.school}</p>
          <p className="mt-1 font-mono text-sm text-dim">
            {profile.education.university} · {profile.education.place}
          </p>

          <dl className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
            <div className="bg-surface p-5">
              <dt className="label">Result</dt>
              <dd className="mt-2 font-display text-2xl font-semibold tabular">
                {profile.education.result}
              </dd>
            </div>
            <div className="bg-surface p-5">
              <dt className="label">Final-year project</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {profile.education.project}
              </dd>
            </div>
          </dl>

          <div className="mt-8 border-t border-line pt-6">
            <p className="label">Certification</p>
            <p className="mt-3 text-[0.9375rem] text-muted">{profile.certification}</p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- toolkit */}
      <section className="mt-24">
        <div data-reveal className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-4">
              <h2 className="font-display text-3xl font-semibold">Toolkit</h2>
          </div>
          <Link href="/skills" className="link-wipe font-mono text-sm text-muted hover:text-text">
            All {skillGroups.reduce((n, g) => n + g.items.length, 0)} tools →
          </Link>
        </div>
        <div data-rule className="mt-6 h-px w-full bg-line" />

        <div className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, i) => (
            <Link
              key={group.id}
              href="/skills"
              data-reveal
              style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
              className="group/tile bg-ground p-6 transition-colors duration-300 hover:bg-surface"
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

      {/* ---------------------------------------------------- recognition & misc */}
      <section className="mt-24 grid gap-12 md:grid-cols-2">
        <div data-reveal>
          <h2 className="label">Recognition</h2>
          <ul className="mt-5 space-y-3">
            {profile.achievements.map((achievement) => (
              <li key={achievement} className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted">
                <span className="mt-2.5 h-px w-3 shrink-0 bg-ember-dim" />
                <span>{achievement}</span>
              </li>
            ))}
          </ul>

        </div>

        <div data-reveal style={{ "--reveal-delay": "110ms" } as React.CSSProperties}>
          <h2 className="label">Outside the job</h2>
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {profile.interests.map((item) => (
              <li key={item} className="border border-line px-2 py-1 font-mono text-[0.6875rem] text-muted">
                {item}
              </li>
            ))}
          </ul>
          <Link href="/skills" className="link-wipe mt-6 inline-block font-mono text-sm text-ember">
            Languages and the full toolkit →
          </Link>
        </div>
      </section>

      <div data-reveal className="mt-24 flex flex-wrap gap-3 border-t border-line pt-12">
        <Link href="/work" className="btn btn-primary">
          See the work
        </Link>
        <Link href="/contact" className="btn">
          Get in touch
        </Link>
      </div>
    </div>
  );
}
