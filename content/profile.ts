import { projects } from "@/content/projects";

/**
 * Who Dev is. Reconciled from Devesh_Singh_Resume.pdf (the canonical file).
 *
 * Experience length is COMPUTED, not typed, because three older resumes each
 * hard-coded a different number ("4+", "4.5+", "nearly 5") and drifted apart.
 * One start date can never disagree with itself.
 */

export const CAREER_START = new Date("2021-11-01");

export function yearsOfExperience(now: Date = new Date()): number {
  const months =
    (now.getFullYear() - CAREER_START.getFullYear()) * 12 +
    (now.getMonth() - CAREER_START.getMonth());
  return Math.floor((months / 12) * 10) / 10;
}

/** Distinct domains worked in, counted rather than claimed. */
const domainCount = new Set(projects.map((p) => p.domain.split("·")[0].trim())).size;

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
    "Next.js and React Native front ends, Node.js services on MongoDB and PostgreSQL, and the Docker, Terraform and CI/CD that put them into production on AWS and Azure. Currently revamping a European property-lending platform; and most recently senior developer on an AI-assisted observability platform.",

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
    updated: "August 2026",
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
    `Delivered ${projects.length} projects to client satisfaction across ${domainCount} domains.`,
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
    value: projects.length,
    suffix: "",
    label: "Projects delivered",
    sub: `Across ${domainCount} domains`,
  },
  {
    value: 15,
    suffix: "s",
    label: "Deploy downtime",
    sub: "Cut from ~8 min · Modcart",
  },
  {
    value: 90,
    suffix: "%",
    label: "Test coverage",
    sub: "Targeted modules · Estateguru",
  },
];

/** What he has personally owned, and how often. Counted from content/projects.ts. */
export const lifecycle = [
  {
    id: "design",
    title: "Design",
    body: "Architecture and database schemas from requirements specs — six-role access models, event-driven analytics pipelines, monorepo boundaries shared across web and mobile.",
  },
  {
    id: "lead",
    title: "Lead",
    body: "Senior developer on a five-person team: system design, code review and delivery. Led the enhancement programme on an advertising platform through to release.",
  },
  {
    id: "build",
    title: "Build",
    body: "Next.js and React Native front ends sharing libraries, types and API clients through an Nx monorepo. Node.js services on MongoDB and PostgreSQL behind REST and WebSocket APIs.",
  },
  {
    id: "test",
    title: "Test",
    body: "Jest and Cypress coverage raised to roughly 90% on targeted modules, with end-to-end tests that catch regressions in investor and loan flows before they reach production.",
  },
  {
    id: "ship",
    title: "Ship",
    body: "Docker images, GitHub Actions pipelines, Terraform-provisioned AWS and Azure. Environments defined as code, with blue-green cutovers measured in seconds rather than minutes.",
  },
  {
    id: "operate",
    title: "Operate",
    body: "Datadog and CloudWatch alerting, fast rollback paths, and production data migrations run against a live regulated FinTech platform without losing a record.",
  },
] as const;
