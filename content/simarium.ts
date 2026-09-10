/**
 * Simarium — Dev's own venture, kept separate from client work on purpose.
 * Everything here is either from the canonical résumé or observable on the
 * live site. Nothing is inferred. Statuses last checked against
 * devtools.simarium.in on 2026-09-10.
 */

export type ToolStatus = "live" | "partial" | "building";

export const STATUS_LABEL: Record<ToolStatus, string> = {
  live: "Live",
  partial: "Partly live",
  building: "In progress",
};

export const simarium = {
  name: "Simarium",
  product: "DevTools",
  url: "https://devtools.simarium.in",
  tagline: "The systems developers rely on every day, turned into interactive simulations.",
  body:
    "Built and operated solo. Each tool runs a real model of the system it teaches — the Git visualizer executes merge, rebase and cherry-pick against an actual commit graph rather than replaying a scripted animation. Everything runs client-side against simulated state, so there is no backend to keep alive.",
  why:
    "Client work is what I was asked to build. This is what I build on my own time, and it is the best example of how I think about systems.",
  tools: [
    {
      name: "Git Visualizer",
      status: "live" as ToolStatus,
      body: "Run add, commit, merge, rebase and cherry-pick against a modelled repository and watch the commit graph respond.",
    },
    {
      name: "Kafka Playground",
      status: "live" as ToolStatus,
      body: "Design topics, then simulate the cluster — producers, partitions and consumer groups you can push events through.",
    },
    {
      name: "JavaScript Internals",
      status: "live" as ToolStatus,
      body: "The event loop, call stack and queues, stepped through as code runs.",
    },
    {
      name: "Docker World",
      status: "building" as ToolStatus,
      body: "Build containers and schedule them onto a simulated Kubernetes cluster.",
    },
    {
      name: "AWS Playground",
      status: "building" as ToolStatus,
      body: "Cloud primitives as manipulable objects rather than console screenshots.",
    },
    {
      name: "Database",
      status: "building" as ToolStatus,
      body: "Schema builder and visualizer for SQL and NoSQL models.",
    },
    {
      name: "Web Communication",
      status: "building" as ToolStatus,
      body: "HTTP, WebSocket and the transports between them, side by side.",
    },
  ],
} as const;
