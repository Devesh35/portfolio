import { projects } from "@/content/projects";
import { timeline } from "@/content/timeline";

/**
 * Who Dev is. Reconciled from Devesh_Singh_Resume.pdf (the canonical file).
 *
 * Experience length is COMPUTED, not typed, because three older resumes each
 * hard-coded a different number ("4+", "4.5+", "nearly 5") and drifted apart.
 * One start date can never disagree with itself.
 */

export const CAREER_START = new Date("2021-11-01");
// The computations live in lib/experience.ts (yearsSinceCareerStart,
// experienceLabel) — one clock, read from everywhere.

/** Distinct domains worked in, counted rather than claimed. */
const domainCount = new Set(projects.map((p) => p.domain.split("·")[0].trim())).size;

/** Client engagements only — DevTools and Dine In are personal builds with no
 *  client (Dine In predates Nirmitee.io entirely), so they don't belong in a
 *  "delivered to client satisfaction" count. Cross-referenced against
 *  content/timeline.ts's `track`, the same distinction content/experience.ts
 *  and scripts/audit-content.mjs already use. */
const clientProjects = projects.filter(
  (p) => timeline.find((t) => t.slug === p.slug)?.track === "nirmitee",
);
const clientDomainCount = new Set(
  clientProjects.map((p) => p.domain.split("·")[0].trim()),
).size;

export const profile = {
  name: "Devesh Singh",
  /** Single public title. Do not vary this across the site. */
  title: "Full Stack & DevOps Engineer",
  currentRole: "SDE 2 at Nirmitee.io",
  location: "Pune, India",

  /** The hero line. One sentence, no adjectives that can't be checked. */
  tagline:
    "I build web and mobile products end to end — and the pipelines that ship them.",

  intro:
    "Next.js and React Native front ends, Node.js services on MongoDB and PostgreSQL, and the Docker, Terraform and CI/CD that put them into production on AWS and Azure. Currently project lead on Phase 2 of a European property-lending platform (the borrower-facing app); most recently project lead on a fixed-scope AI-assisted observability platform.",

  email: "devesh46singh@gmail.com",
  phone: "+91 78751 77354",

  links: {
    github: "https://github.com/Devesh35",
    linkedin: "https://linkedin.com/in/devesh-singh-769249129",
    devtools: "https://devtools.simarium.in",
  },

  /** Bump this whenever public/resume.pdf is replaced. */
  resume: {
    href: "/Devesh_Singh_Resume.pdf",
    downloadAs: "Devesh_Singh_Resume.pdf",
    updated: "September 2026",
  },

  education: {
    degree: "Bachelor of Engineering",
    school: "Datta Meghe College of Engineering",
    university: "University of Mumbai",
    place: "Airoli, Maharashtra",
    period: "Jul 2016 – Oct 2020",
    result: "CGPA 7.86",
    project:
      "Automated Writing Machine — a mechatronics device that reproduces a person's handwriting from a sample and a block of text.",
  },

  certification:
    "Meta Full Stack Developer Professional Certificate — Coursera, Aug–Sep 2023. Covers React, JavaScript, UX/UI, HTML and CSS.",

  achievements: [
    "Employee of the Month at Nirmitee.io, for consistent delivery and client satisfaction.",
    "Promoted from Software Engineer to SDE 2 in April 2024.",
    `Delivered ${clientProjects.length} projects to client satisfaction across ${clientDomainCount} domains.`,
  ],

  interests: ["System design", "Developer tooling", "Photography"],

  languages: [
    { name: "English", level: "Full professional proficiency" },
    { name: "Hindi", level: "Native proficiency" },
  ],

  /** Non-technical strengths, from the Nirmitee.io profile deck. */
  competencies: ["Problem solving", "System design", "Team collaboration", "Analytical thinking"],
} as const;

/**
 * Headline figures — DEV'S OWN outcomes, not a client's business metrics.
 *
 * Platform-scale numbers (Estateguru's €951M, Boongg's 1M rides) are the
 * client's achievement, not his. They live on the project pages, attributed to
 * their source. Putting them in the hero would claim credit for someone else's
 * balance sheet, which is exactly the kind of thing an interviewer catches.
 */
export const headlineStats = [
  {
    // `projects.length` includes the two personal builds, so this says
    // "built", not "delivered" — the delivered-to-client count is the
    // achievements line, computed from clientProjects above.
    value: projects.length,
    suffix: "",
    label: "Projects built",
    sub: `Across ${domainCount} domains`,
  },
  {
    value: 5,
    suffix: "s",
    label: "Deploy downtime",
    sub: "Cut from ~1 min · Modcart",
  },
  {
    value: 90,
    suffix: "%",
    label: "Test coverage",
    sub: "Up from ~40% · Estateguru",
  },
];

/**
 * "How I think" — five principles for the About page, in Dev's voice about
 * his own beliefs about building software. DRAFT ONLY (REDESIGN-PLAN.md,
 * Step 5): this is the one section on the site written as a personal
 * statement rather than a checkable fact, so Dev reviews and rewrites any
 * line that doesn't sound like him before this ships. Each grounding example
 * references something already documented elsewhere on the site — nothing
 * new is claimed.
 */
export const principles = [
  {
    title: "Understand the system before the components",
    body: "Requirements, boundaries and data flow come first. The GOAPI schema was designed from the requirements spec before any code was written.",
  },
  {
    title: "Make ownership explicit",
    body: "Clear modules, clear interfaces — that's what the Nx monorepo boundaries on Estateguru are for. Nobody should have to guess where something belongs.",
  },
  {
    title: "Ship in small steps, with fast feedback",
    body: "Pipelines and multi-environment releases run on every client project. Small releases fail small.",
  },
  {
    title: "Operate what you build",
    body: "Logs, metrics, alerts and a rollback path come before calling something done — that's what the Datadog setup on Estateguru is for. Shipping isn't the finish line.",
  },
  {
    title: "Measure before optimising",
    body: "The Modcart load-time work and the Boongg query work both started from measurements, not hunches. Guessing which part is slow is usually wrong.",
  },
] as const;

/** What he has personally owned, and how often. Counted from content/projects.ts.
 *  `tag` is the one-line role of the phase, `headline` the claim it makes,
 *  `tools` the stack behind it (exact skill spellings — the home page draws
 *  their marks). */
export const lifecycle = [
  {
    id: "design",
    tag: "Plan & architect",
    headline: "Shape the system before the code.",
    tools: ["Schema design", "REST API design", "PostgreSQL", "MongoDB", "Nx Monorepo", "Storybook", "Figma", "draw.io"],
    title: "Design",
    body: "Architecture and database schemas from requirements specs — six-role access models, event-driven analytics pipelines, monorepo boundaries shared across web and mobile.",
  },
  {
    id: "lead",
    tag: "Own & deliver",
    headline: "Carry a team from scope to release.",
    tools: ["Agile / Scrum", "JIRA", "Azure DevOps", "GitLab", "Git"],
    title: "Lead",
    body: "Project lead on fixed-scope and phase engagements: system design, code review and delivery — a five-person team (4 developers, 1 QA) on an AI-assisted observability platform, and a six-person team (4 developers, 2 QA) on a property-lending platform's borrower-facing app across frontend and backend.",
  },
  {
    id: "build",
    tag: "Write & implement",
    headline: "Turn designs into real systems.",
    tools: ["Next.js", "React", "React Native", "TypeScript", "Node.js", "Express.js", "MongoDB", "PostgreSQL", "Redis", "WebSocket", "Nx Monorepo"],
    title: "Build",
    body: "Next.js and React Native front ends sharing libraries, types and API clients through an Nx monorepo. Node.js services on MongoDB and PostgreSQL behind REST and WebSocket APIs.",
  },
  {
    id: "test",
    tag: "Ensure quality",
    headline: "Catch it before production does.",
    tools: ["Jest", "Cypress", "node:test runner", "Unit testing", "Integration testing"],
    title: "Test",
    body: "Jest and Cypress coverage raised to roughly 90% on targeted modules, with end-to-end tests that catch regressions in investor and loan flows before they reach production.",
  },
  {
    id: "ship",
    tag: "Deploy & release",
    headline: "Environments as code, releases in seconds.",
    tools: ["Docker", "GitHub Actions", "GitLab CI/CD", "Terraform", "AWS", "Azure", "Blue-green deployment", "Rolling deployments", "Multi-environment deployments"],
    title: "Ship",
    body: "Docker images, GitHub Actions pipelines, Terraform-provisioned AWS and Azure. Environments defined as code, with blue-green cutovers measured in seconds rather than minutes.",
  },
  {
    id: "operate",
    tag: "Monitor & improve",
    headline: "Stay responsible after the release.",
    tools: ["Datadog", "Amazon CloudWatch"],
    title: "Operate",
    body: "Datadog and CloudWatch alerting, fast rollback paths, and production data migrations run against a live regulated FinTech platform without losing a record.",
  },
] as const;
