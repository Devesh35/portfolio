import { projects } from "@/content/projects";
import { skillGroups } from "@/content/skills";

/**
 * The site search index — built on the server, small enough to hand to the
 * client whole. Projects link to their page; skills link to the skills
 * explorer, which reads ?skill= and opens the matching chip.
 */

export interface SearchEntry {
  type: "project" | "skill";
  label: string;
  /** Secondary line shown under the label. */
  sub: string;
  href: string;
  /** Lowercased extra terms the query can match. */
  keywords: string[];
}

export function buildSearchIndex(): SearchEntry[] {
  const projectEntries: SearchEntry[] = projects.map((project) => ({
    type: "project",
    label: project.name,
    sub: project.domain,
    href: `/work/${project.slug}`,
    keywords: [project.slug, project.domain.toLowerCase()],
  }));

  const skillEntries: SearchEntry[] = skillGroups.flatMap((group) =>
    group.items.map((skill) => ({
      type: "skill" as const,
      label: skill.name,
      sub: group.label,
      href: `/skills?skill=${encodeURIComponent(skill.name)}`,
      keywords: (skill.aliases ?? []).map((alias) => alias.toLowerCase()),
    })),
  );

  return [...projectEntries, ...skillEntries];
}
