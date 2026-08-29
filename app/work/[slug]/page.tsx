import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { projects, getProject } from "@/content/projects";
import { PhaseTags } from "@/components/phase-tags";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) return { title: "Not found" };

  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: project.name, description: project.summary, images: [project.image.src] },
  };
}

const KIND_CAPTION: Record<string, string> = {
  marketing: "The client's public site, not the screens I built",
  own: "My own product",
};

export default async function ProjectPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="relative isolate mx-auto max-w-5xl px-5 pb-28 pt-36 sm:px-8 sm:pt-44">
      {/* The project's own line art, ghosted behind the header. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 right-0 -z-10 hidden h-[540px] w-[720px] bg-contain bg-right-top bg-no-repeat opacity-[0.17] lg:block"
        style={{
          backgroundImage: `url(/projects/art/${project.slug}.png)`,
          maskImage: "linear-gradient(to bottom, black 45%, transparent 95%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 45%, transparent 95%)",
        }}
      />
      <Link href="/work" className="link-wipe font-mono text-xs text-muted hover:text-text">
        ← All work
      </Link>

      <header className="mt-8">
        <p className="animate-rise label">{project.domain}</p>
        <h1
          className="animate-rise font-display mt-5 text-[clamp(2.5rem,8vw,5.5rem)] font-bold"
          style={{ "--rise-delay": "90ms" } as React.CSSProperties}
        >
          {project.name}
        </h1>

        <div
          className="animate-rise mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs text-dim"
          style={{ "--rise-delay": "170ms" } as React.CSSProperties}
        >
          <span>{project.role}</span>
          <span>{project.period}</span>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="link-wipe text-ember"
            >
              {project.url.replace(/^https?:\/\//, "")} ↗
            </a>
          )}
        </div>

        <div
          className="animate-rise mt-6 border-t border-line pt-5"
          style={{ "--rise-delay": "210ms" } as React.CSSProperties}
        >
          <p className="label mb-3">What I owned</p>
          <PhaseTags phases={project.ownership} size="md" />
        </div>
      </header>

      {project.image.kind === "placeholder" || project.image.kind === "cover" ? (
        /* No real screenshot yet. Showing the generated card here would just
           repeat the heading above it, so this carries the link instead. */
        <div
          className="animate-rise mt-14 flex flex-wrap items-center justify-between gap-6 border border-line border-l-2 border-l-ember-dim bg-surface px-6 py-5"
          style={{ "--rise-delay": "240ms" } as React.CSSProperties}
        >
          <p className="font-mono text-xs text-dim">
            Screenshots pending
            {project.url ? " — the live site is the best look for now." : " for this project."}
          </p>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="link-wipe font-mono text-xs text-ember"
            >
              Open {project.url.replace(/^https?:\/\//, "")} ↗
            </a>
          )}
        </div>
      ) : (
        <figure
          className="animate-rise mt-14"
          style={{ "--rise-delay": "240ms" } as React.CSSProperties}
        >
          <div className="relative aspect-[16/10] overflow-hidden border border-line bg-surface">
            <Image
              src={project.image.src}
              alt={project.image.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover object-top"
            />
          </div>
          <figcaption className="mt-3 font-mono text-[0.6875rem] text-dim">
            {KIND_CAPTION[project.image.kind]}
          </figcaption>
        </figure>
      )}

      <div className="mt-20 grid gap-16 lg:grid-cols-[1.55fr_1fr] lg:gap-20">
        <div>
          <section data-reveal>
            <h2 className="label">The product</h2>
            <p className="prose-body mt-4 text-lg">{project.summary}</p>
          </section>

          <section data-reveal className="mt-14">
            <h2 className="label">What I built</h2>
            <p className="prose-body mt-4 text-lg text-text/90">{project.contribution}</p>
          </section>

          {project.skillsUsed && project.skillsUsed.length > 0 && (
            <section data-reveal className="mt-14">
              <h2 className="label">The stack, and what each piece did</h2>
              <dl className="mt-6 divide-y divide-line border-y border-line">
                {project.skillsUsed.map((item) => (
                  <div
                    key={item.name}
                    className="group/skill grid gap-1.5 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                  >
                    <dt className="font-mono text-sm text-steel transition-colors duration-300 group-hover/skill:text-ember">
                      {item.name}
                    </dt>
                    <dd className="text-[0.9375rem] leading-relaxed text-muted">{item.how}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {project.highlights.length > 0 && (
            <section data-reveal className="mt-14">
              <h2 className="label">Everything I did here</h2>
              <ul className="mt-6 space-y-5">
                {project.highlights.map((highlight, i) => (
                  <li key={highlight} className="flex gap-5">
                    <span className="shrink-0 pt-1 font-mono text-xs text-ember">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[0.9375rem] leading-relaxed text-muted">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          {project.metrics.length > 0 && (
            <div data-reveal>
              <h2 className="label">Platform scale</h2>
              <p className="mt-2 font-mono text-[0.625rem] leading-relaxed text-dim">
                The product&apos;s numbers, not mine — context for the work below.
              </p>
              <dl className="mt-5 space-y-5">
                {project.metrics.map((metric) => (
                  <div key={metric.label} className="border-l border-ember-dim pl-4">
                    <dd className="font-display text-2xl font-semibold tabular">{metric.value}</dd>
                    <dt className="mt-1 font-mono text-xs text-dim">
                      {metric.label}
                      {metric.source && <span className="text-ember-dim"> · {metric.source}</span>}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div data-reveal>
            <h2 className="label">Stack</h2>
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="border border-line px-2.5 py-1.5 font-mono text-[0.6875rem] text-muted"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary w-full justify-center"
            >
              Visit live site ↗
            </a>
          )}
        </aside>
      </div>

      <nav className="mt-28 border-t border-line pt-10">
        <p className="label">Next project</p>
        <Link href={`/work/${next.slug}`} className="group mt-4 flex items-baseline justify-between gap-6">
          <span className="font-display text-3xl font-semibold transition-colors duration-300 group-hover:text-ember sm:text-4xl">
            {next.name}
          </span>
          <span className="font-mono text-sm text-dim transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </nav>
    </article>
  );
}
