/**
 * Consistency audit across content/, public/ and the derived copy.
 *
 * Everything on this site and in the résumé comes from content/*.ts, but a
 * shared source only prevents drift where a value is actually derived. This
 * catches the places where a number is still written by hand.
 *
 *   node scripts/audit-content.mjs
 *
 * Exits non-zero on any FAIL, so it can gate a build.
 */

import { existsSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

register("./alias-hook.mjs", import.meta.url);

const { projects } = await import("../content/projects.ts");
const { timeline, periodFor, formatSpans, monthIndex, entryStart, entryEnd, TIMELINE_END } =
  await import("../content/timeline.ts");
const { roles } = await import("../content/experience.ts");
const { profile, headlineStats } = await import("../content/profile.ts");
const { skillGroups, marqueeSkills } = await import("../content/skills.ts");
const { simarium } = await import("../content/simarium.ts");
const { resume } = await import("../content/resume.ts");
const { lifecycle } = await import("../content/profile.ts");

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const failures = [];
const warnings = [];
const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);
const ok = (msg) => console.log(`  ok    ${msg}`);

const section = (name) => console.log(`\n${name}`);

/* ------------------------------------------------ timeline <-> projects ---- */
section("Timeline and projects");

const projectSlugs = new Set(projects.map((p) => p.slug));
const timelineSlugs = new Set(timeline.filter((e) => e.slug).map((e) => e.slug));

for (const slug of timelineSlugs) {
  if (!projectSlugs.has(slug)) fail(`timeline entry "${slug}" has no project in projects.ts`);
}
for (const slug of projectSlugs) {
  if (!timelineSlugs.has(slug)) fail(`project "${slug}" has no timeline entry — its dates come from nowhere`);
}
if (projects.length !== new Set(projects.map((p) => p.slug)).size) fail("duplicate project slug");
if (failures.length === 0) ok(`${projects.length} projects, ${timeline.length} timeline entries, all paired`);

/* ------------------------------------------------------------- periods ---- */
section("Dates derived, not typed");

for (const project of projects) {
  const expected = periodFor(project.slug);
  if (project.period !== expected) {
    fail(`${project.slug}: period "${project.period}" != timeline "${expected}"`);
  }
}

for (const entry of timeline) {
  const ongoing = entry.spans.some((s) => s.end === null);
  const text = formatSpans(entry.spans);
  if (ongoing && !text.includes("Present")) fail(`${entry.label}: ongoing but period omits "Present"`);
  if (!ongoing && text.includes("Present")) fail(`${entry.label}: closed but period claims "Present"`);
  for (const span of entry.spans) {
    if (span.end && monthIndex(span.end) < monthIndex(span.start)) {
      fail(`${entry.label}: span ends before it starts (${span.start} → ${span.end})`);
    }
    if (monthIndex(span.start) > monthIndex(TIMELINE_END)) {
      fail(`${entry.label}: starts after the timeline end`);
    }
  }
}
ok("every project period matches its timeline entry");

/* ---------------------------------------------------------- experience ---- */
section("Experience roles");

const monthOf = (label) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [m, y] = label.split(" ");
  return Number(y) * 12 + months.indexOf(m);
};

for (const role of roles) {
  const roleStart = monthOf(role.period.split(" – ")[0]);
  const roleEnd = role.end ? monthOf(role.period.split(" – ")[1]) : monthIndex(TIMELINE_END);

  for (const slug of role.projects) {
    const project = projects.find((p) => p.slug === slug);
    if (!project) { fail(`role "${role.title}" lists unknown project "${slug}"`); continue; }
    const entry = timeline.find((e) => e.slug === slug);
    if (!entry) continue;
    if (entryEnd(entry) < roleStart || entryStart(entry) > roleEnd) {
      warn(`${slug} (${project.period}) sits entirely outside "${role.title}" (${role.period})`);
    }
  }
}

const covered = new Set(roles.flatMap((r) => r.projects));
for (const project of projects) {
  const entry = timeline.find((e) => e.slug === project.slug);
  const personal = entry?.track === "personal";
  if (!personal && !covered.has(project.slug)) {
    warn(`client project "${project.slug}" is listed under no role in experience.ts`);
  }
}
ok(`${roles.length} roles checked against project dates`);

/* ----------------------------------------------------- hand-typed stats ---- */
section("Hand-typed numbers in copy");

const domains = new Set(projects.map((p) => p.domain.split("·")[0].trim()));

for (const stat of headlineStats) {
  if (/projects delivered/i.test(stat.label)) {
    if (stat.value !== projects.length) {
      fail(`headlineStats "Projects delivered" says ${stat.value}, there are ${projects.length}`);
    }
    const claimed = Number(stat.sub.match(/(\d+)\s+domains/i)?.[1]);
    if (claimed && claimed !== domains.size) {
      fail(`headlineStats sub claims ${claimed} domains, there are ${domains.size}: ${[...domains].join(", ")}`);
    }
  }
}

// Any "<n> projects" or "<n> domains" claim in profile prose must match reality.
const WORD_NUM = { one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12 };
const asNumber = (token) => WORD_NUM[token.toLowerCase()] ?? Number(token.replace(/,/g, ""));

const prose = [
  profile.intro, profile.tagline, profile.certification,
  ...profile.achievements, ...profile.competencies,
  ...lifecycle.map((l) => l.body),
  ...headlineStats.map((s) => s.sub),
].join("  ");

for (const [, token, noun] of prose.matchAll(/\b([\w,]+)\s+(projects|domains)\b/gi)) {
  const n = asNumber(token);
  if (!Number.isFinite(n)) continue;
  const actual = noun.toLowerCase() === "projects" ? projects.length : domains.size;
  if (n !== actual) fail(`copy claims "${token} ${noun}" but there are ${actual}`);
}

const deploy = headlineStats.find((s) => /deploy/i.test(s.label));
if (deploy) {
  const modcart = projects.find((p) => p.slug === "modcart");
  const backs = modcart?.highlights.some((h) => h.includes("10–15 seconds") || h.includes("8 minutes"));
  if (!backs) fail("headline deploy-downtime stat is not backed by any Modcart highlight");
}

const coverage = headlineStats.find((s) => /coverage/i.test(s.label));
if (coverage) {
  const eg = projects.find((p) => p.slug === "estateguru");
  const backs = eg?.highlights.some((h) => /90%/.test(h));
  if (!backs) fail("headline test-coverage stat is not backed by any Estateguru highlight");
}
ok(`headline stats cross-checked against project highlights`);

/* ---------------------------------------------------------- metrics ---- */
section("Metrics attribution");

for (const project of projects) {
  for (const metric of project.metrics) {
    if (!metric.source) {
      warn(`${project.slug}: metric "${metric.value} ${metric.label}" has no source — it will not print on the résumé`);
    }
    if (/^[A-Z]/.test(metric.label) && metric.label !== metric.label.toUpperCase()) {
      warn(`${project.slug}: metric label "${metric.label}" is capitalised — reads oddly after the value`);
    }
  }
}
ok("client figures checked for attribution");

/* -------------------------------------------------------------- assets ---- */
section("Images");

for (const project of projects) {
  const file = resolve(ROOT, "public", project.image.src.replace(/^\//, ""));
  if (!existsSync(file)) fail(`${project.slug}: image ${project.image.src} does not exist`);
  const art = resolve(ROOT, "public", "projects", "art", `${project.slug}.png`);
  if (!existsSync(art)) fail(`${project.slug}: background art public/projects/art/${project.slug}.png does not exist — run scripts/build-covers.mjs`);
}
ok(`${projects.length} project images present`);

/* -------------------------------------------------------------- skills ---- */
section("Skills coverage");
for (const group of skillGroups) {
  for (const skill of group.items) {
    for (const slug of skill.projects ?? []) {
      if (!projectSlugs.has(slug)) fail(`skill "${skill.name}" lists unknown project "${slug}"`);
    }
  }
}


const skillNames = new Set(
  skillGroups.flatMap((g) => g.items.flatMap((s) => [s.name, ...(s.aliases ?? [])]))
    .map((n) => n.toLowerCase()),
);

for (const skill of marqueeSkills) {
  if (!skillNames.has(skill.toLowerCase())) warn(`marquee skill "${skill}" is in no skill group`);
}

const stackEntries = new Set(projects.flatMap((p) => p.stack).map((t) => t.toLowerCase()));
for (const tech of stackEntries) {
  if (!skillNames.has(tech)) warn(`project stack lists "${tech}" but no skill group claims it`);
}
ok(`${skillNames.size} skill names indexed against ${stackEntries.size} distinct stack entries`);

/* --------------------------------------------------- claims made in prose ---- */
section("Prose claims backed by data");

const allHighlights = projects.flatMap((p) => [p.summary, p.contribution, ...p.highlights]).join(" ");

const ongoing = timeline.filter((e) => e.spans.some((s) => s.end === null)).map((e) => e.slug);
if (/currently revamping a european property-lending/i.test(profile.intro)) {
  const eg = projects.find((p) => p.slug === "estateguru");
  if (!ongoing.includes("estateguru")) fail('profile.intro says "currently revamping" but Estateguru is not ongoing');
  if (!/property-lending/i.test(eg?.summary ?? "")) fail("profile.intro's property-lending claim is not in the Estateguru summary");
}

if (/most recently senior developer on an ai-assisted observability/i.test(profile.intro)) {
  const closed = timeline.filter((e) => !e.spans.some((s) => s.end === null));
  const latest = closed.sort((a, b) => entryEnd(b) - entryEnd(a))[0];
  if (latest?.slug !== "nextdecade") {
    fail(`profile.intro says Observability is the most recent finished work, but that is "${latest?.label}"`);
  }
}

for (const phase of lifecycle) {
  const numbers = phase.body.match(/\b(five|six|\d[\d,]*%?)\b/gi) ?? [];
  for (const n of numbers) {
    if (!new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(allHighlights)) {
      warn(`lifecycle "${phase.title}" mentions "${n}" — no project highlight repeats it`);
    }
  }
}

for (const tool of simarium.tools) {
  const devtools = projects.find((p) => p.slug === "devtools");
  const mentioned = [devtools?.contribution, ...(devtools?.highlights ?? [])].join(" ");
  const key = tool.name.split(" ")[0];
  if (!new RegExp(key, "i").test(mentioned)) {
    warn(`simarium tool "${tool.name}" is not reflected in the DevTools project content`);
  }
}
ok("intro, lifecycle and Simarium claims cross-checked");

/* ------------------------------------------------- generated résumé ---- */
section("Résumé");

// content/resume.ts holds the document's own prose, but every date on it must
// still come from the timeline — that is the one thing the two must share.
const resumeSlugs = [
  ...resume.roles.flatMap((r) => r.projects.map((p) => p.slug)),
  ...resume.additional.map((a) => a.slug),
];

for (const slug of resumeSlugs) {
  if (!projects.some((p) => p.slug === slug)) fail(`résumé references unknown project "${slug}"`);
  if (!timeline.some((e) => e.slug === slug)) fail(`résumé project "${slug}" has no timeline entry`);
}
if (new Set(resumeSlugs).size !== resumeSlugs.length) fail("a project appears twice on the résumé");

const resumePath = resolve(ROOT, "public", "resume.html");
if (!existsSync(resumePath)) {
  warn("public/resume.html not built — run scripts/build-resume.mjs");
} else {
  const built = readFileSync(resumePath, "utf8");
  for (const slug of resumeSlugs) {
    const expected = periodFor(slug);
    if (!built.includes(expected)) {
      fail(`résumé shows a stale period for "${slug}" (timeline says "${expected}")`);
    }
  }
  for (const role of resume.roles) {
    if (!built.includes(role.period)) fail(`résumé omits role period "${role.period}"`);
  }
  if (!built.includes(resume.education.period)) fail("résumé omits the education period");
  ok(`${resumeSlugs.length} résumé entries carry timeline dates`);
}

const onSite = new Set(projects.map((p) => p.slug));
const missing = [...onSite].filter((slug) => !resumeSlugs.includes(slug));
if (missing.length > 0) {
  warn(`on the site but not the résumé: ${missing.join(", ")} — intentional, the résumé keeps its original scope`);
}

/* --------------------------------------------------------------- output ---- */
console.log("");
for (const w of warnings) console.log(`  WARN  ${w}`);
for (const f of failures) console.log(`  FAIL  ${f}`);
console.log(`\n${failures.length} failures, ${warnings.length} warnings\n`);
process.exit(failures.length > 0 ? 1 : 0);
