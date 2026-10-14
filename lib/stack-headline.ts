import type { Project } from "@/content/projects";

/**
 * The few chips a project card has room for (Dev, 2026-10-15): the strongest,
 * most recognisable items of its stack, not the first four in section order
 * (which always came out React · JavaScript · Redux · Responsive UI). Ranked
 * by this list; anything not on it keeps its stack order after the ranked
 * ones. TypeScript and JavaScript are the same slot — a project lists one or
 * the other first, so JavaScript only surfaces where there is no TypeScript.
 */
const HEADLINE_RANK = [
  // Dev's order (2026-10-15): framework → language → runtime → database →
  // cloud → anything else with a strong name.
  "Next.js", "React", "React Native",
  "TypeScript", "JavaScript (ES6+)",
  "Node.js",
  // Cosmos ahead of MongoDB: NextDecade lists both (Mongo API locally, Cosmos
  // in production) and Cosmos was the real store (Dev, 2026-10-15).
  "Azure Cosmos DB", "MongoDB", "PostgreSQL", "Amazon DynamoDB", "Firebase", "Redis",
  "AWS", "Azure",
  "Apache Kafka", "Azure AI Foundry", "GPT-5.4", "Kubernetes", "Docker", "Terraform",
  "CloudFormation", "GitHub Actions", "GitLab CI/CD", "Azure DevOps", "Datadog",
  "Electron.js", "Android (Java, Kotlin)", "Canvas", "Simulation engines",
  "WebSocket", "Okta", "Microsoft Entra ID", "Nx Monorepo", "Tailwind CSS", "Redux", "Express.js",
];

const DATABASES = new Set(["Azure Cosmos DB", "MongoDB", "PostgreSQL", "Amazon DynamoDB", "Firebase", "Redis"]);

const rank = new Map(HEADLINE_RANK.map((name, i) => [name, i]));

/** The project's stack, strongest first; the first N are the card's chips. */
export function headlineStack(project: Pick<Project, "stack">): string[] {
  const hasTypeScript = project.stack.includes("TypeScript");
  const ranked = project.stack
    .filter((name) => !(hasTypeScript && name === "JavaScript (ES6+)"))
    .map((name, i) => ({ name, key: rank.get(name) ?? HEADLINE_RANK.length + i }))
    .sort((a, b) => a.key - b.key)
    .map((item) => item.name);
  // One database slot — "the db used" — so the cloud still makes the chips.
  let dbSeen = false;
  return ranked.filter((name) => {
    if (!DATABASES.has(name)) return true;
    if (dbSeen) return false;
    dbSeen = true;
    return true;
  });
}
