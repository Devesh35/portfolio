import type { EdgeType, NodeCategory } from "./model";

/**
 * Node registry. Every box in a view is one of these kinds; `of` lists the
 * stack spellings that fill it, so a box only exists when the project's stack
 * contains at least one. Unknown kinds fall back to a generic box (see
 * resolve.ts), so a project file can name a kind that isn't here yet without
 * breaking the page — it just renders nothing until the registry knows it.
 */
export interface KindSpec {
  label: string;
  category: NodeCategory;
  of: string[];
  /** Caption under the box title; defaults to the category's label. Set
   *  where two kinds share a category and would otherwise read the same. */
  caption?: string;
}

export const KIND: Record<string, KindSpec> = {
  // clients
  web: { label: "Web app", category: "client", of: ["Next.js", "React", "Tailwind CSS", "Redux", "TypeScript", "JavaScript (ES6+)", "Responsive & cross-platform UI", "Google Analytics", "Meta Pixel"] },
  designsystem: { label: "Design system", category: "client", caption: "Shared UI", of: ["Storybook", "Design system"] },
  native: { label: "Native support", category: "client", caption: "Kotlin · Swift", of: ["Android (Java, Kotlin)"] },
  canvas: { label: "2D canvas", category: "service", caption: "Rendering", of: ["Canvas"] },
  sim: { label: "Simulation engine", category: "service", caption: "Modelled state", of: ["Simulation engines"] },
  mobile: { label: "Mobile app", category: "client", of: ["React Native", "Android (Java, Kotlin)"] },
  desktop: { label: "Desktop app", category: "client", of: ["Electron.js"] },
  // services
  api: { label: "Backend", category: "service", of: ["Node.js", "Express.js", "REST API design", "Microservices", "Swagger / OpenAPI", "WebSocket"] },
  events: { label: "Event stream", category: "service", of: ["Apache Kafka"] },
  automation: { label: "Automation", category: "service", of: ["Selenium"] },
  // data
  cache: { label: "Cache", category: "data", of: ["Redis"] },
  database: { label: "Database", category: "data", of: ["MongoDB", "PostgreSQL", "Firebase", "Azure Cosmos DB", "Amazon RDS", "Amazon DynamoDB", "Schema design", "Query optimisation & scaling"] },
  storage: { label: "Object storage", category: "data", of: ["Amazon S3", "Azure Blob Storage"] },
  managed: { label: "Managed data", category: "data", of: ["Amazon RDS", "Amazon DynamoDB", "Azure Cosmos DB"] },
  // boundary — who signs in, what lives outside
  identity: { label: "Identity", category: "boundary", caption: "Sign-in providers", of: ["SSO / OAuth 2.0", "Google Sign-In", "Meta Login", "Sign in with Apple", "Okta", "Microsoft Entra ID", "Microsoft Entra PIM"] },
  external: { label: "External", category: "boundary", caption: "Third-party APIs", of: ["Razorpay", "Google Maps", "Meta Business APIs (WhatsApp, Facebook, Instagram)", "Lokalise", "GPT-5.4", "Tally"] },
  // delivery
  source: { label: "Source", category: "delivery", of: ["GitHub", "GitLab", "Azure Repos", "Bitbucket"] },
  pipeline: { label: "CI/CD", category: "delivery", of: ["CI/CD pipelines", "GitHub Actions", "GitLab CI/CD", "Azure DevOps"] },
  lint: { label: "Lint", category: "delivery", of: ["ESLint"] },
  nxcloud: { label: "Nx Cloud", category: "delivery", of: ["Nx Cloud"] },
  test: { label: "Test", category: "delivery", of: ["Jest", "Cypress", "node:test runner", "Unit testing", "Integration testing"] },
  build: { label: "Build", category: "delivery", of: ["Docker", "Docker Compose", "Nx Monorepo", "GitLab CI/CD", "Azure DevOps"] },
  mobilebuild: { label: "Build", category: "delivery", of: ["React Native"] },
  release: { label: "Release strategy", category: "delivery", of: ["Multi-environment deployments", "Blue-green deployment", "Rolling deployments", "Vercel", "App Store", "Google Play"] },
  iac: { label: "Infra as code", category: "delivery", of: ["Terraform", "CloudFormation"] },
  // infrastructure
  compute: { label: "Compute", category: "infrastructure", of: ["Amazon EC2", "AWS Elastic Beanstalk", "Amazon ECS", "AWS Lambda", "Azure App Service"] },
  edge: { label: "Edge & DNS", category: "infrastructure", of: ["Amazon Route 53", "Elastic Load Balancing", "Amazon CloudFront"] },
  messaging: { label: "Messaging", category: "infrastructure", of: ["Amazon SNS", "Amazon SQS"] },
  access: { label: "Access control", category: "infrastructure", of: ["AWS IAM"] },
  aws: { label: "AWS", category: "infrastructure", of: ["AWS"] },
  azure: { label: "Azure", category: "infrastructure", of: ["Azure"] },
  // operations
  cloudwatch: { label: "CloudWatch", category: "operations", of: ["Amazon CloudWatch"] },
  // Dev, 2026-09-10: AI Foundry is Azure infrastructure the compute calls.
  ai: { label: "AI models", category: "infrastructure", caption: "Managed inference", of: ["Azure AI Foundry"] },
  datadog: { label: "Datadog", category: "operations", of: ["Datadog"] },
  monitoring: { label: "Monitoring", category: "operations", of: ["Datadog", "Amazon CloudWatch"] },
};

export const GENERIC_KIND: KindSpec = { label: "Component", category: "service", of: [] };

export const kindOf = (kind: string): KindSpec => KIND[kind] ?? GENERIC_KIND;

/** Category presentation — label + colour. The legend is generated from
 *  whichever of these a view actually contains. */
export const CATEGORY: Record<NodeCategory, { label: string; color: string }> = {
  client: { label: "Clients", color: "#7fbcff" },
  service: { label: "Services", color: "#a78bfa" },
  data: { label: "Data", color: "#4fd1a5" },
  boundary: { label: "Identity & external", color: "#ff7a45" },
  delivery: { label: "Delivery", color: "#e5c07b" },
  infrastructure: { label: "Infrastructure", color: "#5fd3f3" },
  operations: { label: "Operations", color: "#f472b6" },
};

/** Edge presentation — how each relationship is drawn. */
export const EDGE_STYLE: Record<EdgeType, { label: string; dash?: string; width: number; accent?: boolean }> = {
  api: { label: "Request / response", width: 1.1 },
  data: { label: "Reads / writes", width: 1.7 },
  event: { label: "Events", dash: "5 4", width: 1.1 },
  auth: { label: "Authentication", width: 1.1, accent: true },
  deploy: { label: "Pipeline step", width: 1.2 },
  telemetry: { label: "Telemetry", dash: "1.5 3.5", width: 1.2 },
  provision: { label: "Provisions", dash: "2 3", width: 1.1 },
  link: { label: "Link", width: 1 },
};
