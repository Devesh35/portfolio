import { projects } from "@/content/projects";

/**
 * Everything Dev works with, merged from all four résumés.
 *
 * Evidence — which projects prove a skill — resolves in one of two ways:
 *   1. `projects`: an explicit list, in Dev's own words (2026-08-29). This is
 *      the source of truth wherever it is set.
 *   2. Otherwise, derived from each project's stack list.
 * Keep the two consistent: if a skill gains an explicit list, the how-lines
 * still come from each project's own skillsUsed.
 */

export interface Skill {
  name: string;
  /** Other spellings used in project stacks, so evidence resolves. */
  aliases?: string[];
  /** Set when the skill predates the projects on this site or has no stack entry. */
  note?: string;
  /** Explicit evidence — project slugs, overriding stack derivation. */
  projects?: string[];
}

export interface SkillGroup {
  id: string;
  label: string;
  note: string;
  items: Skill[];
}

/* Shorthands for the explicit lists. */
const ALL = [
  "estateguru", "nextdecade", "modcart", "boongg", "goapi",
  "wellcompanion", "datachamps", "tradegully", "bestosys", "dine-in", "devtools",
];
/** Client work at Nirmitee.io — everything except the two personal projects. */
const NIRMITEE = ALL.filter((slug) => slug !== "dine-in" && slug !== "devtools");
/** The engagements that ran on AWS. */
const ON_AWS = ["estateguru", "modcart", "boongg", "goapi", "datachamps", "tradegully", "bestosys"];
/** Everything with a database — devtools runs entirely client-side. */
const WITH_DB = ALL.filter((slug) => slug !== "devtools");

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    label: "Frontend & Mobile",
    note: "Where most of the delivery happens.",
    items: [
      { name: "Next.js", projects: ["estateguru", "devtools"] },
      { name: "React", aliases: ["React.js"], projects: ["nextdecade", "modcart", "boongg", "datachamps", "tradegully", "bestosys", "dine-in"] },
      { name: "React Native", projects: ["estateguru", "goapi", "wellcompanion"] },
      { name: "TypeScript", projects: ["estateguru", "nextdecade", "goapi", "wellcompanion", "devtools"] },
      { name: "JavaScript (ES6+)", projects: ALL },
      { name: "Redux", projects: ["modcart", "goapi", "datachamps", "tradegully", "bestosys", "dine-in"] },
      { name: "Tailwind CSS", projects: ["nextdecade", "wellcompanion", "devtools"] },
      { name: "Responsive & cross-platform UI", projects: ALL },
      { name: "Android (Java, Kotlin)", aliases: ["Android", "Android (Kotlin)"], projects: ["boongg", "wellcompanion", "dine-in"] },
      { name: "Electron.js", aliases: ["Electron"], projects: ["datachamps"] },
      { name: "Canvas", projects: ["devtools"] },
      { name: "Simulation engines", projects: ["devtools"] },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    note: "Modular services, not monoliths.",
    items: [
      { name: "Node.js" },
      { name: "Express.js", aliases: ["Express"], projects: WITH_DB },
      { name: "REST API design", projects: WITH_DB },
      { name: "Microservices", projects: ["estateguru"] },
      { name: "WebSocket" },
      { name: "Apache Kafka", aliases: ["Kafka"] },
      { name: "Swagger / OpenAPI" },
      { name: "SSO / OAuth 2.0", aliases: ["SSO"], projects: ["estateguru", "nextdecade", "modcart", "wellcompanion", "dine-in"] },
      { name: "Google Sign-In", aliases: ["Google OAuth"], projects: ["estateguru", "modcart", "wellcompanion", "dine-in"] },
      { name: "Meta Login", aliases: ["Facebook Login"] },
      { name: "Sign in with Apple", aliases: ["Apple Sign-In"] },
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
      { name: "Firebase", projects: ["dine-in"] },
      { name: "Schema design", projects: ["nextdecade", "modcart", "goapi", "wellcompanion", "dine-in"] },
      {
        name: "Query optimisation & scaling",
        // Only where an existing system's queries were tuned — not the
        // from-scratch builds (Dev, 2026-08-29).
        projects: ["modcart", "boongg", "tradegully", "bestosys"],
      },
    ],
  },
  {
    id: "aws",
    label: "AWS",
    note: "Grouped by what they do: compute, storage, data, edge, messaging, operations.",
    items: [
      { name: "AWS", aliases: ["AWS (EC2, S3, RDS, IAM, CloudWatch, Lambda)"], projects: ON_AWS },

      { name: "Amazon EC2", aliases: ["EC2"], note: "Compute — the instances application services run on.", projects: ["boongg", "datachamps"] },
      { name: "AWS Elastic Beanstalk", aliases: ["Elastic Beanstalk"], note: "Managed application environments.", projects: ["modcart", "goapi", "tradegully", "bestosys"] },
      { name: "Amazon ECS", aliases: ["ECS"], note: "Container orchestration for the services.", projects: ["estateguru"] },
      { name: "AWS Lambda", aliases: ["Lambda"], note: "Event-driven functions off the request path." },

      { name: "Amazon S3", aliases: ["S3"], note: "Object storage — assets, artefacts, backups.", projects: ON_AWS },

      { name: "Amazon RDS", aliases: ["RDS"], note: "Managed relational databases.", projects: ["goapi", "datachamps"] },
      { name: "Amazon DynamoDB", aliases: ["DynamoDB"], note: "Managed key-value store.", projects: ["tradegully"] },

      { name: "Amazon Route 53", aliases: ["Route 53", "Route53"], note: "DNS and record management.", projects: ON_AWS },
      { name: "Elastic Load Balancing", aliases: ["ELB"], note: "Traffic distribution across instances.", projects: ON_AWS },
      { name: "Amazon CloudFront", aliases: ["CloudFront"], note: "CDN in front of the application.", projects: ["estateguru", "modcart", "bestosys"] },

      { name: "Amazon SNS", aliases: ["SNS"], note: "Pub/sub notifications between services.", projects: ["estateguru", "boongg"] },
      { name: "Amazon SQS", aliases: ["SQS"], note: "Queues that decouple slow work from requests.", projects: ["estateguru", "boongg"] },

      { name: "AWS IAM", aliases: ["IAM"], note: "Roles and policies scoping what each service can touch.", projects: ON_AWS },
      { name: "Amazon CloudWatch", aliases: ["CloudWatch"], projects: ON_AWS },
    ],
  },
  {
    id: "azure",
    label: "Azure",
    note: "The second cloud — where the observability platform lives.",
    items: [
      { name: "Azure", aliases: ["Azure (VMs, App Services, DevOps, Repos)"], projects: ["nextdecade", "wellcompanion"] },
      { name: "Azure App Service", projects: ["nextdecade", "wellcompanion"] },
      { name: "Azure Blob Storage", aliases: ["Blob Storage", "Storage containers"] },
      { name: "Azure Cosmos DB", aliases: ["Cosmos DB", "Cosmos"] },
      { name: "Azure AI Foundry" },
      { name: "Microsoft Entra ID", aliases: ["Entra ID", "Azure AD"] },
      { name: "Microsoft Entra PIM", aliases: ["PIM", "Privileged Identity Management"] },
      { name: "Azure DevOps" },
      { name: "Azure Repos" },
    ],
  },
  {
    id: "containers",
    label: "Containers & Monorepo",
    note: "The half of the job most full-stack engineers skip.",
    items: [
      { name: "Docker", projects: ["estateguru", "goapi"] },
      { name: "Docker Compose", projects: ["estateguru", "goapi"] },
      { name: "Nx Monorepo", aliases: ["Nx", "NX Monorepo"], projects: ["estateguru"] },
    ],
  },
  {
    id: "iac",
    label: "Infrastructure & Deployment",
    note: "Environments defined in a repo, not in a console.",
    items: [
      { name: "Terraform" },
      { name: "CloudFormation" },
      { name: "Multi-environment deployments", projects: NIRMITEE },
      { name: "Blue-green deployment", projects: ["estateguru", "modcart"] },
      { name: "Rolling deployments", projects: ["nextdecade", "goapi", "wellcompanion"] },
    ],
  },
  {
    id: "cicd",
    label: "CI/CD & Monitoring",
    note: "Ship often, roll back fast, know when it breaks.",
    items: [
      { name: "CI/CD pipelines", aliases: ["CI/CD"], projects: ["estateguru", "nextdecade", "modcart", "goapi", "wellcompanion"] },
      { name: "GitHub Actions", projects: ["estateguru"] },
      { name: "GitLab CI/CD", projects: ["modcart", "goapi", "wellcompanion"] },
      { name: "Datadog" },
    ],
  },
  {
    id: "testing",
    label: "Testing & QA",
    note: "Coverage that catches regressions before release.",
    items: [
      { name: "Jest", projects: ["estateguru", "modcart", "datachamps"] },
      { name: "node:test runner", aliases: ["node:test"], projects: ["estateguru", "modcart", "goapi", "wellcompanion", "datachamps"] },
      { name: "Cypress", projects: ["estateguru"] },
      { name: "Unit testing", projects: ["estateguru", "modcart", "wellcompanion", "datachamps"] },
      { name: "Integration testing", projects: ["estateguru", "goapi"] },
    ],
  },
  {
    id: "ai",
    label: "AI & Integrations",
    note: "Third-party surfaces, wired end to end.",
    items: [
      { name: "GPT-5.4" },
      { name: "Okta" },
      { name: "Razorpay" },
      { name: "Google Maps", projects: ["estateguru", "boongg"] },
      { name: "Lokalise" },
      { name: "Meta Business APIs (WhatsApp, Facebook, Instagram)", projects: ["modcart"] },
    ],
  },
  {
    id: "tools",
    label: "Tooling & Automation",
    note: "How the work gets organised — and automated.",
    items: [
      { name: "Selenium", note: "Browser automation, not testing — the scripted Power BI report runs.", projects: ["datachamps"] },
      { name: "Git" },
      { name: "GitHub" },
      { name: "GitLab" },
      { name: "Bitbucket" },
      { name: "JIRA" },
      { name: "Agile / Scrum" },
      { name: "ESLint" },
    ],
  },
];

/* ------------------------------------------------------------- evidence map */

const normalise = (value: string) => value.trim().toLowerCase();

const projectOrder = projects.map((project) => project.slug);

/**
 * Projects that prove this skill. An explicit `projects` list wins; otherwise
 * derived from stack lists. Always returned in the site's project order.
 */
export function evidenceFor(skill: Skill): string[] {
  if (skill.projects) {
    return [...skill.projects].sort(
      (a, b) => projectOrder.indexOf(a) - projectOrder.indexOf(b),
    );
  }
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
