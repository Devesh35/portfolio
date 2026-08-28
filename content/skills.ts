import { projects } from "@/content/projects";

/**
 * Everything Dev works with, merged from all four résumés.
 *
 * `evidence` links a skill to the projects that actually used it, resolved from
 * each project's own stack list. A skills page that can point at where a thing
 * was used is worth more than one that just lists words.
 */

export interface Skill {
  name: string;
  /** Other spellings used in project stacks, so evidence resolves. */
  aliases?: string[];
  /** Set when the skill predates the projects on this site or has no stack entry. */
  note?: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  note: string;
  items: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    label: "Frontend & Mobile",
    note: "Where most of the delivery happens.",
    items: [
      { name: "Next.js" },
      { name: "React", aliases: ["React.js"] },
      { name: "React Native" },
      { name: "TypeScript" },
      { name: "JavaScript (ES6+)" },
      { name: "Redux" },
      { name: "Tailwind CSS" },
      { name: "Responsive & cross-platform UI" },
      { name: "Android (Java, Kotlin)", aliases: ["Android"] },
      { name: "Canvas" },
      { name: "Simulation engines" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    note: "Modular services, not monoliths.",
    items: [
      { name: "Node.js" },
      { name: "Express.js", aliases: ["Express"] },
      { name: "REST API design" },
      { name: "Microservices" },
      { name: "WebSocket" },
      { name: "Apache Kafka", aliases: ["Kafka"] },
      { name: "Swagger / OpenAPI" },
      { name: "Spring Boot", note: "Earlier backend work at Nirmitee.io" },
    ],
  },
  {
    id: "data",
    label: "Databases & Caching",
    note: "Schema design, and the migrations between them.",
    items: [
      { name: "MongoDB" },
      { name: "PostgreSQL" },
      { name: "Redis" },
      { name: "Firebase" },
      { name: "Schema design" },
      { name: "Query optimisation & scaling" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud & Infrastructure",
    note: "The half of the job most full-stack engineers skip.",
    items: [
      { name: "AWS (EC2, S3, RDS, IAM, CloudWatch, Lambda)", aliases: ["AWS"] },
      { name: "Azure (VMs, App Services, DevOps, Repos)", aliases: ["Azure"] },
      { name: "Docker" },
      { name: "Docker Compose" },
      { name: "Nx Monorepo", aliases: ["Nx", "NX Monorepo"] },
    ],
  },
  {
    id: "iac",
    label: "Infrastructure as Code",
    note: "Environments defined in a repo, not in a console.",
    items: [
      { name: "Terraform" },
      { name: "CloudFormation" },
      { name: "Multi-environment deployments" },
      { name: "Blue-green deployment" },
    ],
  },
  {
    id: "cicd",
    label: "CI/CD & Monitoring",
    note: "Ship often, roll back fast, know when it breaks.",
    items: [
      { name: "CI/CD pipelines", aliases: ["CI/CD"] },
      { name: "GitHub Actions" },
      { name: "GitLab CI/CD" },
      { name: "Azure DevOps" },
      { name: "Datadog" },
      { name: "CloudWatch" },
      { name: "ELK Stack" },
    ],
  },
  {
    id: "testing",
    label: "Testing & QA",
    note: "Coverage that catches regressions before release.",
    items: [
      { name: "Jest" },
      { name: "Cypress" },
      { name: "Unit testing" },
      { name: "Integration testing" },
      { name: "Smoke testing" },
    ],
  },
  {
    id: "ai",
    label: "AI & Integrations",
    note: "Third-party surfaces, wired end to end.",
    items: [
      { name: "Azure AI Foundry" },
      { name: "GPT-5.4" },
      { name: "Razorpay" },
      { name: "Google Maps" },
      { name: "Meta Business APIs (WhatsApp, Facebook, Instagram)" },
    ],
  },
  {
    id: "tools",
    label: "Tooling & Practice",
    note: "How the work gets organised.",
    items: [
      { name: "Git" },
      { name: "GitHub" },
      { name: "GitLab" },
      { name: "Bitbucket" },
      { name: "Azure Repos" },
      { name: "JIRA" },
      { name: "Agile / Scrum" },
      { name: "ESLint" },
    ],
  },
];

/* ------------------------------------------------------------- evidence map */

const normalise = (value: string) => value.trim().toLowerCase();

/** Projects whose stack lists this skill, newest engagement first. */
export function evidenceFor(skill: Skill): string[] {
  const names = [skill.name, ...(skill.aliases ?? [])].map(normalise);
  return projects
    .filter((project) => project.stack.some((tech) => names.includes(normalise(tech))))
    .map((project) => project.slug);
}

/** Flat list for the hero marquee. Order is deliberate — most identifying first. */
export const marqueeSkills = [
  "Next.js", "TypeScript", "Node.js", "React Native", "MongoDB", "PostgreSQL",
  "Docker", "Terraform", "AWS", "Azure", "Kafka", "Redis", "GitHub Actions",
  "Nx", "Datadog", "Cypress",
];
