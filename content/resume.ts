import { periodFor } from "@/content/timeline";
import { profile } from "@/content/profile";
import { experienceLabel } from "@/lib/experience";
import { site } from "@/content/site";

/**
 * The résumé document, transcribed verbatim from Devesh_Singh_Resume.pdf.
 *
 * This is deliberately NOT the site's project copy. The résumé is its own
 * document with its own editorial voice, and Dev wants that text preserved
 * exactly. Only two things are changed here:
 *
 *   1. Dates — every period is `periodFor(slug)`, so the résumé and the site's
 *      timeline can never disagree about when something happened.
 *   2. Colours — applied in scripts/build-resume.mjs, not in this file.
 *
 * The trade-off: prose here can drift from content/projects.ts, because they
 * are no longer the same words. Dates cannot.
 *
 * COMPANY GROUPING (2026-09-01, Dev): every role below is at one company,
 * Nirmitee.io — a software consultancy. `company` holds the header/blurb
 * shown once above the positions.
 *
 * LAYOUT (2026-09-01, Dev — second pass): Professional Experience now reads
 * company info, then BOTH positions back to back (`positions` — title,
 * period, one plain sentence each, no numbers or tech), then a "Major
 * Projects" block listing Estateguru, NextDecade and Modcart in one flat
 * list (`majorProjects`) — projects are no longer nested under whichever
 * position they happened during. `resume.additional` stays a separate,
 * one-line-each list further down. See app/about/page.tsx for how the site
 * re-derives the old per-role project grouping from `majorProjects` by
 * cross-referencing content/experience.ts's `role.projects` — that page
 * still shows projects nested under their role, only the résumé's own
 * layout changed.
 */

export interface ResumeProject {
  /** Slug in content/projects.ts — the source of this entry's dates. */
  slug: string;
  heading: string;
  url?: string;
  context: string;
  bullets: string[];
  /** Last point in the project description — tech not already named in the bullets above. */
  stack: string;
}

export interface ResumePosition {
  title: string;
  period: string;
  /** One plain sentence — no numbers, no named tech (Dev, 2026-09-01). */
  summary: string;
}

export const resume = {
  header: {
    name: profile.name,
    line: `${profile.location} | ${profile.title} | ${experienceLabel()} Experience`,
    stack: "Next.js | Node.js | MongoDB | CI/CD | AWS",
    contact: [
      { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
      { label: "Phone", value: profile.phone },
      { label: "LinkedIn", value: "linkedin.com/in/devesh-singh-769249129", href: profile.links.linkedin },
      { label: "Portfolio", value: site.url.replace(/^https?:\/\//, ""), href: site.url },
    ],
  },

  // 3 sentences, no numbers — who Dev is, not a metrics recap (Dev, 2026-09-01).
  summary:
    "Full Stack & DevOps Engineer based in Pune, India. I take products from requirements and system design through to production, and stay responsible for them once they're live — the infrastructure side is as much my job as the application code. Currently leading the next phase of a European property-lending platform, after most recently leading a fixed-scope AI-assisted observability build.",

  soloProject: {
    url: profile.links.devtools,
    text: "an interactive developer-infrastructure simulator with a live Git visualizer (merge, rebase, cherry-pick on a modelled commit graph).",
  },

  /** Shown once above the positions below — every position here is at this one company. */
  company: {
    name: "Nirmitee.io",
    period: "Nov 2021 – Present",
    blurb:
      "Nirmitee.io is a software consultancy — every engagement below is a client project delivered as a Nirmitee employee.",
  },

  skills: [
    { label: "Frontend & Mobile", items: "Next.js, React.js, React Native, TypeScript, Android (Java, Kotlin)" },
    { label: "Backend", items: "Node.js, Express.js, RESTful API Design, WebSocket, Apache Kafka, SSO / OAuth 2.0" },
    { label: "Databases & Caching", items: "MongoDB, PostgreSQL, Redis" },
    { label: "Cloud", items: "AWS, Azure" },
    { label: "Infrastructure", items: "Docker, Docker Compose, Terraform, CloudFormation, Nx Monorepo" },
    { label: "CI/CD & Monitoring", items: "GitHub Actions, Docker-based multi-environment pipelines, Blue-Green Deployment, Datadog, CloudWatch" },
    { label: "Testing", items: "Jest, Cypress" },
    { label: "Integrations", items: "Razorpay, Google Maps, Meta Business APIs (WhatsApp, Facebook, Instagram)" },
  ],

  positions: [
    {
      title: "Software Development Engineer II (SDE 2)",
      period: "Apr 2024 – Present",
      summary:
        "Promoted from Software Engineer; I own full-stack and DevOps delivery for client platforms end to end, from system design through to production.",
    },
    {
      title: "Software Engineer (Consultant Graduate)",
      period: "Nov 2021 – Apr 2024",
      summary:
        "Delivered production web and mobile applications for multiple clients, and began the Estateguru engagement that I carried through as SDE 2.",
    },
  ] satisfies ResumePosition[],

  majorProjects: [
    {
      slug: "estateguru",
      heading: "Estateguru — Full Stack Web & Mobile Revamp (FinTech / Real Estate)",
      url: "https://estateguru.co",
      context:
        "European property-lending platform operating across 8 countries. Phase 1 (Jun 2023 – Jun 2025) rebuilt the investor-facing web and mobile apps; Phase 2 (from Nov 2025) is new scope — the borrower-facing app.",
      bullets: [
        "Phase 1: joined as a full-stack developer for the revamp of the legacy investor portal.",
        "Phase 2: rejoined as project lead, leading a team of 4 developers and 2 QA.",
        "Revamped the legacy frontend to Next.js and TypeScript inside an Nx monorepo, rebuilding the investor dashboard, loan listings and auto-invest flows across the web app and React Native mobile app, with shared libraries, types and API clients.",
        "Migrated the backend to Node.js/Express modular services on MongoDB, designing the schemas and REST APIs for investor, loan and auto-invest data.",
        "Raised automated test coverage on the investor app from ~40% on the old platform to ~90% on the new one, using Jest and Cypress.",
        "Delivered role-based access control and social login end to end, and documented the APIs in Swagger so web, mobile and backend build against one contract.",
        "Owned the CI/CD pipeline and Datadog alerting that keep the platform running, provisioned with Docker and Terraform across development, staging and production.",
      ],
      stack: "Next.js, Node.js, MongoDB, AWS, CI/CD, Terraform, Docker, Nx, SSO / OAuth 2.0, Jest, Cypress, Datadog",
    },
    {
      slug: "nextdecade",
      heading: "NextDecade Observability Platform (AIOps) — Project Lead",
      context:
        "AI-assisted log analysis and monitoring platform for a sustainable-energy company, part of a larger operations-automation programme. Fixed-scope engagement, 6 weeks.",
      bullets: [
        "Joined as project lead over a team of 4 developers and 1 QA — mostly backend and DevOps work, owning system design, code review and delivery.",
        "Built the AI-assisted log analysis platform end to end: ingested logs and metrics from multiple sources, and wired GPT-5.4 through Azure AI Foundry to explain failures and suggest fixes.",
        "Provisioned the Azure infrastructure with Terraform — App Service, Cosmos DB and Blob Storage — and set up CI/CD out of Azure Repos and Azure DevOps.",
        "Integrated single sign-on through Okta federated with Microsoft Entra ID, and governed privileged access with Microsoft Entra PIM.",
      ],
      stack: "React, Node.js, Express, MongoDB, CI/CD, Terraform, Azure, Azure AI Foundry (GPT-5.4), SSO / OAuth 2.0",
    },
    {
      slug: "modcart",
      heading: "Modcart — Advertising Platform with Real-time Analytics (AdTech)",
      url: "https://modcart.io",
      context:
        "Advertising platform with embeddable single-page stores and real-time campaign analytics; the platform has since moved to a coupon-based model.",
      bullets: [
        "Joined as a full-stack developer and took on DevOps after 6 months.",
        "Owned the architecture and schemas for the single-page stores, and cut initial load from ~4s to under 1s.",
        "Built role-based access control, social login, Razorpay payments, and Kafka-backed real-time analytics with Redis caching.",
        "Built a WebSocket-based real-time chat with Meta integrations (WhatsApp, Facebook, Instagram).",
        "Automated the deployment process and defined every environment as code with CloudFormation, adding blue-green deployment that cut downtime from ~1 minute to under 5 seconds.",
      ],
      stack: "React.js, Node.js, Express, MongoDB, Redis, Apache Kafka, SSO / OAuth 2.0, AWS, CloudFormation",
    },
  ] satisfies ResumeProject[],

  additionalIntro:
    "Other Nirmitee.io client engagements — check my portfolio for more details.",

  additional: [
    {
      slug: "wellcompanion",
      name: "WellCompanion",
      domain: "Health & Fitness",
      text: "Health and fitness tracker that captures daily activity and applies AI analysis to surface personalised insights and trends — built solo, BRD to deployment.",
    },
    {
      slug: "boongg",
      name: "Boongg",
      domain: "Mobility",
      url: "https://boongg.com",
      text: "Replaced Boongg’s slowest booking queries with reworked, optimised versions because they were the platform’s main latency bottleneck, cutting search time from ~6s to under 2s across 1M+ rides.",
    },
    {
      slug: "datachamps",
      name: "Datachamps",
      domain: "FinTech",
      text: "Replaced Datachamps’ manual Power BI report generation with a Selenium-automated pipeline on AWS, eliminating a recurring manual step in the team’s financial reporting.",
    },
    {
      slug: "goapi",
      name: "GOAPI",
      domain: "Sports Management",
      text: "Sports-management platform connecting children, parents, coaches, managers and club owners with role-based access to schedules and activity tracking — built solo, concept to release.",
    },
  ],

  education: {
    degree: "Bachelor of Engineering",
    school: profile.education.school,
    period: profile.education.period,
    line: `${profile.education.university} | ${profile.education.place}, India`,
    result: `CGPA: ${profile.education.result.replace(/^CGPA\s*/i, "")}`,
  },
} as const;

/** Every project period on the résumé, resolved from the timeline. A
 *  multi-phase range ("Jun 2023 – Jun 2025 · Nov 2025 – Present") collapses to
 *  its overall span ("Jun 2023 – Present") — ATS date parsers expect one range
 *  per entry, and the phase dates stay spelled out in the project's context. */
export const resumePeriod = (slug: string) => {
  const full = periodFor(slug);
  if (!full.includes("·")) return full;
  const parts = full.split(" – ");
  return `${parts[0]} – ${parts[parts.length - 1]}`;
};
