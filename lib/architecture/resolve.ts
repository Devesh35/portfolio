import type { ArchitectureLayout } from "@/content/architectures";

import { CATEGORY, kindOf } from "./kinds";
import type { DiagramEdge, DiagramGroup, DiagramNode, DiagramView } from "./model";

const pick = (stack: readonly string[], names: readonly string[]) =>
  stack.filter((tech) => names.includes(tech));

const has = (stack: readonly string[], kind: string) => pick(stack, kindOf(kind).of).length > 0;

interface ViewMeta {
  id: string;
  title: string;
  description: string;
}

/**
 * Resolve an authored layout against a stack: boxes keep only real tools,
 * empty boxes and dangling edges disappear. If every surviving node carries
 * a grid position the view is grid-laid-out; otherwise layered.
 */
export function resolve(stack: readonly string[], layout: ArchitectureLayout, meta: ViewMeta): DiagramView {
  const nodes: DiagramNode[] = layout.nodes
    .map((node) => {
      const spec = kindOf(node.kind);
      const items = pick(stack, spec.of).filter((tool) => !node.tools || node.tools.includes(tool));
      return {
        id: node.id ?? node.kind,
        kind: node.kind,
        label: node.label ?? spec.label,
        category: spec.category,
        caption: (typeof node.caption === "function" ? node.caption(items) : node.caption) ?? spec.caption ?? CATEGORY[spec.category].label,
        items,
        variant: node.variant,
        sub: node.sub,
        parallel: node.parallel,
        col: node.col,
        row: node.row,
      };
    })
    // `tools: []` is an authored plain element (a step with no stack of its
    // own, e.g. NextDecade's Ingestion) — it stays with no tiles.
    .filter((node, i) => node.items.length > 0 || layout.nodes[i].tools?.length === 0);
  // Deploy without a Publish beside it (no app on this project) is a plain
  // step, not a one-box stack.
  for (const node of nodes) {
    if (node.parallel === "ship" && nodes.filter((other) => other.parallel === "ship").length < 2) node.parallel = undefined;
  }
  const present = new Set(nodes.map((node) => node.id));

  const groups: DiagramGroup[] = (layout.groups ?? [])
    .map((group) => {
      const spec = kindOf(group.kind);
      return {
        id: group.kind,
        kind: group.kind,
        label: group.label ?? spec.label,
        category: spec.category,
        members: group.members.filter((member) => present.has(member)),
        items: pick(stack, spec.of),
        wrap: group.wrap,
        jitter: group.jitter,
      };
    })
    // A box needs both a reason to exist (its own tool in the stack, e.g.
    // "AWS") and something inside it.
    .filter((group) => group.items.length > 0 && group.members.length > 0);
  for (const group of groups) present.add(group.id);

  // First spec wins for a given pair: a chain edge (lint → test) listed
  // before a fallback edge ([lint, pipeline] → test) keeps the fallback from
  // drawing the same line twice.
  const edges: DiagramEdge[] = [];
  const drawn = new Set<string>();
  for (const spec of layout.edges) {
    if (spec.unless && present.has(spec.unless)) continue;
    const candidates = Array.isArray(spec.from) ? spec.from : [spec.from];
    const from = candidates.find((id) => present.has(id));
    if (!from || !present.has(spec.to) || drawn.has(`${from}->${spec.to}`)) continue;
    drawn.add(`${from}->${spec.to}`);
    edges.push({ from, to: spec.to, type: spec.type, label: spec.label });
  }

  const gridded = nodes.length > 0 && nodes.every((node) => node.col !== undefined && node.row !== undefined);
  return {
    id: meta.id,
    title: layout.title ?? meta.title,
    description: layout.description ?? meta.description,
    layout: layout.layout ?? (gridded ? "grid" : "layered"),
    direction: layout.direction ?? "TB",
    nodes,
    groups,
    edges,
  };
}

/* -------------------------------------------------------------- defaults --
   For projects without an authored view: a plain top-to-bottom flow with
   the usual relationships, laid out automatically. */

export function defaultApp(stack: readonly string[]): ArchitectureLayout {
  const noApi = !has(stack, "api");
  const transport = stack.includes("WebSocket") ? "REST · WebSocket" : "REST";
  const kinds = ["web", "mobile", "desktop", "identity", "api", "external", "events", "database", "cache", "automation"];
  return {
    nodes: kinds.filter((kind) => has(stack, kind)).map((kind) => ({ kind })),
    edges: [
      { from: "web", to: "api", type: "api", label: transport },
      { from: "mobile", to: "api", type: "api", label: transport },
      { from: "desktop", to: "api", type: "api", label: "REST" },
      { from: "api", to: "database", type: "data", label: "reads / writes" },
      { from: "api", to: "cache", type: "data", label: "cache" },
      { from: "api", to: "events", type: "event", label: "events" },
      { from: "events", to: "database", type: "event", label: "consumers" },
      ...(noApi ? [{ from: ["web", "mobile"], to: "database", type: "data" as const, label: "SDK" }] : []),
      { from: "identity", to: "web", type: "auth", label: "sign-in" },
      { from: "identity", to: "mobile", type: "auth", label: "sign-in" },
      { from: ["api", "web", "mobile"], to: "external", type: "api", label: "API calls" },
    ],
  };
}

/**
 * "Push to prod" — one template for every project, filled from its stack.
 * A serial chain (Dev, 2026-09-10): CI/CD → Lint → Test → Build → Deploy ‖
 * Publish → Monitor, each stage skipped when the stack lacks it, so every
 * edge's `from` lists the earlier stages as fallbacks. On a project that ran
 * the checks in Nx Cloud, the group takes over: CI/CD → Nx Cloud, the chain
 * runs inside it, and Nx Cloud → Deploy / Publish.
 */
const STORE_TOOLS = ["App Store", "Google Play"];
const RELEASE_SERVER_TOOLS = ["Multi-environment deployments", "Blue-green deployment", "Rolling deployments", "Vercel"];
const BEFORE_LINT = ["pipeline", "source"];
const BEFORE_TEST = ["lint", ...BEFORE_LINT];
const BEFORE_BUILD = ["test", ...BEFORE_TEST];
const BEFORE_SHIP = ["build", ...BEFORE_BUILD];

export function pipelineTemplate(): ArchitectureLayout {
  return {
    layout: "flow",
    direction: "TB",
    nodes: [
      { kind: "source", variant: "stage", label: "Source" },
      { kind: "pipeline", variant: "stage", label: "CI/CD" },
      { kind: "lint", variant: "stage", label: "Lint" },
      { kind: "test", variant: "stage", label: "Test" },
      { kind: "build", variant: "stage", label: "Build" },
      // Deploy ‖ Publish: servers get deployed, an app gets published to the
      // stores — Publish only exists on projects with an App Store / Google
      // Play entry.
      {
        kind: "release",
        variant: "stage",
        label: "Deploy",
        tools: RELEASE_SERVER_TOOLS,
        caption: (items) => `FE · BE${items.includes("Multi-environment deployments") ? " · Multi-env" : ""}`,
        parallel: "ship",
      },
      { kind: "release", id: "publish", variant: "stage", label: "Publish", caption: "Play Store · App Store", tools: STORE_TOOLS, parallel: "ship" },
      { kind: "monitoring", variant: "stage", label: "Monitor" },
    ],
    groups: [{ kind: "nxcloud", members: ["lint", "test", "build"], label: "Nx Cloud" }],
    edges: [
      { from: "source", to: "pipeline", type: "deploy", label: "push" },
      // the chain inside the checks
      { from: "lint", to: "test", type: "deploy" },
      { from: "test", to: "build", type: "deploy" },
      // into and out of the checks — direct, or through Nx Cloud
      { from: BEFORE_LINT, to: "lint", type: "deploy", unless: "nxcloud" },
      { from: BEFORE_TEST, to: "test", type: "deploy", unless: "nxcloud" },
      { from: BEFORE_BUILD, to: "build", type: "deploy", unless: "nxcloud" },
      { from: BEFORE_SHIP, to: "release", type: "deploy", unless: "nxcloud" },
      { from: BEFORE_SHIP, to: "publish", type: "deploy", label: "app", unless: "nxcloud" },
      { from: ["pipeline", "source"], to: "nxcloud", type: "deploy" },
      { from: "nxcloud", to: "release", type: "deploy" },
      { from: "nxcloud", to: "publish", type: "deploy", label: "app" },
      { from: ["release", "publish"], to: "monitoring", type: "deploy" },
    ],
  };
}

/**
 * "Where it lives" — Dev's sketch (2026-09-10): infra-as-code on top,
 * provisioning the cloud card below it. Inside the card, the request path
 * runs down the left (ingress → compute → queue) and the things compute
 * talks to sit on the right (access, storage, monitoring). Authored grid;
 * services the stack lacks leave their slot empty rather than reflowing,
 * so the two columns keep their meaning.
 */
export function infraTemplate(): ArchitectureLayout {
  const members = ["edge", "compute", "access", "storage", "managed", "messaging", "cloudwatch", "events", "ai"];
  return {
    layout: "grid",
    nodes: [
      { kind: "iac", col: 0, row: 0 },
      { kind: "edge", col: 0, row: 1 },
      { kind: "access", col: 1, row: 1 },
      { kind: "compute", col: 0, row: 2 },
      { kind: "storage", col: 1, row: 2 },
      // Managed data and a queue share the slot under compute: no project
      // here has both (RDS/DynamoDB/Cosmos vs SNS/SQS), and a third column
      // would put a straight edge through Object storage.
      { kind: "managed", col: 0, row: 3 },
      { kind: "messaging", col: 0, row: 3 },
      // an event stream the project self-hosts (Modcart: Kafka on EC2)
      { kind: "events", col: 0, row: 3, label: "Kafka", caption: "On EC2" },
      { kind: "cloudwatch", col: 1, row: 3 },
      { kind: "ai", col: 1, row: 3 },
    ],
    groups: [
      { kind: "aws", members, label: "AWS infrastructure" },
      { kind: "azure", members, label: "Azure infrastructure" },
    ],
    edges: [
      { from: "iac", to: "aws", type: "provision", label: "provisions" },
      { from: "iac", to: "azure", type: "provision", label: "provisions" },
      { from: "access", to: "iac", type: "auth", label: "scopes" },
      { from: "edge", to: "compute", type: "api", label: "routes" },
      { from: "compute", to: "access", type: "auth", label: "scoped by" },
      { from: "compute", to: "storage", type: "data", label: "assets" },
      { from: "compute", to: "managed", type: "data", label: "reads / writes" },
      { from: "compute", to: "messaging", type: "event", label: "async" },
      { from: "compute", to: "events", type: "event", label: "events" },
      { from: "compute", to: "cloudwatch", type: "telemetry", label: "logs · metrics" },
      { from: "compute", to: "ai", type: "api", label: "inference" },
    ],
  };
}

/** Close the gaps a stack leaves in a grid template: each row's surviving
 *  boxes are re-packed left to right and centred on the widest row, so a
 *  project without Docker or a queue gets a shorter strip, not holes.
 *  Infra-as-code keeps its place on the left. */
export function compactRows(view: DiagramView): DiagramView {
  if (view.layout !== "grid") return view;
  const rows = new Map<number, DiagramNode[]>();
  for (const node of view.nodes) {
    const row = rows.get(node.row ?? 0) ?? [];
    row.push(node);
    rows.set(node.row ?? 0, row);
  }
  const widest = Math.max(1, ...[...rows.values()].map((row) => row.length));
  const nodes: DiagramNode[] = [];
  for (const row of rows.values()) {
    if (row.length === 1 && row[0].id === "iac") {
      nodes.push(row[0]);
      continue;
    }
    row.sort((a, b) => (a.col ?? 0) - (b.col ?? 0));
    row.forEach((node, index) => {
      nodes.push({ ...node, col: index + (widest - row.length) / 2 });
    });
  }
  return { ...view, nodes };
}
