import { periodFor } from "@/content/timeline";
import { profile } from "@/content/profile";
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
 */

export interface ResumeProject {
  /** Slug in content/projects.ts — the source of this entry's dates. */
  slug: string;
  heading: string;
  url?: string;
  context: string;
  stack: string;
  bullets: string[];
}

export interface ResumeRole {
  company: string;
  title: string;
  period: string;
  summary?: string;
  bullets?: string[];
  projects: ResumeProject[];
}

export const resume = {
  header: {
    name: profile.name,
    line: `${profile.location} | ${profile.title} | Nearly 5 Years Experience`,
    stack: "Next.js | Node.js | MongoDB | CI/CD | AWS",
    contact: [
      { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
      { label: "Phone", value: "+91-7875177354" },
      { label: "LinkedIn", value: "linkedin.com/in/devesh-singh-769249129", href: profile.links.linkedin },
      { label: "Portfolio", value: site.url.replace(/^https?:\/\//, ""), href: site.url },
    ],
  },

  summary:
    "Full Stack & DevOps Engineer with nearly 5 years building web and mobile products end-to-end (Next.js / React Native, Node.js / Express, MongoDB) and the Docker, Terraform, and CI/CD pipelines that ship them on AWS and Azure. Revamped the web and mobile platform of a European property-lending marketplace (€951M+ in loans) and raised automated test coverage to ~90% on targeted modules; senior developer on an AI-assisted observability platform.",

  soloProject: {
    url: profile.links.devtools,
    text: "an interactive developer-infrastructure simulator with a live Git visualizer (merge, rebase, cherry-pick on a modelled commit graph).",
  },

  skills: [
    { label: "Frontend & Mobile", items: "Next.js, React.js, React Native, TypeScript, Android (Java, Kotlin)" },
    { label: "Backend", items: "Node.js, Express.js, RESTful API Design, WebSocket, Apache Kafka" },
    { label: "Databases & Caching", items: "MongoDB, PostgreSQL, Redis" },
    { label: "Cloud & Infrastructure", items: "AWS (EC2, S3, RDS, IAM, CloudWatch, Lambda), Azure, Docker, Terraform, CloudFormation, Nx Monorepo" },
    { label: "CI/CD & Monitoring", items: "GitHub Actions, Docker-based multi-environment pipelines, Blue-Green Deployment, Datadog, CloudWatch" },
    { label: "Testing", items: "Jest, Cypress" },
    { label: "Integrations", items: "Razorpay, Google Maps, Meta Business APIs (WhatsApp, Facebook, Instagram)" },
  ],

  roles: [
    {
      company: "Nirmitee.io",
      title: "Software Development Engineer II (SDE 2)",
      period: "Apr 2024 – Present",
      summary:
        "Promoted from Software Engineer. Own full-stack and DevOps delivery for client platforms, from requirements and system design through deployment and monitoring, working with product, design, and QA.",
      projects: [
        {
          slug: "estateguru",
          heading: "Estateguru — Full Stack Web & Mobile Revamp (FinTech / Real Estate)",
          url: "https://estateguru.co",
          context:
            "European property-lending platform with 159K+ investors and €951M+ in loans facilitated across 8 countries. Started in the Software Engineer role, continued as SDE 2.",
          stack:
            "Next.js, TypeScript, React Native, Node.js, Express, MongoDB, AWS, Terraform, Docker, GitHub Actions, Nx Monorepo, Jest, Cypress, Datadog",
          bullets: [
            "Revamped the legacy frontend to Next.js and TypeScript inside an Nx monorepo, rebuilding the investor dashboard, loan listings, and auto-invest flows across the web app and React Native mobile app with shared libraries, types, API clients, and business logic.",
            "Migrated the backend to Node.js/Express modular services on MongoDB, designing the schemas and REST APIs for investor, loan, and auto-invest data and migrating production data from PostgreSQL.",
            "Delivered role-based access control end to end: requirements, data model, APIs, UI, deployment, and monitoring.",
            "Containerised the application with Docker, built CI/CD pipelines in GitHub Actions, provisioned AWS infrastructure with Terraform for development, staging, and production, and set up Datadog monitoring and alerting with fast rollback for a regulated FinTech platform.",
            "Increased automated test coverage to ~90% for targeted application modules using Jest and Cypress.",
          ],
        },
        {
          slug: "nextdecade",
          heading: "NextDecade Observability Platform (AIOps) — Senior Developer",
          context:
            "Part of a larger programme to fully automate operations for a sustainable-energy solutions company.",
          stack: "React, Node.js, Express, MongoDB, CI/CD, Terraform, Azure, Azure AI Foundry (GPT-5.4)",
          bullets: [
            "Senior developer on a 5-person team (3 developers, 1 QA): owned system design, code review, and delivery.",
            "Built an AI-assisted log analysis and monitoring platform that surfaces issues and suggested fixes from application logs, integrating logs and metrics from multiple sources via their APIs.",
            "Used GPT-5.4 through Azure AI Foundry to analyse logs across the stages of the process lifecycle, producing explanations and suggested fixes so teams could understand and resolve issues faster.",
            "Provisioned Azure infrastructure with Terraform and set up CI/CD pipelines for the MERN stack.",
          ],
        },
      ],
    },
    {
      company: "Nirmitee.io",
      title: "Software Engineer (Consultant Graduate)",
      period: "Nov 2021 – Apr 2024",
      bullets: [
        "Delivered production web applications with React, Node.js/Express, and AWS for financial analysis (Datachamps, PostgreSQL), practice management (Bestosys), and mobility (Boongg); see Additional Projects.",
        "Began the Estateguru revamp in this role and carried it through as SDE 2 (entry above).",
        "Earned Employee of the Month recognition for consistent delivery and client satisfaction.",
      ],
      projects: [
        {
          slug: "modcart",
          heading: "Modcart — Advertising Platform with Real-time Analytics (AdTech)",
          url: "https://modcart.io",
          context:
            "One-stop platform for ads and single-page stores that embed into websites and mobile apps; the platform has since moved to a coupon-based model.",
          stack: "React.js, Node.js, Express, MongoDB, Redis, Apache Kafka, WebSocket, AWS, CloudFormation",
          bullets: [
            "Designed the architecture and database schemas for user-interactive single-page stores, and built them with responsive layouts across mobile, tablet, and desktop so advertisers could reuse one creative across placements.",
            "Built role-based access control, payment integration, and analytics on ad interactions and campaign performance.",
            "Introduced Kafka event processing for ad-campaign analytics, decoupling ingestion from transactional workloads, with Redis caching for fast aggregation and reporting.",
            "Built a WebSocket-based real-time chat with Meta integration (WhatsApp, Facebook, Instagram) so advertisers could reach customers across channels from one inbox.",
            "Defined dev, staging, and production environments as code with CloudFormation on AWS and added blue-green deployment, cutting deployment downtime from ~8 minutes to 10–15 seconds.",
          ],
        },
      ],
    },
  ] satisfies ResumeRole[],

  additional: [
    {
      slug: "boongg",
      name: "Boongg",
      domain: "Mobility",
      url: "https://boongg.com",
      text: "Bike-rental platform (1M+ rides, 200K+ customers, 1,500+ bikes). Improved booking, availability, and analytics features for customers and admins; integrated Razorpay payments and Google Maps for live bike location, pickup, and booking flows. React.js web, Android (Java/Kotlin), Node.js/Express on MongoDB, deployed on AWS.",
    },
    {
      slug: "bestosys",
      name: "Bestosys",
      domain: "HealthTech",
      text: "Dental practice-management software letting doctors manage patient records, appointment scheduling, prescriptions, reports, and patient communication in one platform.",
    },
    {
      slug: "datachamps",
      name: "Datachamps",
      domain: "FinTech",
      text: "Financial-analysis tool on PostgreSQL that lets analysts explore data through dashboards, with a desktop companion app and automated report generation that replaced manual reporting.",
    },
    {
      slug: "devtools",
      name: "DevTools",
      domain: "Personal",
      url: profile.links.devtools,
      text: "Built an interactive developer-tools project featuring a Git visualizer that simulates commit graphs and operations such as merge, rebase, and cherry-pick.",
    },
  ],

  education: {
    degree: "Bachelor of Engineering",
    school: "Datta Meghe College of Engineering",
    period: profile.education.period,
    line: `${profile.education.university} | ${profile.education.place}, India`,
    result: `CGPA: ${profile.education.result.replace(/^CGPA\s*/i, "")}`,
  },
} as const;

/** Every project period on the résumé, resolved from the timeline. */
export const resumePeriod = (slug: string) => periodFor(slug);
