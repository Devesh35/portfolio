import { resume as base } from "@/content/resume";
import type { VariantResume } from "@/content/resume-variants/ic";

/**
 * "Momo" variant (Dev, 2026-10-17): the public résumé re-weighted for a
 * backend-integrations role (Node.js / TypeScript, event-driven services,
 * AWS, third-party APIs). Same facts, same dates — only emphasis and order
 * change. Every bullet here maps to a highlight in content/projects.ts;
 * nothing is added that the site doesn't already claim. Deliberately absent
 * because the content has no evidence for them: DDD, serverless, Lambda.
 *
 *   node scripts/build-resume.mjs --variant momo
 */
export const suffix = "Momo";

type Resume = typeof base;

export function apply(resume: Resume): VariantResume {
  const majorProjects = resume.majorProjects.map((project) => {
    if (project.slug === "estateguru") {
      return {
        ...project,
        heading: "Estateguru — Lending Platform Backend, Integrations & Infrastructure (FinTech / Real Estate)",
        bullets: [
          "Phase 1: joined as a full-stack developer for the revamp of the legacy investor portal; Phase 2: rejoined as project lead of a six-person team — 4 developers (2 frontend, 2 backend) and 2 QA.",
          "Migrated the legacy backend to modular Node.js/Express services on MongoDB — one service per domain — designing the schemas and REST APIs for investor, loan and auto-invest data, and running the live PostgreSQL-to-MongoDB data migration.",
          "Decoupled slow work from the request path with Amazon SQS queues between the backend services, and SNS fan-out for cross-service notifications.",
          "Integrated external identity providers (Google, Meta, Apple) via OAuth 2.0 across web and mobile, and delivered role-based access control end to end — data model, APIs, UI, deployment and monitoring.",
          "Documented every REST API in Swagger/OpenAPI so web, mobile, backend and QA build against one contract; API-level integration tests across the investor, loan and auto-invest services.",
          "Raised automated test coverage on the investor app from ~40% to ~90% (Jest, node:test, Cypress), with end-to-end tests gating every release.",
          "Owned the AWS estate as code (Terraform: ECS, ELB, S3, CloudFront, Route 53, IAM), GitHub Actions CI/CD across dev/staging/prod with blue-green rollback, and Datadog/CloudWatch alerting.",
          "Also carried the frontend: Next.js and React Native in an Nx monorepo, sharing types and API clients with the backend.",
        ],
        stack: "Node.js, TypeScript, Express, MongoDB, Amazon SQS/SNS, AWS (ECS, S3, CloudFront, IAM), Terraform, Docker, GitHub Actions, OAuth 2.0, Swagger/OpenAPI, Jest, Cypress, Datadog",
      };
    }
    if (project.slug === "nextdecade") {
      return {
        ...project,
        heading: "NextDecade Observability Platform (AIOps) — Project Lead, backend & integrations",
        bullets: [
          "Led a five-person team — 4 developers (2 frontend, 2 backend) and 1 QA — on a 6-week fixed scope; owned system design, code review and delivery, mostly backend and DevOps work.",
          "Integrated 50+ external systems and the LNG plant's operational metrics into one log-analysis platform — understanding each system's data and APIs was most of the job.",
          "Wired GPT-5.4 through Azure AI Foundry to explain failures and suggest fixes from the ingested logs.",
          "Integrated single sign-on through Okta federated with Microsoft Entra ID, and governed privileged access with Entra PIM.",
          "Provisioned the Azure infrastructure with Terraform (App Service, Cosmos DB, Blob Storage); CI/CD in Azure DevOps.",
        ],
        stack: "Node.js, Express, MongoDB / Cosmos DB, Azure, Terraform, Azure AI Foundry (GPT-5.4), Okta, Microsoft Entra ID, React",
      };
    }
    if (project.slug === "modcart") {
      return {
        ...project,
        heading: "Modcart — Event-driven Analytics & Third-party Integrations (AdTech)",
        bullets: [
          "Joined as a full-stack developer, took on DevOps after 6 months; introduced Kafka event processing to decouple analytics ingestion from transactional workloads — ad interactions and campaign events as a stream, consumed by Node.js services with Redis caching for aggregation.",
          "Built a WebSocket real-time chat integrated with the Meta Business APIs (WhatsApp, Facebook, Instagram), so advertisers reach customers across channels from one inbox; integrated third-party tracking systems the same way.",
          "Integrated Razorpay for platform and service payments, plus Google and Meta social login and role-based access control.",
          "Designed the architecture and schemas for the embeddable single-page stores, cutting initial load from ~4s to under 1s.",
          "Defined dev, staging and production as code with CloudFormation (admin portal, user portal, analytics service, ad delivery service) and added blue-green deployment, cutting deploy downtime from ~1 minute to under 5 seconds.",
        ],
        stack: "Node.js, Express, Apache Kafka, Redis, MongoDB, WebSocket, Meta Business APIs, Razorpay, AWS, CloudFormation",
      };
    }
    return project;
  });

  // Datachamps and GOAPI dropped: least relevant to an integrations role, and
  // they pushed the document onto a third page.
  const additional = resume.additional.filter((i) => i.slug === "wellcompanion" || i.slug === "boongg").map((item) => {
    if (item.slug === "boongg") {
      return {
        ...item,
        text: "Live rental platform (client reports 1M+ rides). Cut booking search from ~6s to under 2s by reworking the slowest queries; booking events fanned out over SNS, with SQS for work that should not block a booking request.",
      };
    }
    if (item.slug === "wellcompanion") {
      return {
        ...item,
        text: "Health and fitness tracker for a Singapore-based company — captures daily activity and feeds it to an AI-analysis pipeline that surfaces personalised insights; built solo, BRD to deployment.",
      };
    }
    return item;
  });

  return {
    ...resume,
    header: {
      ...resume.header,
      line: resume.header.line.replace("Full Stack & DevOps Engineer", "Backend-focused Full Stack & DevOps Engineer"),
      stack: "Node.js | TypeScript | Event-driven services (SQS, SNS, Kafka) | AWS | MongoDB",
    },
    summary:
      "Backend-focused full stack and DevOps engineer based in Mumbai, India. Most of my five years went into Node.js/TypeScript services on AWS: splitting a legacy lending backend into domain services with SQS/SNS between them, a Kafka event pipeline for ad analytics, and integrations with external partners — payment providers, Meta's messaging APIs, identity providers, and 50+ operational systems feeding an observability platform. I stay responsible for what I build once it is live — infrastructure, pipelines and alerting included.",
    skills: [
      { label: "Backend", items: "Node.js, TypeScript, Express.js, REST API design, Swagger / OpenAPI, WebSocket, modular / domain-split services" },
      { label: "Events & Messaging", items: "Amazon SQS, Amazon SNS, Apache Kafka, Redis" },
      { label: "Cloud", items: "AWS (ECS, S3, CloudFront, Route 53, ELB, IAM, CloudWatch), Azure (App Service, Cosmos DB, Blob Storage)" },
      { label: "Integrations", items: "Razorpay, Meta Business APIs (WhatsApp, Facebook, Instagram), Google / Meta / Apple sign-in, Okta + Microsoft Entra ID, Google Maps, Azure AI Foundry" },
      { label: "Infrastructure", items: "Terraform, CloudFormation, Docker, Docker Compose, Nx Monorepo" },
      { label: "CI/CD & Monitoring", items: "GitHub Actions, Azure DevOps, multi-environment pipelines, Blue-Green Deployment, Datadog, CloudWatch" },
      { label: "Databases", items: "MongoDB, PostgreSQL, Redis" },
      { label: "Testing", items: "Jest, node:test, Cypress, API integration tests" },
      { label: "Frontend & Mobile", items: "Next.js, React, React Native" },
    ],
    majorProjects,
    additional,
  };
}
