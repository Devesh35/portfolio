import { projects } from "@/content/projects";

/**
 * Everything Dev works with, merged from all four résumés.
 *
 * Groups are the SYSTEMS PAGE node taxonomy (SYSTEMS-PAGE-PLAN.md, 2026-09-09):
 * each group is one node in the build-to-production tree at /systems, read top
 * to bottom the way a build reaches production. Every skill has exactly one
 * home group (its primary chip); a few are additionally cross-listed into a
 * second node via `alsoIn`, rendered dimmed there so nothing looks
 * double-counted. Project stacks are unaffected by the grouping —
 * lib/stack-sections.ts and scripts/sync-stacks.mjs classify by skill NAME,
 * never by these group ids.
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
  /** Group ids this skill ALSO renders in, dimmed, beside its one primary
   *  chip (e.g. a managed database shown under Data too). Presentational
   *  only — evidence and the audit's once-per-skill check use the home
   *  group. */
  alsoIn?: string[];
  /** Sub-heading inside a node's chip list (Integrations: Identity/Services). */
  subgroup?: string;
  /** New entry with no project evidence yet — renders dashed until Dev
   *  supplies the projects it should claim. */
  pending?: boolean;
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

const DESIGN_NOTE = "Used across design work — not tied to one project here yet.";
const AI_TOOL_NOTE = "Everyday AI tooling — not tied to one project here.";

export const skillGroups: SkillGroup[] = [
  {
    id: "design",
    label: "Design",
    note: "Where systems start",
    items: [
      { name: "Figma", note: DESIGN_NOTE, pending: true },
      { name: "draw.io", note: DESIGN_NOTE, pending: true },
      { name: "Mermaid", note: DESIGN_NOTE, pending: true },
      { name: "Storybook", projects: ["estateguru"] },
      { name: "Design system", projects: ["estateguru"] },
    ],
  },
  {
    id: "web",
    label: "Web",
    note: "Client applications",
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
    id: "api",
    label: "API",
    note: "Backend services",
    items: [
      { name: "Node.js" },
      { name: "Express.js", aliases: ["Express"], projects: WITH_DB },
      { name: "REST API design", projects: WITH_DB },
      { name: "Microservices", projects: ["estateguru"] },
      { name: "WebSocket" },
      { name: "Apache Kafka", aliases: ["Kafka"] },
      { name: "Swagger / OpenAPI" },
    ],
  },
  {
    id: "data",
    label: "Data",
    note: "Storage & query",
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
    id: "test",
    label: "Test",
    note: "The gate before shipping",
    items: [
      { name: "Jest", projects: ["estateguru", "modcart", "datachamps"] },
      { name: "node:test runner", aliases: ["node:test"], projects: ["estateguru", "modcart", "goapi", "wellcompanion", "datachamps"] },
      { name: "Cypress", projects: ["estateguru"] },
      { name: "Unit testing", projects: ["estateguru", "modcart", "wellcompanion", "datachamps"] },
      { name: "Integration testing", projects: ["estateguru", "goapi"] },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    note: "Plugged into Web & API",
    items: [
      { name: "SSO / OAuth 2.0", aliases: ["SSO"], subgroup: "Identity", projects: ["estateguru", "nextdecade", "modcart", "wellcompanion", "dine-in"] },
      { name: "Google Sign-In", aliases: ["Google OAuth"], subgroup: "Identity", projects: ["estateguru", "modcart", "wellcompanion", "dine-in"] },
      { name: "Meta Login", aliases: ["Facebook Login"], subgroup: "Identity" },
      { name: "Sign in with Apple", aliases: ["Apple Sign-In"], subgroup: "Identity" },
      { name: "Okta", subgroup: "Identity" },
      { name: "Microsoft Entra ID", aliases: ["Entra ID", "Azure AD"], subgroup: "Identity" },
      { name: "Razorpay", subgroup: "Services" },
      { name: "Google Maps", subgroup: "Services", projects: ["estateguru", "boongg"] },
      { name: "Meta Business APIs (WhatsApp, Facebook, Instagram)", subgroup: "Services", projects: ["modcart"] },
      { name: "Lokalise", subgroup: "Services" },
      { name: "GPT-5.4", subgroup: "Services" },
      { name: "Google Analytics", aliases: ["GA4", "GA"], subgroup: "Services", note: "Page and event tracking on the web apps.", projects: ["estateguru", "modcart"] },
      { name: "Meta Pixel", aliases: ["Facebook Pixel"], subgroup: "Services", note: "Conversion tracking on the embedded stores and shoppable ads.", projects: ["modcart"] },
      { name: "Tally", subgroup: "Services", note: "Accounting system integrated through its desktop companion.", projects: ["datachamps"] },
    ],
  },
  {
    id: "container",
    label: "Container & build",
    note: "Package and run anywhere",
    items: [
      { name: "Docker", projects: ["estateguru", "goapi"] },
      { name: "Docker Compose", projects: ["estateguru", "goapi"] },
      { name: "Nx Monorepo", aliases: ["Nx", "NX Monorepo"], projects: ["estateguru"] },
      { name: "Nx Cloud", projects: ["estateguru"] },
    ],
  },
  {
    id: "cicd",
    label: "CI/CD & infra as code",
    note: "Automate and deploy",
    items: [
      { name: "CI/CD pipelines", aliases: ["CI/CD"], projects: ["estateguru", "nextdecade", "modcart", "goapi"] },
      { name: "GitHub Actions", projects: ["estateguru"] },
      { name: "GitLab CI/CD", projects: ["modcart", "goapi", "boongg", "tradegully", "bestosys", "datachamps"] },
      { name: "App Store", projects: ["estateguru", "wellcompanion", "goapi"] },
      { name: "Google Play", projects: ["estateguru", "wellcompanion", "goapi", "boongg"] },
      { name: "Vercel", projects: ["devtools"] },
      { name: "Terraform" },
      { name: "CloudFormation" },
      { name: "Multi-environment deployments", projects: NIRMITEE },
      { name: "Blue-green deployment", projects: ["estateguru", "modcart"] },
      { name: "Rolling deployments", projects: ["nextdecade", "goapi", "wellcompanion"] },
    ],
  },
  {
    id: "cloud",
    label: "Cloud",
    note: "Infrastructure and managed services",
    items: [
      { name: "AWS", aliases: ["AWS (EC2, S3, RDS, IAM, CloudWatch, Lambda)"], subgroup: "AWS", projects: ON_AWS },

      { name: "Amazon EC2", aliases: ["EC2"], subgroup: "AWS", note: "Compute — the instances application services run on.", projects: ["boongg", "datachamps", "modcart"] },
      { name: "AWS Elastic Beanstalk", aliases: ["Elastic Beanstalk"], subgroup: "AWS", note: "Managed application environments.", projects: ["modcart", "goapi", "tradegully", "bestosys"] },
      { name: "Amazon ECS", aliases: ["ECS"], subgroup: "AWS", note: "Container orchestration for the services.", projects: ["estateguru"] },
      { name: "AWS Lambda", aliases: ["Lambda"], subgroup: "AWS", note: "Event-driven functions off the request path." },

      { name: "Amazon S3", aliases: ["S3"], subgroup: "AWS", note: "Object storage — assets, artefacts, backups.", projects: ON_AWS },

      { name: "Amazon RDS", aliases: ["RDS"], subgroup: "AWS", note: "Managed relational databases.", projects: ["goapi", "datachamps"], alsoIn: ["data"] },
      { name: "Amazon DynamoDB", aliases: ["DynamoDB"], subgroup: "AWS", note: "Managed key-value store.", projects: ["tradegully"], alsoIn: ["data"] },

      { name: "Amazon Route 53", aliases: ["Route 53", "Route53"], subgroup: "AWS", note: "DNS and record management.", projects: ON_AWS },
      { name: "Elastic Load Balancing", aliases: ["ELB"], subgroup: "AWS", note: "Traffic distribution across instances.", projects: ON_AWS },
      { name: "Amazon CloudFront", aliases: ["CloudFront"], subgroup: "AWS", note: "CDN in front of the application.", projects: ["estateguru", "modcart", "bestosys"] },

      { name: "Amazon SNS", aliases: ["SNS"], subgroup: "AWS", note: "Pub/sub notifications between services.", projects: ["estateguru", "boongg"] },
      { name: "Amazon SQS", aliases: ["SQS"], subgroup: "AWS", note: "Queues that decouple slow work from requests.", projects: ["estateguru", "boongg"] },

      { name: "AWS IAM", aliases: ["IAM"], subgroup: "AWS", note: "Roles and policies scoping what each service can touch.", projects: ON_AWS },

      { name: "Azure", aliases: ["Azure (VMs, App Services, DevOps, Repos)"], subgroup: "Azure", projects: ["nextdecade", "wellcompanion"] },
      { name: "Azure App Service", subgroup: "Azure", projects: ["nextdecade", "wellcompanion"] },
      { name: "Azure Blob Storage", aliases: ["Blob Storage", "Storage containers"], subgroup: "Azure" },
      { name: "Azure Cosmos DB", aliases: ["Cosmos DB", "Cosmos"], subgroup: "Azure", alsoIn: ["data"] },
      { name: "Azure AI Foundry", aliases: ["AI Foundry"], subgroup: "Azure", note: "Managed model hosting the services call for inference.", projects: ["nextdecade"] },
      // Live here (Dev, 2026-09-10); cross-listed where they are used.
      { name: "Microsoft Entra PIM", aliases: ["PIM", "Privileged Identity Management"], subgroup: "Azure", note: "Time-bound, requested elevation for privileged roles on the subscription.", projects: ["nextdecade"], alsoIn: ["integrations/Identity"] },
      { name: "Azure DevOps", subgroup: "Azure", note: "Pipelines for the Azure-hosted platform.", projects: ["nextdecade"], alsoIn: ["cicd"] },
      { name: "Azure Repos", subgroup: "Azure", note: "Source control beside the pipelines.", projects: ["nextdecade"], alsoIn: ["workbench"] },
    ],
  },
  {
    id: "production",
    label: "Production",
    note: "Monitor · operate · improve",
    items: [
      { name: "Datadog" },
      { name: "Amazon CloudWatch", aliases: ["CloudWatch"], projects: ON_AWS, alsoIn: ["cloud/AWS"] },
    ],
  },
  {
    id: "workbench",
    label: "Workbench",
    note: "Everyday tooling, outside the pipeline",
    items: [
      { name: "Git" },
      { name: "GitHub", projects: ["devtools"] },
      { name: "GitLab" },
      { name: "Bitbucket" },
      { name: "Postman", note: "API collections for every backend — the contract the frontends build against.", projects: ["estateguru", "nextdecade", "modcart", "boongg", "goapi", "wellcompanion", "datachamps", "tradegully", "bestosys", "dine-in"] },
      { name: "JIRA" },
      { name: "Agile / Scrum" },
      { name: "ESLint", projects: ["estateguru"] },
      { name: "Selenium", note: "Browser automation, not testing — the scripted Power BI report runs.", projects: ["datachamps"] },
    ],
  },
  {
    id: "ai-tools",
    label: "AI Tools",
    note: "Everyday assistants, outside the pipeline",
    items: [
      { name: "Claude", note: AI_TOOL_NOTE },
      { name: "ChatGPT", note: AI_TOOL_NOTE },
      { name: "Codex", note: AI_TOOL_NOTE },
      { name: "Gemini", note: AI_TOOL_NOTE },
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
