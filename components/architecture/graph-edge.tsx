"use client";

import { CATEGORY, EDGE_STYLE, type Box, type DiagramEdge, type NodeCategory, type Point } from "@/lib/architecture";

const CATEGORIES = Object.keys(CATEGORY) as NodeCategory[];

/** Shortest spline handle — how far an edge travels square to the box
 *  before it may bend. */
const MIN_HANDLE = 36;

const sign = (n: number) => (n < 0 ? -1 : 1);

/**
 * Wire between the facing sides of two boxes — straight when they overlap on
 * one axis, otherwise a spline that leaves and arrives square to the sides.
 * Returns the path and where its label goes.
 */
export function edgePath(a: Box, b: Box, prefer: "auto" | "vertical" = "auto") {
  const acx = a.x + a.w / 2, acy = a.y + a.h / 2;
  const bcx = b.x + b.w / 2, bcy = b.y + b.h / 2;
  const dx = bcx - acx, dy = bcy - acy;
  const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);

  if (overlapX > 24 && overlapY <= 0) {
    // Stacked: one straight vertical line through the shared span.
    const x = (Math.max(a.x, b.x) + Math.min(a.x + a.w, b.x + b.w)) / 2;
    const y1 = dy > 0 ? a.y + a.h : a.y;
    const y2 = dy > 0 ? b.y : b.y + b.h;
    // Label left of the line by default; right of it when the left is
    // taken (or is the canvas edge — see the wall the canvas passes in).
    const ly = (y1 + y2) / 2 + 3;
    return {
      d: `M${x} ${y1} L${x} ${y2}`,
      lx: x - 7,
      ly,
      anchor: "end" as const,
      spots: [
        { lx: x - 7, ly, anchor: "end" as const },
        { lx: x + 7, ly, anchor: "start" as const },
      ],
      labelled: Math.abs(y2 - y1) >= 20,
    };
  }
  if (overlapY > 24 && overlapX <= 0) {
    // Side by side: one straight horizontal line through the shared span.
    // The label sits above the line; when the gap is narrower than a label
    // could be, above BOTH boxes instead, so it never lies across them.
    const y = (Math.max(a.y, b.y) + Math.min(a.y + a.h, b.y + b.h)) / 2;
    const x1 = dx > 0 ? a.x + a.w : a.x;
    const x2 = dx > 0 ? b.x : b.x + b.w;
    const gap = Math.abs(x2 - x1);
    const ly = gap >= 72 ? y - 7 : Math.min(a.y, b.y) - 6;
    return { d: `M${x1} ${y} L${x2} ${y}`, lx: (x1 + x2) / 2, ly, anchor: "middle" as const, labelled: gap >= 24 };
  }
  // Otherwise a spline that leaves and arrives square to the box sides, so
  // the arrowhead always points straight into its target. The handles are at
  // least MIN_HANDLE long: a short, steep hop still turns fully before it
  // lands instead of arriving at an angle.
  let x1: number, y1: number, x2: number, y2: number, d: string;
  // Vertical flows (the pipeline): a box in a lower row is always entered
  // from the top, never from the side through its neighbours.
  const sideways = prefer === "vertical" && overlapY <= 0 ? false : Math.abs(dx) >= Math.abs(dy);
  if (sideways) {
    x1 = dx > 0 ? a.x + a.w : a.x;
    y1 = acy;
    x2 = dx > 0 ? b.x : b.x + b.w;
    y2 = bcy;
    const c = sign(x2 - x1) * Math.max(Math.abs(x2 - x1) / 2, MIN_HANDLE);
    d = `M${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`;
  } else {
    // In a vertical flow the boxes step sideways (a staircase), so leave and
    // enter near the side that faces the other box — the part of the edge
    // no neighbour covers — instead of dead centre.
    const inset = 16;
    const stepped = prefer === "vertical" && Math.abs(dx) > 12;
    x1 = stepped ? (dx > 0 ? a.x + a.w - inset : a.x + inset) : acx;
    x2 = stepped ? (dx > 0 ? b.x + b.w - inset : b.x + inset) : bcx;
    y1 = dy > 0 ? a.y + a.h : a.y;
    y2 = dy > 0 ? b.y : b.y + b.h;
    const c = sign(y2 - y1) * Math.max(Math.abs(y2 - y1) / 2, MIN_HANDLE);
    d = `M${x1} ${y1} C ${x1} ${y1 + c}, ${x2} ${y2 - c}, ${x2} ${y2}`;
  }
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  // Candidate label spots along the chord, beside the line: rightward edges
  // try the target end first, leftward the source end, so two edges crossing
  // one gap start from different ends; the caller picks the first spot
  // clear of every box.
  const order = x2 > x1 ? [0.74, 0.5, 0.28] : [0.28, 0.5, 0.74];
  const spots = order.map((t) => {
    const mx = x1 + (x2 - x1) * t, my = y1 + (y2 - y1) * t;
    return { lx: mx + nx * 11, ly: my + ny * 11 + 3, anchor: "middle" as const };
  });
  return { d, lx: spots[0].lx, ly: spots[0].ly, spots, anchor: "middle" as const, labelled: len >= 44 };
}

export type LabelSpot = { lx: number; ly: number; anchor?: "start" | "middle" | "end" };

/** The box a label occupies, for collision checks. */
export function labelRect(spot: LabelSpot, label: string, fallback: "start" | "middle" | "end" = "middle"): Box {
  const anchor = spot.anchor ?? fallback;
  const w = label.length * 6.4 + 8, h = 14;
  const x = anchor === "middle" ? spot.lx - w / 2 : anchor === "end" ? spot.lx - w : spot.lx;
  return { id: label, x, y: spot.ly - 11, w, h };
}

const hits = (r: Box, others: Box[]) => others.some((b) => r.x < b.x + b.w && r.x + r.w > b.x && r.y < b.y + b.h && r.y + r.h > b.y);

/** The first candidate spot whose label box overlaps none of `avoid` (nodes
 *  and labels already placed); when every spot collides, the first one
 *  nudged up until it clears, so two labels never sit on each other. */
export function clearSpot(spots: LabelSpot[], label: string, avoid: Box[], fallback: "start" | "middle" | "end" = "middle"): LabelSpot {
  const clear = spots.find((spot) => !hits(labelRect(spot, label, fallback), avoid));
  if (clear) return clear;
  let spot = spots[0];
  for (let i = 0; i < 6 && hits(labelRect(spot, label, fallback), avoid); i++) spot = { ...spot, ly: spot.ly - 14 };
  return spot;
}

/** A smoothed path through the layout engine's waypoints (long edges that
 *  dagre steered around the boxes in between), label at the middle bend. */
export function routedPath(points: Point[]) {
  const [first, ...rest] = points;
  let d = `M${first.x} ${first.y}`;
  for (let i = 0; i < rest.length; i++) {
    const p = rest[i];
    const prev = i === 0 ? first : rest[i - 1];
    if (i === rest.length - 1) {
      d += ` L${p.x} ${p.y}`;
    } else {
      // Bend through each waypoint: straight to just short of it, then a
      // quadratic around it — reads as a wire, not a spline.
      const next = rest[i + 1];
      const inX = p.x - (p.x - prev.x) * 0.35, inY = p.y - (p.y - prev.y) * 0.35;
      const outX = p.x + (next.x - p.x) * 0.35, outY = p.y + (next.y - p.y) * 0.35;
      d += ` L${inX} ${inY} Q${p.x} ${p.y} ${outX} ${outY}`;
    }
  }
  // Label on the final approach, beside the line on the side away from the
  // run the route just left (the space next to a bend is usually clear).
  const a = points[points.length - 2], b = points[points.length - 1];
  const lx = (a.x + b.x) / 2, ly = (a.y + b.y) / 2;
  const leftward = b.x < a.x;
  return { d, lx: lx + (leftward ? 7 : -7), ly: ly + 3, anchor: leftward ? ("start" as const) : ("end" as const), labelled: true };
}

interface GraphEdgeProps {
  edge: DiagramEdge;
  from: Box;
  to: Box;
  /** Category of the box the edge leaves — sets its colour. */
  origin: NodeCategory;
  /** Enter lower boxes from the top (vertical flows). */
  prefer?: "auto" | "vertical";
  /** Where the label goes — resolved by the canvas, which sees every other label. */
  labelAt?: LabelSpot;
  /** Which layer to draw: the wire, or its label. */
  part: "line" | "label";
  route?: Point[];
  /** Marker id prefix — several canvases on one page need distinct markers. */
  markers: string;
  hot: boolean;
  dimmed: boolean;
}

/** One relationship: the colour of the box it leaves (so every arrow out of
 *  Identity is ember-orange, out of the backend violet), the dash and weight
 *  of its type (kinds.ts EDGE_STYLE). Lit in the accent when either end is
 *  selected. */
/**
 * One relationship, in two layers: `part="line"` draws the wire (rendered
 * under the boxes), `part="label"` draws its label (rendered in a second
 * SVG above the boxes, so a label is never hidden behind a node).
 */
export function GraphEdge({ edge, from, to, origin, prefer = "auto", labelAt, route, markers, hot, dimmed, part }: GraphEdgeProps) {
  const style = EDGE_STYLE[edge.type];
  const path = route ? routedPath(route) : edgePath(from, to, prefer);
  const { d, anchor, labelled } = path;
  const stroke = hot ? "var(--color-ember)" : CATEGORY[origin].color;
  const opacity = dimmed ? 0.2 : hot ? 1 : 0.7;
  if (part === "label") {
    if (!edge.label || !labelled) return null;
    const spot = labelAt ?? { lx: path.lx, ly: path.ly };
    return (
      <text
        x={spot.lx}
        y={spot.ly}
        textAnchor={spot.anchor ?? anchor}
        className="font-mono text-[10px] tracking-[0.04em] transition-opacity"
        fill={stroke}
        opacity={dimmed ? 0.2 : 1}
        style={{ paintOrder: "stroke", stroke: "var(--color-ground)", strokeWidth: 4 }}
      >
        {edge.label}
      </text>
    );
  }
  return (
    <path
      className="transition-opacity"
      opacity={opacity}
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={hot ? style.width + 0.5 : style.width}
      strokeDasharray={style.dash}
      strokeLinecap="round"
      markerEnd={`url(#${markers}-arrow-${hot ? "hot" : origin})`}
    />
  );
}

/** Arrowheads for one canvas; render once inside its <svg>. */
export function EdgeMarkers({ id }: { id: string }) {
  const heads: [string, string][] = [["hot", "var(--color-ember)"], ...CATEGORIES.map((category): [string, string] => [category, CATEGORY[category].color])];
  return (
    <defs>
      {heads.map(([suffix, color]) => (
        <marker key={suffix} id={`${id}-arrow-${suffix}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          {/* Solid heads (Dev, 2026-09-10). */}
          <path d="M0.5 0.8 L7 4 L0.5 7.2 Z" fill={color} stroke={color} strokeWidth="0.6" strokeLinejoin="round" />
        </marker>
      ))}
    </defs>
  );
}
