import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";
import { PhaseTags } from "@/components/phase-tags";

const IMAGE_CAPTION: Record<Project["image"]["kind"], string | null> = {
  placeholder: null,
  marketing: "Client's public site",
  own: null,
};

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const caption = IMAGE_CAPTION[project.image.kind];

  return (
    <article
      data-reveal
      style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}
      className="group/card relative"
    >
      <Link href={`/work/${project.slug}`} className="block focus-visible:outline-none">
        <div className="card-media relative aspect-[16/10] overflow-hidden border border-line bg-surface">
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
            className="object-cover object-top"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
          {caption && (
            <span className="absolute bottom-3 left-3 bg-void/80 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-widest text-muted backdrop-blur-sm">
              {caption}
            </span>
          )}
        </div>

        <div className="card-rule h-px w-full bg-ember" aria-hidden="true" />

        <div className="pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl font-semibold transition-colors duration-300 group-hover/card:text-ember">
              {project.name}
            </h3>
            <span className="shrink-0 font-mono text-xs text-dim">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="font-mono text-xs text-dim">{project.domain}</p>
            <PhaseTags phases={project.ownership} />
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 5).map((tech) => (
              <li
                key={tech}
                className="border border-line px-2 py-1 font-mono text-[0.6875rem] text-dim"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </article>
  );
}
