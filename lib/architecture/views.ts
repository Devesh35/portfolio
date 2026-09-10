import { architectures } from "@/content/architectures";
import { projects, type Project } from "@/content/projects";

import type { DiagramView } from "./model";
import { defaultApp, infraTemplate, pipelineTemplate, resolve } from "./resolve";

/**
 * The views a project can show — only the ones its stack can fill. A project
 * with no pipeline or cloud tools has no "How it runs"; one whose stack is a
 * single client box still gets "How it fits together" with that one box.
 */
export function buildViews(project: Project): DiagramView[] {
  const stack = project.stack;
  const app = resolve(stack, architectures[project.slug]?.app ?? defaultApp(stack), {
    id: "app",
    title: "The moving parts",
    description: "What talks to what — clients, services, data, and the boundaries between them.",
  });
  const authored = architectures[project.slug];
  const pipeline = resolve(stack, authored?.pipeline ?? pipelineTemplate(), {
    id: "pipeline",
    title: "Push to prod",
    description: "The checks a change has to pass before it ships, and what watches it after.",
  });
  // Not compacted: the infra grid's columns carry meaning (request path on
  // the left, what compute talks to on the right), so a missing service
  // leaves a gap instead of shuffling its neighbours.
  const infra = resolve(stack, authored?.infra ?? infraTemplate(), {
    id: "infra",
    title: "Where it lives",
    description: "The cloud it runs on — ingress, compute, data and messaging — and how that gets provisioned.",
  });
  const views: DiagramView[] = [];
  if (app.nodes.length > 0) views.push(app);
  if (pipeline.nodes.length >= 2) views.push(pipeline);
  if (infra.nodes.length >= 2) views.push(infra);
  return views;
}

export interface ProjectRef {
  slug: string;
  name: string;
}

/** For each tool in the project's stack, the OTHER projects that list it —
 *  the detail panel's "also in". Build-time data, exact stack spellings. */
export function usedElsewhere(project: Project): Record<string, ProjectRef[]> {
  const map: Record<string, ProjectRef[]> = {};
  for (const tool of project.stack) {
    const others = projects
      .filter((other) => other.slug !== project.slug && other.stack.includes(tool))
      .map((other) => ({ slug: other.slug, name: other.name }));
    if (others.length > 0) map[tool] = others;
  }
  return map;
}

/** Authored kinds that resolved to nothing — surfaced by the audit so drift
 *  between a project's stack and its view is visible, never silent. */
export function droppedKinds(project: Project): string[] {
  const authored = architectures[project.slug]?.app;
  if (!authored) return [];
  const view = buildViews(project).find((entry) => entry.id === "app");
  const present = new Set(view?.nodes.map((node) => node.kind) ?? []);
  return authored.nodes.map((node) => node.kind).filter((kind) => !present.has(kind));
}
