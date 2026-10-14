import { resume as base } from "@/content/resume";

/**
 * "IC" variant of the résumé (Dev, 2026-09-16): the same document without
 * the lead titles, team sizes or portfolio link — for applications where the
 * individual-contributor framing fits better. Everything not overridden here
 * is the public résumé verbatim, so the two can't drift on shared content.
 *
 *   node scripts/build-resume.mjs --variant ic --pdf
 */
export const suffix = "IC";

export function apply(resume: typeof base): typeof base {
  const majorProjects = resume.majorProjects.map((project) => {
    if (project.slug === "estateguru") {
      return {
        ...project,
        bullets: project.bullets.map((b) =>
          b.startsWith("Phase 2:")
            ? "Phase 2: rejoined for the borrower-facing app, working across the frontend, backend and infrastructure."
            : b,
        ),
      };
    }
    if (project.slug === "nextdecade") {
      return {
        ...project,
        heading: project.heading.replace(/— Project Lead$/, "— Full Stack Developer"),
        bullets: project.bullets.map((b) =>
          b.startsWith("Joined as project lead")
            ? "Joined as a full-stack developer — mostly backend and DevOps work, contributing to system design, code review and delivery."
            : b,
        ),
      };
    }
    return project;
  });

  return {
    ...resume,
    header: {
      ...resume.header,
      contact: resume.header.contact.filter((c) => c.label !== "Portfolio"),
    },
    summary: resume.summary.replace(
      /Most recently led the next phase of a European property-lending platform, alongside an AI-assisted observability build\.$/,
      "Most recently worked on the next phase of a European property-lending platform, alongside an AI-assisted observability platform.",
    ),
    majorProjects,
    additionalIntro: resume.additionalIntro.replace(/ — check my portfolio for more details\./, "."),
  };
}
