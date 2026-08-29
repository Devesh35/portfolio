/**
 * Rewrites every project's `stack` in content/projects.ts to match the skills
 * page exactly — the skill→project mapping in content/skills.ts is the source
 * of truth (Dev, 2026-08-29). Concrete tools first, practice entries last, in
 * skill-group order. Run after changing any skill's `projects` list:
 *
 *   node scripts/sync-stacks.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

register("./alias-hook.mjs", import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { skillGroups, evidenceFor } = await import(pathToFileURL(resolve(ROOT, "content/skills.ts")).href);
const { projects } = await import(pathToFileURL(resolve(ROOT, "content/projects.ts")).href);

const { STACK_SECTIONS, sectionOf } = await import(pathToFileURL(resolve(ROOT, "lib/stack-sections.ts")).href);

/** Everyday tooling stays off project stacks. */
const SKIP = new Set(["Git", "GitHub", "GitLab", "Bitbucket", "JIRA", "Agile / Scrum", "ESLint"]);
const sectionIndex = new Map(STACK_SECTIONS.map((section, i) => [section.id, i]));

const stacks = {};
for (const project of projects) stacks[project.slug] = STACK_SECTIONS.map(() => []);
for (const group of skillGroups) {
  for (const skill of group.items) {
    if (SKIP.has(skill.name)) continue;
    const bucket = sectionIndex.get(sectionOf(skill.name));
    for (const slug of evidenceFor(skill)) {
      if (!stacks[slug]) continue;
      stacks[slug][bucket].push(skill.name);
    }
  }
}

const format = (items) => {
  const lines = [];
  let current = [];
  for (const item of items) {
    current.push(`"${item}"`);
    if (current.join(", ").length > 80) {
      lines.push("      " + current.join(", ") + ",");
      current = [];
    }
  }
  if (current.length) lines.push("      " + current.join(", ") + ",");
  return "stack: [\n" + lines.join("\n") + "\n    ]";
};

const path = resolve(ROOT, "content/projects.ts");
let source = readFileSync(path, "utf8");
for (const [slug, buckets] of Object.entries(stacks)) {
  const pattern = new RegExp(`(slug: "${slug}"[\\s\\S]*?)stack: \\[[\\s\\S]*?\\]`);
  const match = source.match(pattern);
  if (!match) throw new Error(`no stack block for ${slug}`);
  source = source.replace(pattern, `$1${format(buckets.flat())}`);
}
writeFileSync(path, source, "utf8");
console.log(`rewrote ${Object.keys(stacks).length} project stacks from the skills mapping`);
