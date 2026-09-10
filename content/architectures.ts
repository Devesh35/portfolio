import type { Direction, EdgeType, LayoutKind } from "@/lib/architecture/model";

/**
 * Hand-authored system views, per project — Dev's own account of what talks
 * to what. Only the TOPOLOGY lives here: which boxes and what connects. What
 * each box contains is resolved from the project's stack by
 * lib/architecture/resolve.ts (the KIND registry), so a box that names no
 * tool the project used simply does not render, and nothing here can claim a
 * tool the stack doesn't.
 *
 * Positions are optional. Leave them out and the view is laid out
 * automatically (layered, top-to-bottom by default); give every node a
 * `col`/`row` and the view uses that grid instead — for when the shape itself
 * is the point (Estateguru, below). Projects without an entry get a derived
 * default flow.
 */

export interface LayoutNode {
  /** A key of KIND in lib/architecture/kinds.ts. */
  kind: string;
  /** Node id when a view needs two boxes of one kind (investor / borrower
   *  web apps); defaults to the kind. Edges name ids. */
  id?: string;
  /** Keep only these stack entries in the box (a Firebase "real-time" box
   *  next to a MongoDB "database" box, both of kind database). */
  tools?: string[];
  /** Override the caption under the title — or derive it from the tools the
   *  box ends up with. */
  caption?: string | ((items: string[]) => string);
  /** Override the kind's default label. */
  label?: string;
  /** "stage": a pipeline step card (big glyph + label + sub-label). */
  variant?: "stage";
  sub?: string;
  /** Flow layouts: stages sharing a key stack vertically (run in parallel). */
  parallel?: string;
  /** Grid position — only honoured when every node in the view has one. */
  col?: number;
  row?: number;
}

export interface LayoutGroup {
  /** A KIND key whose tools the box stands for (e.g. "aws" → the AWS account). */
  kind: string;
  /** Node kinds drawn inside the box. */
  members: string[];
  label?: string;
  /** Flow layouts: at most this many members per row inside the frame. */
  wrap?: number;
  /** Flow layouts: nudge every other row sideways by this much. */
  jitter?: number;
}

export interface LayoutEdge {
  /** A kind, or fallbacks — the first one present is used. Groups are valid ends. */
  from: string | string[];
  to: string;
  type: EdgeType;
  label?: string;
  /** Skip this edge when that box (or group) is present — a group that
   *  stands in for its members takes over their connections. */
  unless?: string;
}

export interface ArchitectureLayout {
  title?: string;
  description?: string;
  layout?: LayoutKind;
  direction?: Direction;
  nodes: LayoutNode[];
  groups?: LayoutGroup[];
  edges: LayoutEdge[];
}

export const architectures: Record<string, { app?: ArchitectureLayout; pipeline?: ArchitectureLayout; infra?: ArchitectureLayout }> = {
  // Dev, 2026-09-10: the mobile app goes through the web app to reach the
  // backend; external services and identity hang off the web app, identity
  // also talks to the backend; both sit to the left. Shape is his, so it's a
  // fixed grid rather than an automatic layout.
  // Dev, 2026-09-10: three UIs — the investor web + mobile app, the borrower
  // web + mobile app (phase 2), and a Storybook design system both share.
  // Mobile goes through its web app; identity and external hang off the
  // investor side; the backend is one.
  estateguru: {
    app: {
      nodes: [
        { kind: "mobile", id: "investor-mobile", label: "Investor mobile", col: 1, row: 0 },
        { kind: "mobile", id: "borrower-mobile", label: "Borrower mobile", col: 2, row: 0 },
        { kind: "external", col: 0, row: 1 },
        { kind: "web", id: "investor-web", label: "Investor web", col: 1, row: 1 },
        { kind: "web", id: "borrower-web", label: "Borrower web", col: 2, row: 1 },
        { kind: "identity", col: 0, row: 2 },
        { kind: "api", col: 1, row: 2, label: "Backend" },
        { kind: "designsystem", col: 2, row: 2 },
        { kind: "database", col: 1, row: 3 },
      ],
      edges: [
        { from: "investor-mobile", to: "investor-web", type: "api", label: "through" },
        { from: "borrower-mobile", to: "borrower-web", type: "api", label: "through" },
        { from: "investor-web", to: "api", type: "api", label: "REST" },
        { from: "borrower-web", to: "api", type: "api", label: "REST" },
        { from: "designsystem", to: "borrower-web", type: "link", label: "components" },
        { from: "designsystem", to: "investor-web", type: "link" },
        { from: "identity", to: "investor-web", type: "auth", label: "sign-in" },
        { from: "identity", to: "api", type: "auth", label: "tokens" },
        { from: "investor-web", to: "external", type: "api", label: "API calls" },
        { from: "api", to: "database", type: "data", label: "reads / writes" },
      ],
    },
  },

  // Dev, 2026-09-10: the web app drives the simulation engine, which draws
  // to the 2D canvas — two separate parts, integrated. Ships from GitHub
  // through Vercel.
  devtools: {
    app: {
      nodes: [
        { kind: "web", col: 0, row: 0 },
        { kind: "sim", col: 0, row: 1 },
        { kind: "canvas", col: 1, row: 1 },
      ],
      edges: [
        { from: "web", to: "sim", type: "link", label: "drives" },
        { from: "sim", to: "canvas", type: "link", label: "draws to" },
      ],
    },
  },
  /* ------------------------------------------------------------------
     The views below were drawn from each project's own documented content
     (contribution, highlights, skillsUsed how-lines) — not dictated by Dev.
     Edges exist only where the content states the connection; a box with no
     documented link is left unconnected rather than guessed. Dev can correct
     any of these by editing the entry. */

  // Log platform on Azure: ingestion services pull from sources, analyses go
  // to Cosmos DB, raw payloads to Blob, GPT explains failures; Okta federated
  // with Entra ID for sign-in.
  // Dev, 2026-09-10: ingestion (pulling from the sources' external APIs)
  // is its own service next to the platform's backend.
  nextdecade: {
    app: {
      nodes: [
        { kind: "identity", col: 0, row: 0 },
        { kind: "web", label: "Monitoring UI", col: 1, row: 0 },
        // Ingestion is a plain element (Dev, 2026-09-10): no stack of its
        // own — Node.js belongs to the backend; payloads land via the backend.
        { kind: "api", id: "ingestion", label: "Ingestion", caption: "External source APIs", tools: [], col: 0, row: 1 },
        { kind: "api", label: "Backend", tools: ["Node.js", "Express.js", "REST API design"], col: 1, row: 1 },
        { kind: "external", label: "AI analysis", col: 2, row: 1 },
        { kind: "storage", label: "Raw log payloads", col: 0, row: 2 },
        { kind: "database", col: 1, row: 2 },
      ],
      edges: [
        { from: "web", to: "api", type: "api", label: "REST" },
        { from: "identity", to: "web", type: "auth", label: "sign-in" },
        { from: "ingestion", to: "api", type: "event", label: "logs" },
        { from: "api", to: "storage", type: "data", label: "payloads" },
        { from: "api", to: "external", type: "api", label: "analyses" },
        { from: "api", to: "database", type: "data", label: "logs · analyses" },
      ],
    },
  },

  // Embedded single-page stores; Kafka decouples analytics ingestion from the
  // transactional path with Redis for fast aggregation; WebSocket inbox with
  // Meta integrations; Razorpay payments; Google/Meta social login.
  // Dev, 2026-09-10: sign-in → advertiser web app → backend; the one-page
  // stores and shoppable ads are separate front ends on the same backend.
  modcart: {
    app: {
      nodes: [
        { kind: "identity", col: 0, row: 0 },
        { kind: "web", label: "Advertiser web app", tools: ["React", "Redux", "JavaScript (ES6+)", "Google Analytics"], col: 1, row: 0 },
        { kind: "web", id: "stores", label: "One-page stores", caption: "Embedded", tools: ["React", "Responsive & cross-platform UI", "Meta Pixel"], col: 2, row: 0 },
        { kind: "external", label: "Payments · Meta", col: 0, row: 1 },
        { kind: "api", col: 1, row: 1 },
        { kind: "web", id: "ads", label: "Shoppable ads", caption: "Embedded", tools: ["React", "Responsive & cross-platform UI", "Meta Pixel"], col: 2, row: 1 },
        { kind: "database", col: 1, row: 2 },
        { kind: "events", col: 2, row: 2 },
        { kind: "cache", col: 2, row: 3 },
      ],
      edges: [
        { from: "identity", to: "web", type: "auth", label: "sign-in" },
        { from: "web", to: "api", type: "api", label: "REST · WebSocket" },
        { from: "stores", to: "api", type: "api", label: "REST" },
        { from: "ads", to: "api", type: "api", label: "REST" },
        { from: "api", to: "external", type: "api", label: "API calls" },
        { from: "api", to: "events", type: "event", label: "events" },
        { from: "events", to: "cache", type: "data", label: "aggregation" },
        { from: "api", to: "database", type: "data", label: "reads / writes" },
      ],
    },
  },

  // React web + native Android against a Node/Express backend on MongoDB;
  // Google Maps on the booking and pickup flows in the apps.
  boongg: {
    app: {
      nodes: [
        { kind: "web", col: 0, row: 0 },
        { kind: "mobile", label: "Android app", col: 1, row: 0 },
        { kind: "api", col: 0, row: 1 },
        { kind: "external", label: "Google Maps", col: 1, row: 1 },
        { kind: "database", col: 0, row: 2 },
      ],
      edges: [
        { from: "web", to: "external", type: "api", label: "maps" },
        { from: "mobile", to: "external", type: "api", label: "maps" },
        { from: "web", to: "api", type: "api", label: "REST" },
        { from: "mobile", to: "api", type: "api", label: "REST" },
        { from: "api", to: "database", type: "data", label: "reads / writes" },
      ],
    },
  },

  // Solo build: React Native app, Node/Express backend, PostgreSQL schema from
  // the spec, containerised and deployed on Beanstalk with RDS.
  // Dev, 2026-09-10: it is an app too — App Store / Google Play in the stack
  // give it the template's Deploy ‖ Publish split.
  goapi: {
    app: {
      nodes: [{ kind: "mobile" }, { kind: "api" }, { kind: "database" }],
      edges: [
        { from: "mobile", to: "api", type: "api", label: "REST" },
        { from: "api", to: "database", type: "data", label: "reads / writes" },
      ],
    },
  },

  // React Native app with a native Kotlin tracking module, Google/Apple
  // sign-in, Node services feeding activity data to MongoDB. The client's
  // Python/ML pipeline is not Dev's and is not in the stack, so it does not
  // appear.
  // Dev, 2026-09-10: the React Native app is the main node; native support
  // (Kotlin, with the Swift side generated from it) is its own box. No
  // CI/CD — the app is built and released to the stores.
  wellcompanion: {
    app: {
      nodes: [
        { kind: "identity", col: 0, row: 0 },
        { kind: "mobile", label: "React Native app", tools: ["React Native", "TypeScript", "Responsive & cross-platform UI"], col: 1, row: 0 },
        { kind: "native", col: 2, row: 0 },
        { kind: "api", col: 1, row: 1 },
        { kind: "database", col: 1, row: 2 },
      ],
      edges: [
        { from: "identity", to: "mobile", type: "auth", label: "sign-in" },
        { from: "native", to: "mobile", type: "link", label: "sensors" },
        { from: "mobile", to: "api", type: "api", label: "REST" },
        { from: "api", to: "database", type: "data", label: "activity data" },
      ],
    },
    pipeline: {
      layout: "flow",
      direction: "TB",
      nodes: [
        { kind: "mobilebuild", variant: "stage", label: "Build" },
        { kind: "release", variant: "stage", label: "Publish", caption: "Play Store · App Store" },
      ],
      edges: [{ from: "mobilebuild", to: "release", type: "deploy", label: "to the stores" }],
    },
  },

  // Dashboards in React over Node/Express and PostgreSQL; an Electron bridge
  // links the web app to its desktop companion; Selenium automates Power BI
  // reports on an AWS Windows instance (a separate scripted job, so it is
  // deliberately unconnected).
  // Dev, 2026-09-10: the desktop companion talks to Tally, pulling data
  // periodically and sending it to the backend — it is not a UI. The web
  // app carries role-based access for admins and assistants.
  datachamps: {
    app: {
      nodes: [
        // Two columns so the view renders at full scale in its column.
        { kind: "desktop", label: "Desktop companion", caption: "Headless", col: 0, row: 0 },
        { kind: "web", label: "Web app", caption: "RBAC · admin · assistant", col: 1, row: 0 },
        { kind: "external", label: "Tally", tools: ["Tally"], col: 0, row: 1 },
        { kind: "api", col: 1, row: 1 },
        { kind: "automation", label: "Report automation", col: 0, row: 2 },
        { kind: "database", col: 1, row: 2 },
      ],
      edges: [
        { from: "desktop", to: "external", type: "api", label: "pulls periodically" },
        { from: "desktop", to: "api", type: "data", label: "sends" },
        { from: "web", to: "api", type: "api", label: "REST" },
        { from: "api", to: "automation", type: "event", label: "schedules" },
        { from: "api", to: "database", type: "data", label: "reads / writes" },
      ],
    },
  },

  // Two-sided marketplace: React storefront + retailer side over Express and
  // MongoDB (DynamoDB alongside), Beanstalk on AWS.
  tradegully: {
    app: {
      nodes: [{ kind: "web", label: "Marketplace UI" }, { kind: "api" }, { kind: "database" }],
      edges: [
        { from: "web", to: "api", type: "api", label: "REST" },
        { from: "api", to: "database", type: "data", label: "reads / writes" },
      ],
    },
  },

  // Clinic platform: React surfaces over Express and MongoDB, served through
  // CloudFront from Beanstalk. (The Firebase real-time sync the highlights
  // mention is not in this project's stack, so it cannot be drawn.)
  // Dev, 2026-09-10: Firebase carries the real-time data next to MongoDB.
  bestosys: {
    app: {
      nodes: [
        { kind: "web", label: "Clinic UI", col: 0, row: 0 },
        { kind: "api", col: 0, row: 1 },
        { kind: "database", label: "Real-time data", id: "realtime", caption: "Live sync", tools: ["Firebase"], col: 1, row: 1 },
        { kind: "database", tools: ["MongoDB"], col: 0, row: 2 },
      ],
      edges: [
        { from: "web", to: "api", type: "api", label: "REST" },
        { from: "api", to: "realtime", type: "data", label: "pushes" },
        { from: "realtime", to: "web", type: "event", label: "live updates" },
        { from: "api", to: "database", type: "data", label: "reads / writes" },
      ],
    },
  },

  // Kotlin customer app and React manager web app; Node keeps booking →
  // fulfilment in sync; Firebase pushes every status change to both sides in
  // real time (a cycle — the layout engine handles it) and carries Google /
  // phone sign-in. No infrastructure of its own.
  "dine-in": {
    app: {
      nodes: [
        { kind: "mobile", label: "Customer app" },
        { kind: "web", label: "Manager web app" },
        { kind: "api" },
        { kind: "database", label: "Firebase" },
        { kind: "identity" },
      ],
      edges: [
        { from: "mobile", to: "api", type: "api", label: "REST" },
        { from: "web", to: "api", type: "api", label: "REST" },
        { from: "api", to: "database", type: "data", label: "sync" },
        { from: "database", to: "mobile", type: "event", label: "real-time" },
        { from: "database", to: "web", type: "event", label: "real-time" },
        { from: "identity", to: "mobile", type: "auth", label: "Firebase Auth" },
      ],
    },
  },
};
