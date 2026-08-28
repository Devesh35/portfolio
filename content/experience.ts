export interface Role {
  company: string;
  title: string;
  period: string;
  start: string;
  end: string | null;
  summary: string;
  bullets: string[];
  /** Project slugs worked on during this role. */
  projects: string[];
}

export const roles: Role[] = [
  {
    company: "Nirmitee.io",
    title: "Software Development Engineer II",
    period: "Apr 2024 – Present",
    start: "2024-04",
    end: null,
    summary:
      "Own full-stack and DevOps delivery for client platforms, from requirements and system design through deployment and monitoring.",
    bullets: [
      "Revamped a legacy platform serving 160,000+ users with Next.js and TypeScript inside an Nx monorepo, improving performance, UX and developer productivity.",
      "Designed and built a scalable Node.js/Express modular service architecture, optimising inter-service communication and reliability.",
      "Built and optimised CI/CD pipelines with Docker on AWS for consistent multi-environment releases.",
      "Improved scalability with Redis caching and Kafka event processing for real-time analytics and high-throughput workloads.",
      "Led end-to-end feature delivery, collaborating closely with product, design and QA.",
    ],
    projects: ["estateguru", "nextdecade", "wellcompanion"],
  },
  {
    company: "Nirmitee.io",
    title: "Software Engineer (Consultant Graduate)",
    period: "Nov 2021 – Apr 2024",
    start: "2021-11",
    end: "2024-04",
    summary:
      "Delivered production web applications across finance, health, advertising and mobility clients.",
    bullets: [
      "Built backend services in Node.js and Express, designing REST APIs and schemas across PostgreSQL and MongoDB.",
      "Developed a web and mobile platform serving 200,000+ users, with user management, analytics and payment-gateway integrations.",
      "Implemented Redis caching and optimised database queries to improve response times.",
      "Maintained responsive UI components across mobile, tablet and desktop breakpoints.",
      "Began the Estateguru revamp in this role and carried it through as SDE 2.",
    ],
    projects: ["datachamps", "bestosys", "tradegully", "modcart", "boongg", "goapi"],
  },
];
