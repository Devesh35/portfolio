/**
 * Builds the GitHub profile README from content/ — the same data the site
 * and the résumé render. A hand-typed README would be a fifth copy of the
 * résumé, and the four hand-typed PDFs already showed how that ends.
 *
 *   node scripts/build-github-readme.mjs      # writes profile-readme/README.md
 *
 * Commit the output as README.md in a public repo named Devesh35 (the
 * username) — GitHub renders that file at the top of the profile page.
 * Rebuild whenever content/ changes, alongside build-resume.mjs.
 *
 * Every link points at the site, not at GitHub: the client repos are private
 * and always will be, so the case-study pages are the only public evidence.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

register("./alias-hook.mjs", import.meta.url);

const { profile, headlineStats } = await import("../content/profile.ts");
const { projects, featuredProjects, PHASE_LABEL, sortPhases } = await import("../content/projects.ts");
const { roles } = await import("../content/experience.ts");
const { skillGroups } = await import("../content/skills.ts");
const { simarium } = await import("../content/simarium.ts");
const { timeline, isOngoing } = await import("../content/timeline.ts");
const { site } = await import("../content/site.ts");
const { experienceLabel } = await import("../lib/experience.ts");

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "profile-readme");

const bare = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const work = (slug) => `${site.url}/work/${slug}`;

/* ------------------------------------------------------------------ now */
// What is running today — client assignment first, then personal, matching
// the ordering rule the /work timeline uses.
const running = timeline
  .filter((e) => e.slug && isOngoing(e))
  .sort((a, b) => (b.track === "nirmitee") - (a.track === "nirmitee"))
  .map((e) => projects.find((p) => p.slug === e.slug))
  .filter(Boolean);

/* ------------------------------------------------------------- sections */
const header = `# ${profile.name}

**${profile.title}** · ${profile.location} · ${profile.currentRole} · ${experienceLabel()} experience

${profile.tagline}

${profile.intro}

[${bare(site.url)}](${site.url}) · [LinkedIn](${profile.links.linkedin}) · [${bare(profile.links.devtools)}](${profile.links.devtools}) · [${profile.email}](mailto:${profile.email})
`;

const stats = `## In numbers

| | |
|---|---|
${headlineStats
  .map((s) => `| **${s.value}${s.suffix}** ${s.label} | ${s.sub} |`)
  .join("\n")}
`;

const now = `## Now

${running
  .map((p) => `- **[${p.name}](${work(p.slug)})** — ${p.role}. ${p.summary}`)
  .join("\n")}
`;

const experience = `## Experience

${roles
  .map(
    (role) => `### ${role.title} — ${role.company}
*${role.period}*

${role.summary}

${role.bullets.map((b) => `- ${b}`).join("\n")}

Projects: ${role.projects
      .map((slug) => projects.find((p) => p.slug === slug))
      .filter(Boolean)
      .map((p) => `[${p.name}](${work(p.slug)})`)
      .join(" · ")}
`,
  )
  .join("\n")}`;

const featured = `## Selected work

Client code is private; each link is the full case study on the site — what the product is, what I built, and everything I did there.

| Project | Domain | Period | What I owned |
|---|---|---|---|
${featuredProjects
  .map(
    (p) =>
      `| [${p.name}](${work(p.slug)}) | ${p.domain} | ${p.period} | ${sortPhases(p.ownership)
        .map((ph) => PHASE_LABEL[ph])
        .join(", ")} |`,
  )
  .join("\n")}

All ${projects.length} projects: ${site.url}/work
`;

const own = `## ${simarium.name} — built for myself

${simarium.body}

${simarium.tools.map((t) => `- **${t.name}** — ${t.status === "live" ? "live" : t.status === "partial" ? "partly live" : "in progress"}. ${t.body}`).join("\n")}

→ [${bare(simarium.url)}](${simarium.url})
`;

const skills = `## Skills

Everything below has been used on a real project — the [skills explorer](${site.url}/skills) shows which one and what it did there.

${skillGroups
  .map((g) => `**${g.label}** — ${g.items.map((s) => s.name).join(", ")}`)
  .join("\n\n")}
`;

const education = `## Education

**${profile.education.degree}**, ${profile.education.school} (${profile.education.university}) — ${profile.education.period} · ${profile.education.result}

${profile.certification}
`;

const footer = `---

<sub>Generated from the same content that builds [${bare(site.url)}](${site.url}) and the résumé — \`npm run readme\` in the portfolio repo. Not hand-edited; edit \`content/\` instead.</sub>
`;

const md = [header, stats, now, experience, featured, own, skills, education, footer].join("\n");

mkdirSync(OUT_DIR, { recursive: true });
const out = resolve(OUT_DIR, "README.md");
writeFileSync(out, md, "utf8");
console.log("wrote", out);
