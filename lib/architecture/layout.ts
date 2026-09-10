import { Graph, layout as dagreLayout } from "@dagrejs/dagre";

import type { Box, DiagramNode, DiagramView, EdgeType, Point, Size } from "./model";

/**
 * Positions for a view's boxes, from measured (or estimated) node sizes.
 *
 *   layered — dagre: ranks follow the edges, cycles are broken for layout
 *             only, groups become compound nodes so their members stay
 *             together. Used whenever a view carries no positions.
 *   grid    — authored col/row on a pitch set by the widest box, groups hug
 *             their members. Used when the shape itself is the statement
 *             (Estateguru's app view, the "How it runs" template).
 *
 * Both return the same shape, so the renderer never knows which ran.
 */

/** Minimum column gap for authored grids; the pitch grows from here to fill
 *  the host (see layoutView's targetWidth). */
export const GAP_X = 28;
export const GAP_Y = 64;
export const GROUP_PAD = 14;
export const GROUP_LABEL = 22;
const EST_H = 58;

/** How strongly an edge type pulls its ends into consecutive ranks. */
const RANK_WEIGHT: Record<EdgeType, number> = {
  api: 3,
  data: 3,
  deploy: 3,
  auth: 2,
  provision: 2,
  link: 2,
  event: 1,
  telemetry: 1,
};

export interface Layout {
  boxes: Map<string, Box>;
  left: number;
  top: number;
  width: number;
  height: number;
  /** 0-based depth of each node, for the load-in stagger. */
  rank: Map<string, number>;
  /** Routed waypoints per edge ("from->to"), when the engine provides them —
   *  dagre steers long edges around the boxes in between. */
  routes: Map<string, Point[]>;
}

export const routeKey = (from: string, to: string) => `${from}->${to}`;

/** Size before the browser has measured a node — close enough for first paint. */
export const estimate = (node: DiagramNode): Size =>
  node.variant === "stage"
    ? { w: Math.max(node.label.length * 8 + 22, node.parallel ? 0 : node.items.length * 32, 88) + 24, h: node.parallel ? 40 : 68 }
    : {
        w: Math.max(node.label.length * 7.6 + 46, ...node.items.map((item) => Math.min(item.length, 20) * 6.6 + 44), 120),
        h: 34 + node.items.length * 18 + 10,
      };

/** Widest the columns are allowed to spread to fill a wide host. */
const MAX_SPREAD = 2.2;

/**
 * @param targetWidth  width available for the drawing — when it is wider than
 *   the natural layout, the columns spread out to use it (boxes keep their
 *   size; only the gaps grow, up to MAX_SPREAD× the natural pitch).
 */
export function layoutView(view: DiagramView, sizes: Record<string, Size>, targetWidth?: number): Layout {
  const size = (node: DiagramNode) => sizes[node.id] ?? estimate(node);
  if (view.layout === "grid") return grid(view, size, targetWidth);
  if (view.layout === "flow") return flow(view, size, targetWidth);
  return layered(view, size, targetWidth);
}

/* ------------------------------------------------------------------ flow */

/** Row gap inside a wrapped section — room for an edge label between rows. */
const FLOW_ROW_GAP = 56;
/** Gap between sections. */
const FLOW_SECTION_GAP = GAP_Y;

/** Vertical gap between the boxes of one parallel stack. */
const STACK_GAP = 22;
/** Horizontal gap between pipeline steps — enough for a group frame
 *  (GROUP_PAD each side) to sit between two of them. */
const STEP_GAP = 36;

/** A wrap item: one box, or a stack of boxes that run in parallel. */
type Item = DiagramNode[];

interface WrapOptions {
  /** Snake: odd rows run right-to-left, right-aligned, so a wrapped chain turns straight down. */
  snake?: boolean;
  /** Horizontal gap between items. */
  gap: number;
  /** At most this many items per row. */
  perRow?: number;
  /** Which way a parallel stack lays its boxes: down (default) or across. */
  stackAxis?: "y" | "x";
  /** Offset every other row sideways by this much — a deliberately loose,
   *  hand-placed look instead of a column. */
  jitter?: number;
  /** Vertical gap between rows. */
  rowGap?: number;
  /** Stacked (axis y) parallel boxes step this far right each — a staircase. */
  stairs?: number;
}

/** Where the i-th box of a staircase starts: each step is at least `stairs`,
 *  and always clears the box above's centre line by 20px so an edge leaving
 *  that box straight down never runs through the next one (Deploy ‖ Publish
 *  on GOAPI, where the lower box is wide). */
function stairOffset(item: Item, size: (node: DiagramNode) => Size, i: number, stairs: number) {
  let x = 0;
  for (let k = 0; k < i; k++) x += Math.max(stairs, size(item[k]).w / 2 + 20);
  return x;
}

/**
 * Wrap items into rows no wider than `width`. Returns placed boxes relative
 * to (0, 0), each tagged with its row, and the block's size.
 */
function wrapRun(items: Item[], size: (node: DiagramNode) => Size, width: number, options: WrapOptions) {
  const { snake = false, gap, perRow = Infinity, stackAxis = "y", jitter = 0, rowGap = FLOW_ROW_GAP, stairs = 0 } = options;
  // Deploy ‖ Publish sit side by side even in a vertical pipeline: stacked,
  // the edge from Build to Publish would run straight through a wide Deploy.
  const axis = (item: Item) => (item[0].parallel === "ship" ? "x" : stackAxis);
  const itemW = (item: Item) =>
    axis(item) === "y"
      ? Math.max(...item.map((node, i) => size(node).w + stairOffset(item, size, i, stairs)))
      : item.reduce((sum, node, i) => sum + (i > 0 ? STACK_GAP : 0) + size(node).w, 0);
  const itemH = (item: Item) =>
    axis(item) === "y"
      ? item.reduce((sum, node, i) => sum + (i > 0 ? STACK_GAP : 0) + size(node).h, 0)
      : Math.max(...item.map((node) => size(node).h));
  const rows: Item[][] = [[]];
  let x = 0;
  for (const item of items) {
    const w = itemW(item);
    const row = rows[rows.length - 1];
    if (row.length > 0 && (x + gap + w > width || row.length >= perRow)) {
      rows.push([item]);
      x = w;
    } else {
      x += (row.length > 0 ? gap : 0) + w;
      row.push(item);
    }
  }
  const boxes: (Box & { row: number })[] = [];
  let y = 0;
  let blockW = 0;
  rows.forEach((row, index) => {
    const rowH = Math.max(...row.map(itemH));
    const rowW = row.reduce((sum, item, i) => sum + (i > 0 ? gap : 0) + itemW(item), 0);
    const reversed = snake && index % 2 === 1;
    let cx = (reversed ? Math.max(0, blockW - rowW) : 0) + (index % 2 === 1 ? jitter : 0);
    const ordered = reversed ? [...row].reverse() : row;
    for (const item of ordered) {
      const w = itemW(item);
      const h = itemH(item);
      if (axis(item) === "y") {
        let cy = y + (rowH - h) / 2;
        item.forEach((node, i) => {
          const s = size(node);
          boxes.push({ id: node.id, x: cx + (stairs ? stairOffset(item, size, i, stairs) : (w - s.w) / 2), y: cy, w: s.w, h: s.h, row: index });
          cy += s.h + STACK_GAP;
        });
      } else {
        let ix = cx;
        for (const node of item) {
          const s = size(node);
          boxes.push({ id: node.id, x: ix, y: axis(item) !== stackAxis ? y : y + (rowH - s.h) / 2, w: s.w, h: s.h, row: index });
          ix += s.w + STACK_GAP;
        }
      }
      cx += w + gap;
    }
    blockW = Math.max(blockW, rowW + (index % 2 === 1 ? jitter : 0));
    y += rowH + rowGap;
  });
  return { boxes, w: blockW, h: y - rowGap, rows: rows.length };
}

/** Group consecutive stages that share a `parallel` key into one stack. */
function stackParallel(nodes: DiagramNode[]): Item[] {
  const items: Item[] = [];
  for (const node of nodes) {
    const last = items[items.length - 1];
    if (node.parallel && last && last[0].parallel === node.parallel) last.push(node);
    else items.push([node]);
  }
  return items;
}

/**
 * Sections stacked top to bottom, each wrapped to the target width:
 *   1. pipeline stages (variant "stage"), snake-wrapped so the chain reads on;
 *   2. every group's members, wrapped inside the group's frame;
 *   3. whatever is left (infra-as-code), in authored order.
 * The natural width is the target, so the canvas never scales this view.
 */
function flow(view: DiagramView, size: (node: DiagramNode) => Size, targetWidth?: number): Layout {
  const width = Math.max(targetWidth ?? 640, 240);
  const inGroup = new Set(view.groups.flatMap((group) => group.members));
  const stages = view.nodes.filter((node) => node.variant === "stage");
  const rest = view.nodes.filter((node) => node.variant !== "stage" && !inGroup.has(node.id));

  const boxes = new Map<string, Box>();
  const rank = new Map<string, number>();
  let y = 0;
  let level = 0;
  const place = (run: ReturnType<typeof wrapRun>, dx: number, dy: number) => {
    for (const { row, ...box } of run.boxes) {
      boxes.set(box.id, { ...box, x: box.x + dx, y: box.y + dy });
      rank.set(box.id, level + row);
    }
    level += run.rows;
  };

  if (stages.length > 0) {
    // TB: one step per row (Dev, 2026-09-10: a serial chain), Deploy ‖
    // Publish side by side; generous row gaps so a group frame and its label
    // fit between rows and no edge label lands under a box.
    const vertical = view.direction === "TB";
    const run = vertical
      ? wrapRun(stackParallel(stages), size, width, { gap: STEP_GAP, perRow: 1, stairs: 44, rowGap: GROUP_PAD + GROUP_LABEL + 36 })
      : wrapRun(stackParallel(stages), size, width, { snake: true, gap: STEP_GAP });
    // Room above for a stage group's label, below for its frame.
    const framed = view.groups.some((group) => group.members.some((id) => stages.some((stage) => stage.id === id)));
    const inset = framed ? GROUP_PAD : 0;
    place(run, 0, y + inset);
    y += inset + run.h + (framed ? GROUP_PAD + GROUP_LABEL : 0) + FLOW_SECTION_GAP;
  }
  for (const group of view.groups) {
    const members = group.members.map((id) => view.nodes.find((node) => node.id === id)).filter((n): n is DiagramNode => !!n);
    if (members.length === 0) continue;
    // A group of pipeline stages (Nx Cloud) is drawn around them in the
    // strip, not as a section of its own.
    if (members.every((node) => node.variant === "stage")) continue;
    const run = wrapRun(members.map((node) => [node]), size, width - GROUP_PAD * 2, {
      gap: GAP_X,
      perRow: group.wrap ?? Infinity,
      jitter: group.jitter ?? 0,
    });
    place(run, GROUP_PAD, y + GROUP_PAD);
    y += run.h + GROUP_PAD * 2 + GROUP_LABEL + FLOW_SECTION_GAP;
  }
  if (rest.length > 0) {
    const run = wrapRun(rest.map((node) => [node]), size, width, { gap: GAP_X });
    place(run, 0, y);
    y += run.h;
  }
  hugMembers(view, boxes);
  return finish(boxes, rank);
}

function finish(boxes: Map<string, Box>, rank: Map<string, number>, routes = new Map<string, Point[]>()): Layout {
  const all = [...boxes.values()];
  const left = Math.min(0, ...all.map((b) => b.x));
  const top = Math.min(0, ...all.map((b) => b.y));
  const right = Math.max(0, ...all.map((b) => b.x + b.w));
  const bottom = Math.max(0, ...all.map((b) => b.y + b.h));
  return { boxes, left, top, width: right - left, height: bottom - top, rank, routes };
}

function hugMembers(view: DiagramView, boxes: Map<string, Box>) {
  for (const group of view.groups) {
    const members = group.members.map((id) => boxes.get(id)).filter((b): b is Box => !!b);
    if (members.length === 0) continue;
    const x = Math.min(...members.map((b) => b.x)) - GROUP_PAD;
    // The label rides the BOTTOM rule (Dev, 2026-09-10), so the frame
    // reserves its room below the members, not above.
    const y = Math.min(...members.map((b) => b.y)) - GROUP_PAD;
    const r = Math.max(...members.map((b) => b.x + b.w)) + GROUP_PAD;
    const btm = Math.max(...members.map((b) => b.y + b.h)) + GROUP_PAD + GROUP_LABEL;
    boxes.set(group.id, { id: group.id, x, y, w: r - x, h: btm - y });
  }
}

/* ------------------------------------------------------------------ grid */

function grid(view: DiagramView, size: (node: DiagramNode) => Size, targetWidth?: number): Layout {
  const maxW = Math.max(...view.nodes.map((n) => size(n).w), 96);
  const maxH = Math.max(...view.nodes.map((n) => size(n).h), EST_H);
  const unitY = maxH + GAP_Y;
  // Whole-number columns are ordinal: an authored gap (col 0 and col 2,
  // nothing at 1) does not leave an empty slot. Fractional columns are
  // deliberate offsets (compactRows centres short rows with .5 steps) and
  // are kept as-is. Rows always keep their authored spacing — the gaps
  // there make room for group labels.
  const cols = view.nodes.map((n) => n.col ?? 0);
  const ordinal = cols.every(Number.isInteger);
  const columns = [...new Set(cols)].sort((a, b) => a - b);
  const minCol = Math.min(0, ...cols);
  const columnIndex = (col: number) => (ordinal ? columns.indexOf(col) : col - minCol);
  // Rows likewise: a whole-number row nobody survived in (a project with no
  // ingress tier) closes up instead of leaving a band of nothing.
  const rowsUsed = view.nodes.map((n) => n.row ?? 0);
  const rowsOrdinal = rowsUsed.every(Number.isInteger);
  const rowList = [...new Set(rowsUsed)].sort((a, b) => a - b);
  const minRow = Math.min(0, ...rowsUsed);
  const rowIndex = (row: number) => (rowsOrdinal ? rowList.indexOf(row) : row - minRow);
  // Column pitch: natural, or wider so the last column reaches the target.
  const lastCol = Math.max(...cols.map(columnIndex));
  const natural = maxW + GAP_X;
  const stretched = targetWidth && lastCol > 0 ? (targetWidth - maxW) / lastCol : natural;
  const unitX = Math.min(Math.max(natural, stretched), natural * MAX_SPREAD);

  const boxes = new Map<string, Box>();
  const rank = new Map<string, number>();
  for (const node of view.nodes) {
    const { w, h } = size(node);
    const col = columnIndex(node.col ?? 0);
    const row = rowIndex(node.row ?? 0);
    // Centre each box in its slot, so narrow boxes still line up on the grid.
    boxes.set(node.id, { id: node.id, x: col * unitX + (maxW - w) / 2, y: row * unitY + (maxH - h) / 2, w, h });
    rank.set(node.id, Math.round(row));
  }
  hugMembers(view, boxes);
  return finish(boxes, rank);
}

/* --------------------------------------------------------------- layered */

function layered(view: DiagramView, size: (node: DiagramNode) => Size, targetWidth?: number): Layout {
  const g = new Graph({ compound: true, multigraph: false });
  g.setGraph({
    rankdir: view.direction,
    // Cycles: drop the cheapest edges for ranking only. Requests and data
    // paths define the hierarchy; events, telemetry and other feedback are
    // what get drawn "backwards" (Firebase pushing real-time updates to the
    // client that also talks to the backend, say).
    acyclicer: "greedy",
    nodesep: 48,
    ranksep: GAP_Y,
    edgesep: 12,
    marginx: 0,
    marginy: 0,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of view.nodes) {
    const { w, h } = size(node);
    g.setNode(node.id, { width: w, height: h });
  }
  for (const group of view.groups) {
    g.setNode(group.id, { label: group.label, clusterLabelPos: "top", paddingLeft: GROUP_PAD, paddingRight: GROUP_PAD, paddingBottom: GROUP_PAD + GROUP_LABEL, paddingTop: GROUP_PAD });
    for (const member of group.members) g.setParent(member, group.id);
  }
  for (const edge of view.edges) {
    // Edges to/from a group attach to the group node itself; dagre accepts
    // that for compound graphs.
    if (edge.from === edge.to) continue;
    g.setEdge(edge.from, edge.to, { weight: RANK_WEIGHT[edge.type] });
  }

  dagreLayout(g);

  // Spread: scale box centres (not sizes) sideways so the drawing reaches the
  // target width. Waypoints scale with them so routed edges still line up.
  const placedNodes = view.nodes.map((node) => ({ node, placed: g.node(node.id) })).filter((entry) => entry.placed);
  const naturalWidth = Math.max(...placedNodes.map(({ node, placed }) => placed.x + size(node).w / 2), 1);
  const stretchable = Math.max(...placedNodes.map(({ placed }) => placed.x), 1);
  const rightW = placedNodes.reduce((w, { node, placed }) => (placed.x >= stretchable ? size(node).w : w), 0);
  const columnsPlaced = new Set(placedNodes.map(({ placed }) => Math.round(placed.x))).size;
  const spread =
    targetWidth && targetWidth > naturalWidth && columnsPlaced > 1
      ? Math.min((targetWidth - rightW / 2) / stretchable, MAX_SPREAD)
      : 1;
  const sx = (x: number) => x * spread;

  const boxes = new Map<string, Box>();
  const rank = new Map<string, number>();
  const along = (p: { x: number; y: number }) => Math.round((view.direction === "LR" ? p.x : p.y) / 10);
  const depths: number[] = [];
  for (const node of view.nodes) {
    const placed = g.node(node.id);
    if (!placed) continue;
    const { w, h } = size(node);
    boxes.set(node.id, { id: node.id, x: sx(placed.x) - w / 2, y: placed.y - h / 2, w, h });
    depths.push(along(placed));
  }
  // Rank = position along the flow, quantised, for the load-in stagger.
  const levels = [...new Set(depths)].sort((a, b) => a - b);
  for (const node of view.nodes) {
    const placed = g.node(node.id);
    if (placed) rank.set(node.id, levels.indexOf(along(placed)));
  }
  // Groups: trust the members' bounding box (dagre's cluster box is the
  // same thing plus padding, but this keeps both layouts identical).
  hugMembers(view, boxes);
  const routes = new Map<string, Point[]>();
  for (const edge of view.edges) {
    const points = g.edge(edge.from, edge.to)?.points;
    // Only long edges (routed through dummy ranks) need waypoints; a direct
    // neighbour is drawn box-to-box like everything else.
    if (points && points.length > 3) routes.set(routeKey(edge.from, edge.to), points.map((p: Point) => ({ x: sx(p.x), y: p.y })));
  }
  return finish(boxes, rank, routes);
}
