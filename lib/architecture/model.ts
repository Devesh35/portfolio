/**
 * Domain model for the per-project system views.
 *
 *   project data (content/projects.ts + content/architectures.ts)
 *     → resolve.ts  (boxes filled from the stack; empty boxes vanish)
 *     → layout.ts   (positions: dagre layering, or an authored grid)
 *     → components/architecture/* (rendering + interaction)
 *
 * Nothing in here knows about a specific project. A node's CONTENTS always
 * come from the project's stack, so a view can never name a tool the project
 * did not use.
 */

/** Broad families a node can belong to — drives colour and the legend. */
export type NodeCategory =
  | "client"
  | "service"
  | "data"
  | "boundary"
  | "delivery"
  | "infrastructure"
  | "operations";

/** What a connection means — drives stroke style. */
export type EdgeType =
  | "api"
  | "event"
  | "data"
  | "auth"
  | "deploy"
  | "telemetry"
  | "provision"
  | "link";

export interface DiagramNode {
  id: string;
  /** Registry key (kinds.ts) the node was built from. */
  kind: string;
  label: string;
  category: NodeCategory;
  /** Caption under the title (kinds.ts `caption`, else the category label). */
  caption: string;
  /** Stack entries this node is made of — exact stack spellings. */
  items: string[];
  /** "stage": a pipeline step — big glyph, label, one-line sub-label. */
  variant?: "stage";
  sub?: string;
  /** Flow layouts: stages sharing a key stack vertically as one parallel step. */
  parallel?: string;
  /** Authored grid position; present only for grid-laid-out views. */
  col?: number;
  row?: number;
}

export interface DiagramGroup {
  id: string;
  kind: string;
  label: string;
  category: NodeCategory;
  /** Node ids drawn inside the box. */
  members: string[];
  /** Stack entries the box itself stands for (e.g. the AWS account). */
  items: string[];
  /** Flow layouts: at most this many members per row inside the frame. */
  wrap?: number;
  /** Flow layouts: nudge every other row sideways by this much. */
  jitter?: number;
}

export interface DiagramEdge {
  from: string;
  to: string;
  type: EdgeType;
  label?: string;
}

/**
 *   layered — automatic (dagre), from the edges.
 *   grid    — authored col/row.
 *   flow    — sections (pipeline stages, each group's members, the rest)
 *             wrapped left-to-right to the width available, like text.
 */
export type LayoutKind = "layered" | "grid" | "flow";
export type Direction = "TB" | "LR";

/** One rendered view of a project ("How it fits together", "How it runs"…). */
export interface DiagramView {
  id: string;
  title: string;
  description: string;
  layout: LayoutKind;
  direction: Direction;
  nodes: DiagramNode[];
  groups: DiagramGroup[];
  edges: DiagramEdge[];
}

export interface Box {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Size = { w: number; h: number };
export type Point = { x: number; y: number };
