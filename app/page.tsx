import Link from "next/link";

import {ArchitectureMobile} from "@/components/architecture-mobile";
import {ArchitectureSceneGate} from "@/components/architecture-scene-loader";
import {CountUp} from "@/components/count-up";
import {GridBackdrop} from "@/components/grid-backdrop";
import {HeroGlow} from "@/components/hero-glow";
import {LifecycleExplorer, type LifecycleProjectLink} from "@/components/lifecycle-explorer";
import {ProjectCard} from "@/components/project-card";
import {ResumeButton} from "@/components/resume-button";
import {ScrambleText} from "@/components/scramble-text";
import {SimariumSection} from "@/components/simarium-section";
import {TechMarquee} from "@/components/tech-marquee";

import {headlineStats, lifecycle, profile} from "@/content/profile";
import {PHASE_ORDER, featuredProjects, projects} from "@/content/projects";
import {simarium} from "@/content/simarium";
import {yearsSinceCareerStart} from "@/lib/experience";

const FOOTPRINT = [
  {
    title: "Design",
    body: "Architecture, database schemas, access models.",
  },
  {
    title: "Delivery",
    body: "CI/CD, Docker, Terraform, environments as code.",
  },
  {
    title: "Production",
    body: "Monitoring, migrations, rollback paths.",
  },
  {
    title: "Leadership",
    body: "Project lead on five- and six-person teams; system design, code review and delivery.",
  },
];

export default function HomePage() {
  const years = yearsSinceCareerStart();

  // Fully resolved server-side from the same ownership matrix the project
  // pages already use — the lifecycle explorer invents nothing new.
  const projectsByPhase: Record<string, LifecycleProjectLink[]> = {};
  for (const phase of PHASE_ORDER) {
    projectsByPhase[phase] = projects
      .filter((project) => project.ownership.includes(phase))
      .map((project) => ({ slug: project.slug, name: project.name, domain: project.domain, origin: project.origin }));
  }

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative flex min-h-[92svh] items-center overflow-hidden pt-16">
        <GridBackdrop />
        <HeroGlow />

        <div className="relative mx-auto w-full max-w-[87.5rem] px-5 py-20 sm:px-8">
          <div className="min-[992px]:grid min-[992px]:grid-cols-[1.05fr_0.95fr] min-[992px]:items-stretch min-[992px]:gap-12">
            <div>
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
                  className="link-wipe w-full self-center pt-1 font-mono text-sm text-muted hover:text-text sm:w-auto sm:pt-0">
                  {profile.email}
                </a>
              </div>

              {/* Below 992px the 3D scene isn't inline — a still of it sits
                  here and opens the live scene in a full-screen modal. */}
              <div className="min-[992px]:hidden">
                <ArchitectureMobile />
              </div>

              {/* Dev's own outcomes. Client platform numbers stay on project pages.
                  CountUp renders the real value in the server HTML — see components/count-up.tsx. */}
              <dl
                className="animate-rise mt-20 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4"
                style={{"--rise-delay": "520ms"} as React.CSSProperties}>
                <div className="reveal-item bg-ground p-5">
                  <dt className="label min-h-[2.4em]">Building since 2021</dt>
                  <dd className="mt-2 font-display text-3xl font-semibold">
                    <CountUp to={Number(years)} decimals={1} suffix=" yrs" />
                  </dd>
                  <p className="mt-1 font-mono text-[0.6875rem] text-dim">
                    Full-stack and DevOps
                  </p>
                </div>

                {headlineStats.map((stat) => (
                  <div key={stat.label} className="reveal-item bg-ground p-5">
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

            {/* Software architecture, drawn as a rotatable 3D line-art
                building cutaway: frontend floors above ground, an elevator
                shaft standing in for the API, a server-room basement for the
                backend, colour-coded utility pipes for third-party
                integrations, and a foundation for infra. Drag to orbit —
                see components/architecture-scene.tsx. */}
            <div
              className="animate-rise hidden min-[992px]:block min-[992px]:h-full"
              style={{"--rise-delay": "460ms"} as React.CSSProperties}>
              <ArchitectureSceneGate />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ lab teaser */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[87.5rem] px-5 py-10 sm:px-8">
          <div
            data-reveal
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="prose-body max-w-2xl text-sm sm:text-base">
              I also build simulations of the systems developers use every
              day — the Git visualizer runs real merge, rebase and
              cherry-pick on a modelled commit graph.
            </p>
            <a
              href={simarium.url}
              target="_blank"
              rel="noreferrer"
              className="link-wipe shrink-0 font-mono text-sm text-ember">
              {simarium.name} ↗
            </a>
          </div>
        </div>
      </section>

      <TechMarquee />

      {/* ------------------------------------------------------------ lifecycle */}
      <section className="mx-auto max-w-[87.5rem] px-5 py-24 sm:px-8 sm:py-32">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label">Delivery lifecycle</p>
            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
              Designed, led, built, tested, shipped, operated
            </h2>
            <p className="prose-body mt-4 max-w-2xl">
              The six parts of delivery I have personally handled on production
              systems. Pick one to see where.
            </p>
          </div>
          <p className="hidden border-l border-line pl-4 font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.12em] text-dim lg:block">
            Same systems.
            <br />
            Different stages.
            <br />
            Real ownership.
          </p>
        </div>

        <div data-reveal className="mt-10">
          <LifecycleExplorer phases={lifecycle} projectsByPhase={projectsByPhase} defaultPhaseId="design" />
        </div>
      </section>

      {/* ---------------------------------------------------------- selected work */}
      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-[87.5rem] px-5 py-24 sm:px-8 sm:py-32">
          <div
            data-reveal
            className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-4">
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                Shipped for real businesses
              </h2>
            </div>
            <Link
              href="/work"
              className="link-wipe font-mono text-sm text-muted hover:text-text">
              All {projects.length} projects →
            </Link>
          </div>
          <p data-reveal className="prose-body mt-3 max-w-2xl text-sm text-muted">
            Client platforms I shipped, with the part of each I owned.
          </p>
          <div data-rule className="rule-accent mt-6 w-full" />

          <div className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2">
            {featuredProjects.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- the lab */}
      <SimariumSection />

      {/* -------------------------------------------------------------- closing */}
      <section className="mx-auto max-w-[87.5rem] px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div data-reveal>
            <div className="flex items-baseline gap-4">
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                What I&apos;ve owned
              </h2>
            </div>
            <dl className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {FOOTPRINT.map((group) => (
                <div key={group.title}>
                  <dt className="label">{group.title}</dt>
                  <dd className="prose-body mt-2 text-sm sm:text-base">{group.body}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/about"
              className="link-wipe mt-8 inline-block font-mono text-sm text-ember">
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
