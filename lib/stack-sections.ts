/**
 * How a project's stack is sectioned everywhere it renders, and the order the
 * flat list is generated in (scripts/sync-stacks.mjs). One classification,
 * both surfaces (Dev's section plan, 2026-08-29).
 */

export interface StackSection {
  id: string;
  label: string;
}

export const STACK_SECTIONS: StackSection[] = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "database", label: "Database" },
  { id: "deployment", label: "Deployment & Cloud" },
  { id: "testing", label: "Testing" },
  { id: "integrations", label: "Integrations" },
  { id: "tooling", label: "Tooling" },
  { id: "other", label: "Other" },
];

const SECTION_OF: Record<string, string> = {
  // Frontend
  "Next.js": "frontend", React: "frontend", "React Native": "frontend",
  TypeScript: "frontend", "JavaScript (ES6+)": "frontend", Redux: "frontend",
  "Tailwind CSS": "frontend", "Android (Java, Kotlin)": "frontend",
  "Electron.js": "frontend", Canvas: "frontend", "Simulation engines": "frontend",
  "Responsive & cross-platform UI": "frontend",
  // Backend
  "Node.js": "backend", "Express.js": "backend", "REST API design": "backend",
  Microservices: "backend", WebSocket: "backend", "Apache Kafka": "backend",
  "Swagger / OpenAPI": "backend",
  // Database
  MongoDB: "database", PostgreSQL: "database", Redis: "database",
  Firebase: "database", "Schema design": "database",
  "Query optimisation & scaling": "database",
  // Deployment & Cloud
  AWS: "deployment", "Amazon EC2": "deployment", "AWS Elastic Beanstalk": "deployment",
  "Amazon ECS": "deployment", "AWS Lambda": "deployment", "Amazon S3": "deployment",
  "Amazon RDS": "deployment", "Amazon DynamoDB": "deployment",
  "Amazon Route 53": "deployment", "Elastic Load Balancing": "deployment",
  "Amazon CloudFront": "deployment", "Amazon SNS": "deployment", "Amazon SQS": "deployment",
  "AWS IAM": "deployment", "Amazon CloudWatch": "deployment",
  Azure: "deployment", "Azure App Service": "deployment", "Azure Blob Storage": "deployment",
  "Azure Cosmos DB": "deployment", Docker: "deployment", "Docker Compose": "deployment",
  Terraform: "deployment", CloudFormation: "deployment", "CI/CD pipelines": "deployment",
  "GitHub Actions": "deployment", "GitLab CI/CD": "deployment",
  "Multi-environment deployments": "deployment", "Blue-green deployment": "deployment",
  "Rolling deployments": "deployment", Datadog: "deployment",
  // Testing
  Jest: "testing", "node:test runner": "testing", Cypress: "testing",
  "Unit testing": "testing", "Integration testing": "testing",
  // Integrations
  "SSO / OAuth 2.0": "integrations", "Google Sign-In": "integrations",
  "Meta Login": "integrations", "Sign in with Apple": "integrations",
  "Google Maps": "integrations", Razorpay: "integrations",
  "Meta Business APIs (WhatsApp, Facebook, Instagram)": "integrations",
  Lokalise: "integrations", "GPT-5.4": "integrations", "Azure AI Foundry": "integrations",
  Okta: "integrations", "Microsoft Entra ID": "integrations",
  "Microsoft Entra PIM": "integrations",
  // Tooling
  "Nx Monorepo": "tooling", Selenium: "tooling",
  "Azure DevOps": "tooling", "Azure Repos": "tooling",
};

export const sectionOf = (name: string): string => SECTION_OF[name] ?? "other";

/** Entries that belong in more than one section — rendered in each.
 *  Managed database services live under their cloud AND under Database. */
const ALSO_IN: Record<string, string[]> = {
  "Azure Cosmos DB": ["database"],
  "Amazon RDS": ["database"],
  "Amazon DynamoDB": ["database"],
};

/** Practice entries sort after concrete tech inside every section. */
const PRACTICE_NAMES = new Set([
  "Responsive & cross-platform UI", "REST API design", "Microservices",
  "Schema design", "Query optimisation & scaling", "Multi-environment deployments",
  "Blue-green deployment", "Rolling deployments", "CI/CD pipelines",
  "Unit testing", "Integration testing",
]);

/** Split a flat stack into its labelled sections, empty ones dropped.
 *  Within a section: primary entries, then cross-listed ones (managed DBs),
 *  then practices — so "MongoDB, Amazon DynamoDB, Query optimisation". */
export function groupStack(stack: readonly string[]): { label: string; items: string[] }[] {
  return STACK_SECTIONS.map((section) => {
    const inSection = (name: string) =>
      sectionOf(name) === section.id || ALSO_IN[name]?.includes(section.id);
    const rank = (name: string) => {
      if (PRACTICE_NAMES.has(name)) return 2;
      return sectionOf(name) === section.id ? 0 : 1;
    };
    const items = stack.filter(inSection);
    items.sort((a, b) => rank(a) - rank(b) || stack.indexOf(a) - stack.indexOf(b));
    return { label: section.label, items };
  }).filter((section) => section.items.length > 0);
}
