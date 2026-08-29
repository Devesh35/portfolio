import Link from "next/link";

import {CountUp} from "@/components/count-up";
import {GridBackdrop} from "@/components/grid-backdrop";
import {ProjectCard} from "@/components/project-card";
import {ResumeButton} from "@/components/resume-button";
import {ScrambleText} from "@/components/scramble-text";
import {SimariumSection} from "@/components/simarium-section";
import {TechMarquee} from "@/components/tech-marquee";

import {headlineStats, lifecycle, profile} from "@/content/profile";
import {featuredProjects, projects} from "@/content/projects";
import {yearsSinceCareerStart} from "@/lib/experience";

export default function HomePage() {
  const years = yearsSinceCareerStart();

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative flex min-h-[92svh] items-center overflow-hidden pt-16">
        <GridBackdrop />

        <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
          <p
            className="animate-rise label flex flex-wrap items-center gap-x-3 gap-y-2"
            style={{"--rise-delay": "40ms"} as React.CSSProperties}>
            <span className="inline-flex items-center gap-2 text-ember">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
              </span>
              Available for work
            </span>
            <span aria-hidden="true" className="text-dim">·</span>
            <span>{profile.location} — {profile.currentRole}</span>
          </p>

          <h1
            className="animate-rise font-display mt-6 text-[clamp(3.4rem,13vw,8.5rem)] font-bold"
            style={{"--rise-delay": "120ms"} as React.CSSProperties}>
            Devesh
            <br />
            <span className="text-dim">Singh</span>
          </h1>

          <p
            className="animate-rise mt-6 font-mono text-sm text-ember sm:text-base"
            style={{"--rise-delay": "260ms"} as React.CSSProperties}>
            <ScrambleText text={profile.title} />
          </p>

          <p
            className="animate-rise prose-body mt-8 text-lg sm:text-xl"
            style={{"--rise-delay": "340ms"} as React.CSSProperties}>
            {profile.tagline}
          </p>

          <div
            className="animate-rise mt-10 flex flex-wrap gap-3"
            style={{"--rise-delay": "420ms"} as React.CSSProperties}>
            <Link href="/work" className="btn btn-primary">
              See the work
            </Link>
            <ResumeButton className="btn">View résumé</ResumeButton>
            <a
              href={`mailto:${profile.email}`}
              className="link-wipe self-center font-mono text-sm text-muted hover:text-text">
              {profile.email}
            </a>
          </div>

          {/* Dev's own outcomes. Client platform numbers stay on project pages. */}
          <dl
            className="animate-rise mt-20 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4"
            style={{"--rise-delay": "520ms"} as React.CSSProperties}>
            <div className="bg-ground p-5">
              <dt className="label min-h-[2.4em]">Building since 2021</dt>
              <dd className="mt-2 font-display text-3xl font-semibold">
                <CountUp to={Number(years)} decimals={1} suffix=" yrs" />
              </dd>
              <p className="mt-1 font-mono text-[0.6875rem] text-dim">
                Full-stack and DevOps
              </p>
            </div>

            {headlineStats.map((stat) => (
              <div key={stat.label} className="bg-ground p-5">
                <dt className="label min-h-[2.4em]">{stat.label}</dt>
                <dd className="mt-2 font-display text-3xl font-semibold">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </dd>
                <p className="mt-1 font-mono text-[0.6875rem] text-dim">
                  {stat.sub}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <TechMarquee />

      {/* ------------------------------------------------------------ lifecycle */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div data-reveal className="flex items-baseline gap-4">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Designed, led, built, tested, shipped, operated
          </h2>
        </div>
        <p data-reveal className="prose-body mt-4 max-w-2xl">
          Not six job titles — six things I have personally owned on production
          systems. Every project below is tagged with the parts I was
          responsible for.
        </p>
        <div data-rule className="mt-8 h-px w-full bg-line" />

        <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {lifecycle.map((phase, i) => (
            <div
              key={phase.id}
              data-reveal
              style={{"--reveal-delay": `${i * 80}ms`} as React.CSSProperties}
              className="bg-ground p-7">
              <h3 className="font-display text-2xl font-semibold">
                {phase.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {phase.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- selected work */}
      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <div
            data-reveal
            className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-4">
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                Selected work
              </h2>
            </div>
            <Link
              href="/work"
              className="link-wipe font-mono text-sm text-muted hover:text-text">
              All {projects.length} projects →
            </Link>
          </div>
          <div data-rule className="mt-6 h-px w-full bg-line" />

          <div className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2">
            {featuredProjects.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- simarium */}
      <SimariumSection />

      {/* -------------------------------------------------------------- closing */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div data-reveal>
            <div className="flex items-baseline gap-4">
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                The short version
              </h2>
            </div>
            <p className="prose-body mt-8 text-base sm:text-lg">
              {profile.intro}
            </p>
            <Link
              href="/about"
              className="link-wipe mt-6 inline-block font-mono text-sm text-ember">
              More about how I work →
            </Link>
          </div>

          <div
            data-reveal
            style={{"--reveal-delay": "140ms"} as React.CSSProperties}
            className="panel divide-y divide-line">
            <div className="p-6">
              <p className="label">Education</p>
              <p className="mt-3 font-display text-lg font-semibold">
                {profile.education.degree}
              </p>
              <p className="mt-1 text-sm text-muted">
                {profile.education.school}
              </p>
              <p className="mt-2 font-mono text-[0.6875rem] text-dim">
                {profile.education.university} · {profile.education.period} ·{" "}
                {profile.education.result}
              </p>
            </div>
            <div className="p-6">
              <p className="label">Recognition</p>
              <ul className="mt-3 space-y-2.5">
                {profile.achievements.map((achievement) => (
                  <li
                    key={achievement}
                    className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span className="mt-2.5 h-px w-3 shrink-0 bg-ember-dim" />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
