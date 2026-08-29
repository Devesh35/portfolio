/**
 * Single source of truth for every project shown on the site.
 * Nothing here is hand-repeated in a component — pages read from this file.
 *
 * Sources: Devesh_Singh_Resume.pdf is canonical and wins on every point it
 * covers. The three older resumes are mined only for what it omits. Where they
 * disagree (Estateguru on PostgreSQL, the old fsdt-fe.vercel.app URL), the
 * canonical file is right and the older text is discarded.
 *
 * `metrics` are PLATFORM SCALE — the client's business, not Dev's achievement.
 * They belong on a project page as context and must never be presented as his
 * numbers. What Dev did is `contribution`, `highlights` and `ownership`.
 *
 * `image.kind` keeps the imagery honest:
 *   'placeholder' — generated card, no real asset yet
 *   'marketing'   — the client's public homepage, NOT the screens Dev built
 *   'own'         — Dev's own product, or a screen he actually built
 */

import { periodFor } from "@/content/timeline";

export type ImageKind = "placeholder" | "cover" | "marketing" | "own";

/** Which parts of the lifecycle Dev personally owned on a project. */
export type Phase = "design" | "lead" | "build" | "test" | "ship" | "operate";

export const PHASE_LABEL: Record<Phase, string> = {
  design: "Designed",
  lead: "Led",
  build: "Built",
  test: "Tested",
  ship: "Shipped",
  operate: "Operated",
};

export interface Project {
  slug: string;
  name: string;
  domain: string;
  role: string;
  /** Derived from content/timeline.ts — never typed here, so dates cannot drift. */
  period: string;
  url: string | null;
  /** One line. What the product is. */
  summary: string;
  /** What Dev personally built — scoped, defensible in an interview. */
  contribution: string;
  /** Lifecycle phases he owned. Order is fixed by PHASE_ORDER, not by this array. */
  ownership: Phase[];
  /** PLATFORM scale — the client's numbers, always attributed. Never Dev's metrics. */
  metrics: { label: string; value: string; source?: string }[];
  /** Every non-contradicting point from all four resumes. No cap. */
  highlights: string[];
  stack: string[];
  image: { src: string; kind: ImageKind; alt: string; note?: string };
  /** What each tool actually did here — rendered on the project page and
   *  surfaced by the skills explorer. Names use the stack's exact spelling. */
  skillsUsed?: { name: string; how: string }[];
  featured: boolean;
}

export const PHASE_ORDER: Phase[] = ["design", "lead", "build", "test", "ship", "operate"];

export const sortPhases = (phases: Phase[]) =>
  PHASE_ORDER.filter((phase) => phases.includes(phase));

export const projects: Project[] = [
  {
    slug: "estateguru",
    name: "Estateguru",
    domain: "FinTech · Real Estate",
    role: "Full Stack Developer → SDE 2",
    period: periodFor("estateguru"),
    url: "https://estateguru.co",
    summary:
      "European property-lending marketplace connecting investors with secured real-estate loans across 8 countries.",
    contribution:
      "Revamped the investor-facing web and mobile apps end to end: rebuilt the dashboard, loan listings and auto-invest flows in Next.js and React Native inside an Nx monorepo, migrated backend services to Node.js on MongoDB including the production data migration off PostgreSQL, and owned the Docker, Terraform and GitHub Actions pipeline plus the Datadog alerting that keeps it running.",
    ownership: ["design", "build", "test", "ship", "operate"],
    metrics: [
      { label: "investors", value: "160,000+", source: "estateguru.co" },
      { label: "loans facilitated", value: "€951M+", source: "estateguru.co" },
      { label: "countries", value: "8", source: "estateguru.co" },
    ],
    highlights: [
      "Revamped an outdated web application to Next.js and TypeScript, and the mobile app to React Native with TypeScript.",
      "Rebuilt the investor dashboard, loan listings and auto-invest flows across web and mobile, sharing common libraries, types, API clients and business logic through an Nx monorepo.",
      "Implemented modern UI frameworks within the Nx monorepo to improve functionality and user experience.",
      "Migrated the backend to Node.js/Express modular services on MongoDB, designing the schemas and REST APIs for investor, loan and auto-invest data.",
      "Migrated production data from PostgreSQL to MongoDB.",
      "Delivered role-based access control end to end: requirements, data model, APIs, UI, deployment and monitoring.",
      "Containerised frontend and backend applications with Docker, ensuring consistency across environments.",
      "Designed and implemented CI/CD pipelines in GitHub Actions to automate build, testing and deployment across development, staging and production.",
      "Provisioned and managed AWS infrastructure as code with Terraform.",
      "Set up Datadog and CloudWatch monitoring and alerting with fast rollback, as required for a regulated FinTech platform.",
      "Increased automated test coverage to roughly 90% on targeted application modules using Jest and Cypress.",
      "Added end-to-end tests that catch regressions in investor and loan flows before release.",
      "The overhaul streamlined the development process and measurably improved team productivity.",
      "The uniform deployment approach enabled seamless integration and scalability for future expansion.",
    ],
    stack: [
      "Next.js", "React Native", "TypeScript", "Node.js", "Express", "MongoDB",
      "PostgreSQL", "AWS", "Terraform", "Docker", "GitHub Actions", "Nx", "Jest", "Cypress", "Datadog",
    ],
    skillsUsed: [
      { name: "Next.js", how: "The rebuilt investor dashboard, loan listings and auto-invest flows — the legacy web frontend replaced outright." },
      { name: "React Native", how: "The revamped mobile app, sharing libraries, types and API clients with the web app." },
      { name: "TypeScript", how: "One type system across web, mobile and the API clients, enforced by the monorepo." },
      { name: "Nx", how: "Monorepo boundaries that let web and mobile share business logic instead of copying it." },
      { name: "Node.js", how: "The modular backend services the legacy backend was migrated to." },
      { name: "Express", how: "REST APIs for investor, loan and auto-invest data." },
      { name: "MongoDB", how: "The target datastore — schema design plus the live production migration onto it." },
      { name: "PostgreSQL", how: "The system of record being migrated off, kept serving until cutover." },
      { name: "Docker", how: "Frontend and backend containerised so every environment runs the same build." },
      { name: "GitHub Actions", how: "Build, test and deploy pipelines across development, staging and production." },
      { name: "Terraform", how: "All AWS infrastructure provisioned as code." },
      { name: "AWS", how: "Hosts the platform across the three environments." },
      { name: "Jest", how: "Unit coverage raised to roughly 90% on targeted modules." },
      { name: "Cypress", how: "End-to-end tests that catch investor- and loan-flow regressions before release." },
      { name: "Datadog", how: "Monitoring and alerting, with the fast rollback path a regulated platform needs." },
    ],
    image: {
      src: "/projects/estateguru.png",
      kind: "cover",
      alt: "Estateguru — stylized cover art",
      note: "The screens Dev built sit behind an investor login. A homepage screenshot would show marketing pages he did not design — prefer a redacted dashboard capture.",
    },
    featured: true,
  },

  {
    slug: "nextdecade",
    name: "NextDecade Observability",
    domain: "AIOps",
    role: "Senior Developer",
    period: periodFor("nextdecade"),
    url: null,
    summary:
      "AI-assisted log analysis and monitoring platform for a sustainable-energy company, part of a wider operations-automation programme.",
    contribution:
      "Senior developer on a five-person team. Owned system design, code review and delivery; built the log ingestion and analysis platform, wired GPT-5.4 through Azure AI Foundry to explain failures, and provisioned the Azure infrastructure with Terraform.",
    ownership: ["design", "lead", "build", "ship", "operate"],
    metrics: [],
    highlights: [
      "Senior developer on a five-person team — owned system design, code review and delivery.",
      "Built an AI-assisted log analysis and monitoring platform that surfaces issues and suggested fixes directly from application logs.",
      "Integrated logs and metrics from multiple sources through their APIs into one view.",
      "Used GPT-5.4 through Azure AI Foundry to analyse logs across the stages of the process lifecycle, producing plain explanations and suggested fixes so teams resolve incidents faster.",
      "Provisioned Azure infrastructure with Terraform.",
      "Set up CI/CD pipelines for the MERN stack.",
      "Delivered as part of a larger programme to fully automate operations for a sustainable-energy solutions company.",
    ],
    stack: ["React", "Node.js", "Express", "MongoDB", "Azure", "Azure AI Foundry", "GPT-5.4", "Terraform", "CI/CD"],
    skillsUsed: [
      { name: "React", how: "The analysis and monitoring UI where teams read findings and suggested fixes." },
      { name: "Node.js", how: "Services that pull logs and metrics from multiple sources through their APIs." },
      { name: "Express", how: "The platform's own APIs over the ingested data." },
      { name: "MongoDB", how: "Stores the ingested logs, metrics and generated analyses." },
      { name: "Azure AI Foundry", how: "Hosts the model behind the log analysis." },
      { name: "GPT-5.4", how: "Analyses logs across the process lifecycle, producing explanations and suggested fixes." },
      { name: "Terraform", how: "Azure infrastructure provisioned as code." },
      { name: "CI/CD", how: "Pipelines for the MERN stack, built as part of the engagement." },
      { name: "Azure", how: "Where the platform runs." },
    ],
    image: {
      src: "/projects/nextdecade.png",
      kind: "cover",
      alt: "NextDecade Observability — stylized cover art",
      note: "Internal platform, no public URL. Best replacement is an anonymised UI capture.",
    },
    featured: true,
  },

  {
    slug: "modcart",
    name: "Modcart",
    domain: "AdTech",
    role: "Full Stack Developer",
    period: periodFor("modcart"),
    url: "https://modcart.io",
    summary:
      "Advertising platform with embeddable single-page stores and real-time campaign analytics.",
    contribution:
      "Led the platform's major enhancement work: designed the architecture and schemas for the interactive single-page stores, built access control, payments and Kafka-backed analytics, added a WebSocket inbox with Meta integrations, and defined every environment as code with CloudFormation — including the blue-green cutover that took deployment downtime from about eight minutes to fifteen seconds.",
    ownership: ["design", "build", "ship", "operate"],
    metrics: [],
    highlights: [
      "Led significant enhancements to the advertising platform to boost user engagement and extend functionality.",
      "Designed the architecture and database schemas for user-interactive single-page stores.",
      "Built responsive single-page ad units that adapt across mobile, tablet and desktop, reaching 98% screen compatibility and letting advertisers reuse one creative across placements.",
      "Integrated robust user access management and payment systems using Node.js, Redis and MongoDB.",
      "Built role-based access control, payment integration, and analytics on ad interactions and campaign performance.",
      "Developed dashboard analytics and ad interaction reports using Kafka, Redis and Node.js for real-time data processing and detailed decision-making insight.",
      "Introduced Kafka event processing to decouple analytics ingestion from transactional workloads, with Redis caching for fast aggregation and reporting.",
      "Implemented WebSocket communication and third-party tracking systems for real-time interaction with third-party social apps.",
      "Built a WebSocket real-time chat with Meta integration — WhatsApp, Facebook and Instagram — so advertisers could reach customers across channels from a single inbox.",
      "Defined dev, staging and production environments as code with CloudFormation, covering the admin portal, user portal, analytics service and ad delivery service.",
      "Added blue-green deployment, cutting deployment downtime from roughly 8 minutes to 10–15 seconds.",
      "Implemented CI/CD pipelines and Docker-based deployment strategies for consistent releases.",
      "Supported the entire infrastructure with AWS and Docker for scalable, secure deployment.",
    ],
    stack: [
      "React", "Node.js", "Express", "MongoDB", "Redis", "Apache Kafka",
      "WebSocket", "AWS", "CloudFormation", "Docker",
    ],
    skillsUsed: [
      { name: "React", how: "Single-page stores that embed into websites and apps, responsive across placements." },
      { name: "Node.js", how: "The platform services behind stores, campaigns and analytics." },
      { name: "Express", how: "REST APIs, including role-based access control." },
      { name: "MongoDB", how: "Primary datastore for stores, campaigns and interactions." },
      { name: "Apache Kafka", how: "Ad-campaign analytics as an event stream, decoupled from the transactional path." },
      { name: "Redis", how: "Caching that keeps aggregation and reporting fast." },
      { name: "WebSocket", how: "The real-time chat between advertisers and customers." },
      { name: "Docker", how: "Containerised services across environments." },
      { name: "CloudFormation", how: "Dev, staging and production defined as code." },
      { name: "AWS", how: "Hosting — with blue-green cutovers that took deploy downtime from ~8 minutes to 10–15 seconds." },
    ],
    image: {
      src: "/projects/modcart.png",
      kind: "cover",
      alt: "Modcart — stylized cover art",
      note: "modcart.io now runs an AI coupon platform — a product that postdates this work. Its homepage is actively misleading as a case-study image.",
    },
    featured: true,
  },

  {
    slug: "boongg",
    name: "Boongg",
    domain: "Mobility",
    role: "Full Stack Developer",
    period: periodFor("boongg"),
    url: "https://boongg.com",
    summary:
      "Two-wheeler rental platform operating across Pune, with customer web and Android apps and an operations admin panel.",
    contribution:
      "Built the React web app and the Java/Kotlin Android app against a Node.js/Express backend on MongoDB: booking, availability and analytics for customers and admins, Razorpay payments, Google Maps for live vehicle location, and the admin panel operations staff use to manage fleet and pricing.",
    ownership: ["build", "ship"],
    metrics: [
      { label: "rides completed", value: "1,000,000+", source: "boongg.com" },
      { label: "customers", value: "200,000+", source: "boongg.com" },
      { label: "vehicles in the fleet", value: "1,500+", source: "boongg.com" },
    ],
    highlights: [
      "Built the web app in React.js and the Android app in Java/Kotlin, against a Node.js/Express backend.",
      "Improved booking, availability and analytics features for both customers and admins.",
      "Integrated Razorpay payments and Google Maps for live bike location, pickup and booking flows.",
      "Built user and bike management across the customer and operations apps.",
      "Built booking, availability and analytics on a MongoDB data layer supporting hourly, daily and monthly rental models with zero-deposit checkout.",
      "Deployed the backend on AWS with automated builds.",
      "Built an admin panel letting staff manage bikes, bookings and pricing across outlets.",
    ],
    stack: [
      "React", "React Native", "Android (Java, Kotlin)", "Node.js", "Express",
      "MongoDB", "AWS", "Razorpay", "Google Maps",
    ],
    skillsUsed: [
      { name: "React", how: "Customer-facing web features for booking and availability." },
      { name: "React Native", how: "Cross-platform pieces shared with the customer app work." },
      { name: "Android (Java, Kotlin)", how: "The native customer app improvements." },
      { name: "Node.js", how: "Backend feature work on booking, availability and analytics." },
      { name: "Express", how: "The APIs behind those features." },
      { name: "MongoDB", how: "The platform's datastore." },
      { name: "Razorpay", how: "Payment integration for bookings." },
      { name: "Google Maps", how: "Live bike location, pickup and booking flows." },
      { name: "AWS", how: "Where the platform is deployed." },
    ],
    image: {
      src: "/projects/boongg.png",
      kind: "cover",
      alt: "Boongg — stylized cover art",
      note: "Improvement engagement — scope the caption so it doesn't imply he built the whole platform.",
    },
    featured: true,
  },

  {
    slug: "goapi",
    name: "GOAPI",
    domain: "Sports Management",
    role: "Backend Developer",
    period: periodFor("goapi"),
    url: null,
    summary:
      "Sports-management platform connecting children, parents, coaches, managers and club owners, with role-based access to schedules, teams and activity tracking.",
    contribution:
      "Architected and implemented the entire backend: designed the PostgreSQL schema from the requirements specification, built the Node.js services with Redis caching, containerised everything with Docker and deployed on AWS.",
    ownership: ["design", "build", "ship"],
    metrics: [],
    highlights: [
      "Architected and implemented the backend for a sports management app supporting six distinct user roles — child, parent, coach, manager, owner and admin.",
      "Created the database schema from the Requirements Specification, using PostgreSQL.",
      "Used Node.js for the runtime environment and Redis for caching to improve system performance and scalability.",
      "Containerised the entire backend infrastructure with Docker to streamline development and ensure consistent deployments.",
      "Deployed the system on AWS for high availability and reliable user interactions.",
      "Designed the architecture to manage complex access levels and provide a scalable foundation for future enhancements.",
      "Gave each role scoped access to schedules, teams and activity tracking.",
    ],
    stack: ["Node.js", "Express", "PostgreSQL", "Redis", "Docker", "AWS"],
    skillsUsed: [
      { name: "Node.js", how: "The entire backend — architected and implemented from the requirements spec." },
      { name: "Express", how: "REST APIs with role-based access for children, parents, coaches, managers and club owners." },
      { name: "PostgreSQL", how: "Schema designed from the requirements specification." },
      { name: "Redis", how: "Caching on the hot read paths." },
      { name: "Docker", how: "Everything containerised." },
      { name: "AWS", how: "Deployment target." },
    ],
    image: { src: "/projects/goapi.png", kind: "cover", alt: "GOAPI — stylized cover art" },
    featured: false,
  },

  {
    slug: "wellcompanion",
    name: "WellCompanion",
    domain: "Health & Fitness",
    role: "Developer",
    period: periodFor("wellcompanion"),
    url: null,
    summary:
      "Health and fitness tracker that captures user activity and applies AI analysis to surface personalised insights and trends.",
    contribution:
      "Built activity capture and the analysis layer that turns raw tracking data into personalised insight for the user.",
    ownership: ["build"],
    metrics: [],
    highlights: [
      "Captures user activity across health and fitness tracking.",
      "Applies AI analysis to surface personalised insights and trends rather than raw numbers.",
    ],
    stack: ["React", "Node.js", "MongoDB"],
    skillsUsed: [
      { name: "React", how: "The tracker UI surfacing personalised insights and trends." },
      { name: "Node.js", how: "Activity capture and the analysis layer that turns raw tracking data into insight." },
      { name: "MongoDB", how: "Stores the captured activity data." },
    ],
    image: {
      src: "/projects/wellcompanion.png",
      kind: "cover",
      alt: "WellCompanion — stylized cover art",
      note: "Thin on detail — only one résumé mentions it. Worth expanding from memory before this page goes public.",
    },
    featured: false,
  },

  {
    slug: "datachamps",
    name: "Datachamps",
    domain: "FinTech",
    role: "Software Engineer",
    period: periodFor("datachamps"),
    url: null,
    summary:
      "Financial-analysis tool on PostgreSQL letting analysts explore data through dashboards, with a desktop companion app and automated report generation.",
    contribution:
      "First production engagement. Delivered web application features with React and Node.js/Express on AWS, designed the REST APIs and PostgreSQL schemas, built the Electron bridge that connects the web app to its desktop companion, and automated Power BI reporting with Selenium scripts on an AWS Windows instance — replacing a manual process.",
    ownership: ["design", "build"],
    metrics: [],
    highlights: [
      "Built dashboards letting analysts explore financial data directly.",
      "Built the desktop companion app and the Electron bridge connecting it to the web app, so the dashboards can drive desktop-side capabilities.",
      "Automated Power BI report generation with Selenium scripts running on an AWS Windows instance, replacing the manual reporting process.",
      "Delivered production web application features with React, Node.js/Express and AWS.",
      "Designed REST APIs and database schemas on PostgreSQL.",
      "The only engagement in this list built on PostgreSQL rather than MongoDB.",
    ],
    stack: ["React", "Node.js", "Express", "PostgreSQL", "Electron.js", "Selenium", "AWS"],
    skillsUsed: [
      { name: "React", how: "Dashboards that let analysts explore financial data directly." },
      { name: "Node.js", how: "The services behind the dashboards and reports." },
      { name: "Express", how: "REST APIs, designed as part of the engagement." },
      { name: "PostgreSQL", how: "The analysis schemas — the one engagement here built on PostgreSQL rather than MongoDB." },
      { name: "Electron.js", how: "The bridge connecting the web app to its desktop companion, exposing desktop-side capabilities to the dashboards." },
      { name: "Selenium", how: "Scripted Power BI automation on an AWS Windows instance — the automated reporting that replaced the manual process." },
      { name: "AWS", how: "Hosts the application, plus the Windows instance the report automation runs on." },
    ],
    image: { src: "/projects/datachamps.png", kind: "cover", alt: "Datachamps — stylized cover art" },
    featured: false,
  },

  {
    slug: "tradegully",
    name: "Tradegully",
    domain: "E-commerce",
    role: "Support Developer",
    period: periodFor("tradegully"),
    url: null,
    summary:
      "Two-sided e-commerce marketplace: shoppers buy through the storefront, retailers list and sell their own catalogue through the same platform.",
    contribution:
      "Support role running alongside his main client assignment — feature work and fixes across the shopper-facing storefront and the retailer side of the marketplace.",
    ownership: ["build"],
    metrics: [],
    highlights: [
      "Two-sided marketplace: one platform serving shoppers buying and retailers selling.",
      "Retailer-facing catalogue and listing flows alongside the customer storefront.",
      "Carried as a support engagement while a main client assignment was already running.",
    ],
    stack: ["React", "Node.js", "Express", "MongoDB"],
    skillsUsed: [
      { name: "React", how: "Feature work and fixes across the shopper storefront and the retailer side." },
      { name: "Node.js", how: "Backend fixes and features in the support rotation." },
      { name: "Express", how: "The marketplace APIs." },
      { name: "MongoDB", how: "The platform's datastore." },
    ],
    image: {
      src: "/projects/tradegully.png",
      kind: "cover",
      alt: "Tradegully — stylized cover art",
      note: "Thinnest entry on the site. The product description is Dev's; the specifics of what he built still need filling in before this page is worth reading.",
    },
    featured: false,
  },

  {
    slug: "bestosys",
    name: "Bestosys",
    domain: "HealthTech",
    role: "Software Engineer",
    period: periodFor("bestosys"),
    url: null,
    summary:
      "Dental practice-management software letting doctors manage patient records, appointment scheduling, prescriptions, reports and patient communication in one platform.",
    contribution:
      "Short engagement delivering feature work across the records, scheduling, prescriptions and reporting surfaces.",
    ownership: ["build"],
    metrics: [],
    highlights: [
      "Patient records, appointment scheduling, prescriptions, reports and patient communication in a single platform.",
      "Short, focused engagement between two longer client assignments.",
    ],
    stack: ["React", "Node.js", "MongoDB"],
    skillsUsed: [
      { name: "React", how: "Feature work across records, scheduling, prescriptions and reporting surfaces." },
      { name: "Node.js", how: "The services behind those surfaces." },
      { name: "MongoDB", how: "Patient records and scheduling data." },
    ],
    image: { src: "/projects/bestosys.png", kind: "cover", alt: "Bestosys — stylized cover art" },
    featured: false,
  },

  {
    slug: "dine-in",
    name: "Dine In",
    domain: "Hospitality",
    role: "Full Stack Developer",
    period: periodFor("dine-in"),
    url: null,
    summary:
      "Android and web app connecting customers with restaurants — table booking through to order fulfilment, with live status for both sides.",
    contribution:
      "Built the Android app and the web app, and the flow that keeps booking, ordering and fulfilment in sync between the customer and the restaurant manager. Earliest end-to-end product, built before joining Nirmitee.io.",
    ownership: ["design", "build"],
    metrics: [],
    highlights: [
      "A full-featured Android app and web app connecting customers with restaurants.",
      "Everything is managed and tracked in the app, from booking a table to fulfilment of the order.",
      "Surfaces the most recent status to both the customer and the restaurant manager.",
      "Earliest end-to-end product, built before the Nirmitee.io years.",
    ],
    stack: ["Android", "React", "Node.js"],
    skillsUsed: [
      { name: "Android", how: "The native customer and manager apps." },
      { name: "React", how: "The web app for both sides of the table." },
      { name: "Node.js", how: "The flow keeping booking, ordering and fulfilment in sync between customer and restaurant." },
    ],
    image: { src: "/projects/dine-in.png", kind: "cover", alt: "Dine In — stylized cover art" },
    featured: false,
  },

  {
    slug: "devtools",
    name: "DevTools",
    domain: "Developer Tools · Simarium",
    role: "Creator — solo",
    period: periodFor("devtools"),
    url: "https://devtools.simarium.in",
    summary:
      "Interactive simulations of the systems developers rely on daily, run against modelled state in the browser.",
    contribution:
      "Built and operated entirely solo, under his own Simarium banner. The Git visualizer is live and runs real graph operations; the simulation engines are written to mirror how the underlying systems actually behave rather than replaying a canned animation.",
    ownership: ["design", "build", "ship", "operate"],
    metrics: [],
    highlights: [
      "Git visualizer, live today: add, commit, merge, rebase and cherry-pick against a simulated repository.",
      "Runs a real commit-graph model, not a scripted animation.",
      "JavaScript internals partially live — event loop and array node canvas.",
      "AWS, Kafka and web-communication playgrounds in progress.",
      "Simulation engines written to mirror how the real system behaves, so the semantics hold up under inspection.",
      "Everything runs client-side against simulated state — no backend to keep alive.",
    ],
    stack: ["Next.js", "TypeScript", "Canvas", "Simulation engines"],
    skillsUsed: [
      { name: "Next.js", how: "The app shell each simulation lives in." },
      { name: "TypeScript", how: "The system models — a commit graph you can actually operate on." },
      { name: "Canvas", how: "Renders the graphs and animations from live model state." },
      { name: "Simulation engines", how: "Real merge, rebase and cherry-pick semantics — not a scripted replay." },
    ],
    image: {
      src: "/projects/devtools.png",
      kind: "cover",
      alt: "DevTools — stylized cover art",
      note: "Dev's own product — no permission concerns. Highest-priority image to replace.",
    },
    featured: true,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
