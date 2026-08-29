import {
  TIMELINE_END,
  TIMELINE_START,
  compareEntries,
  entryEnd,
  entryStart,
  isOngoing,
  milestones,
  monthIndex,
  timeline,
  type Milestone,
  type TimelineEntry,
} from "@/content/timeline";

/**
 * Git-graph layout for the career timeline.
 *
 * The old version mapped time to pixels at a fixed rate, which failed in both
 * directions: 2021–22 packs six engagements into less vertical space than
 * their cards need (cards drifted off their branches), while mid-2023 to
 * mid-2025 is one long branch with nothing beside it (dead scroll).
 *
 * This version inverts the dependency. Cards are laid out first, in reading
 * order, and a monotonic piecewise-linear month→y mapping is then fitted
 * through their anchors. The graph follows the cards, so a leader can always
 * reach its branch. Time still flows one way — present at the top, the past
 * below — but pixels-per-month varies: busy periods stretch, quiet ones
 * compress toward MIN_PX_PER_MONTH.
 *
 * Pure and deterministic; runs once at build time.
 */

export const TOP_PAD = 48;
/** Left gutter reserved for year labels. */
export const YEAR_COL = 54;
export const SPINE_X = 74;
export const LANE_GAP = 52;

const CARD_H = 162; // measured: title + dates + 2-line summary + link + gaps
const CARD_GAP = 16;
const MILESTONE_H = 44;
/** The line inside a card that should meet its point in time (the title). */
const CARD_ANCHOR = 24;
const MILESTONE_ANCHOR = 10;

/** Floor for compressed, quiet stretches of the axis. */
const MIN_PX_PER_MONTH = 7;
/** Two distinct event months never share a y closer than this. */
const EVENT_GAP = 16;
/** Junction dots on the spine keep at least this much clearance. */
const JUNCTION_GAP = 12;
const ELBOW = 26;

const END_M = monthIndex(TIMELINE_END);
const START_M = monthIndex(TIMELINE_START);

/* ------------------------------------------------------------------- types */

export interface BranchSegment {
  d: string;
  /** True for the dotted stretch where an engagement paused. */
  dashed: boolean;
  /** Approximate path length, for the draw-in animation. */
  length: number;
}

export interface LaidOutEntry {
  entry: TimelineEntry;
  /** Stable key for hover pairing between branch, leader and card. */
  key: string;
  lane: number;
  laneX: number;
  segments: BranchSegment[];
  /** Where the branch meets the spine (start = out, end = in). */
  junctions: { y: number; kind: "out" | "in" }[];
  /** y of the open cap for still-running work, null when merged back. */
  openY: number | null;
  /** Vertical extent of the branch on its lane, for hit areas. */
  branchTop: number;
  branchBottom: number;
  pauses: { yTop: number; yBottom: number }[];
  cardY: number;
  leader: string;
}

export interface LaidOutMilestone {
  milestone: Milestone;
  dotY: number;
  labelY: number;
  leader: string | null;
}

export interface YearTick {
  year: number;
  y: number;
}

export interface TimelineLayout {
  entries: LaidOutEntry[];
  milestones: LaidOutMilestone[];
  years: YearTick[];
  height: number;
  laneCount: number;
  graphWidth: number;
  cardX: number;
  spineTop: number;
  spineBottom: number;
}

/* ----------------------------------------------------------- reading order */

interface EntryItem {
  kind: "entry";
  entry: TimelineEntry;
  month: number | null;
  height: number;
  anchorOffset: number;
}

interface MilestoneItem {
  kind: "milestone";
  milestone: Milestone;
  month: number | null;
  height: number;
  anchorOffset: number;
}

type StackItem = EntryItem | MilestoneItem;

/**
 * Top-to-bottom order of everything in the right-hand column. Still-running
 * work is pinned at the top under the "Present" label (month: null); the rest
 * interleaves finished projects and milestones by date, newest first.
 */
function readingOrder(): StackItem[] {
  const now = milestones.find((m) => m.kind === "now");
  const dated: StackItem[] = [
    ...timeline
      .filter((e) => !isOngoing(e))
      .map(
        (entry): EntryItem => ({
          kind: "entry",
          entry,
          month: entryStart(entry),
          height: CARD_H,
          anchorOffset: CARD_ANCHOR,
        }),
      ),
    ...milestones
      .filter((m) => m.kind !== "now")
      .map(
        (milestone): MilestoneItem => ({
          kind: "milestone",
          milestone,
          month: monthIndex(milestone.at),
          height: MILESTONE_H,
          anchorOffset: MILESTONE_ANCHOR,
        }),
      ),
  ].sort((a, b) => (b.month ?? 0) - (a.month ?? 0) || (a.kind === "entry" ? -1 : 1));

  return [
    ...(now
      ? [
          {
            kind: "milestone",
            milestone: now,
            month: null,
            height: MILESTONE_H,
            anchorOffset: MILESTONE_ANCHOR,
          } satisfies MilestoneItem,
        ]
      : []),
    ...timeline
      .filter(isOngoing)
      .sort(compareEntries)
      .map(
        (entry): EntryItem => ({
          kind: "entry",
          entry,
          month: null,
          height: CARD_H,
          anchorOffset: CARD_ANCHOR,
        }),
      ),
    ...dated,
  ];
}

/* -------------------------------------------------------------- time scale */

/**
 * First pass: stack items top-down with uniform spacing (plus a time reserve
 * so long quiet gaps keep some height) and record where each dated item wants
 * its moment in time to sit.
 */
function stackAnchors(items: StackItem[]): Map<number, number> {
  const anchors = new Map<number, number>();
  let cursor = TOP_PAD - MILESTONE_H;
  let last: { month: number; y: number } | null = null;

  for (const item of items) {
    let top = cursor;
    if (item.month !== null) {
      if (last) {
        top = Math.max(
          top,
          last.y + (last.month - item.month) * MIN_PX_PER_MONTH - item.anchorOffset,
        );
      }
      const y = top + item.anchorOffset;
      if (!anchors.has(item.month)) anchors.set(item.month, y);
      last = { month: item.month, y };
    }
    cursor = top + item.height + CARD_GAP;
  }

  return anchors;
}

interface EventPoint {
  month: number;
  y: number;
}

/** Every month where something happens — a span starts or ends, a milestone. */
function collectEventMonths(): number[] {
  const months = new Set<number>([END_M, START_M]);
  for (const entry of timeline) {
    for (const span of entry.spans) {
      months.add(monthIndex(span.start));
      if (span.end) months.add(monthIndex(span.end));
    }
  }
  for (const m of milestones) months.add(monthIndex(m.at));
  return [...months].sort((a, b) => b - a);
}

/**
 * Second pass: sweep event months from the present downward, honouring the
 * card anchors while keeping every pair of events visually separable. The
 * result is the set of control points of the piecewise-linear time scale.
 */
function sweepEvents(anchors: Map<number, number>): EventPoint[] {
  const points: EventPoint[] = [];
  let prev: EventPoint | null = null;

  for (const month of collectEventMonths()) {
    let y = TOP_PAD;
    if (prev) {
      y = prev.y + Math.max(EVENT_GAP, (prev.month - month) * MIN_PX_PER_MONTH);
    }
    const anchored = anchors.get(month);
    if (anchored !== undefined) y = Math.max(y, anchored);

    const point = { month, y };
    points.push(point);
    prev = point;
  }

  return points;
}

/** Monotonic month→y interpolation over the swept control points. */
function makeScale(points: EventPoint[]): (month: number) => number {
  return (month) => {
    const first = points[0];
    const last = points[points.length - 1];
    if (month >= first.month) return first.y;
    if (month <= last.month) return last.y;
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      if (month <= a.month && month >= b.month) {
        const t = (a.month - month) / (a.month - b.month);
        return a.y + t * (b.y - a.y);
      }
    }
    return last.y;
  };
}

/* ------------------------------------------------------------------- lanes */

/**
 * Interval packing, longest engagement first, so long-lived and main work
 * hugs the spine and short stints sit further out.
 */
function assignLanes(): Map<TimelineEntry, number> {
  const ordered = [...timeline].sort(
    (a, b) =>
      entryEnd(b) - entryStart(b) - (entryEnd(a) - entryStart(a)) ||
      entryStart(a) - entryStart(b),
  );
  const lanes: { start: number; end: number }[][] = [];
  const assigned = new Map<TimelineEntry, number>();

  for (const entry of ordered) {
    const start = entryStart(entry);
    const end = entryEnd(entry);
    let lane = lanes.findIndex(
      (occupied) => !occupied.some((range) => start <= range.end && end >= range.start),
    );
    if (lane === -1) {
      lanes.push([]);
      lane = lanes.length - 1;
    }
    lanes[lane].push({ start, end });
    assigned.set(entry, lane + 1); // lane 0 is the spine
  }

  return assigned;
}

/* ------------------------------------------------------------------ layout */

export function buildTimelineLayout(): TimelineLayout {
  const items = readingOrder();
  const anchors = stackAnchors(items);
  const scale = makeScale(sweepEvents(anchors));

  const laneOf = assignLanes();
  const laneCount = Math.max(...laneOf.values(), 1);
  const graphWidth = SPINE_X + (laneCount + 1) * LANE_GAP;
  const cardX = graphWidth + 44;

  // Final placement: same stacking, but each dated item now snaps to the
  // fitted scale, so cards sit exactly beside their moment on the graph.
  const tops = new Map<StackItem, number>();
  let cursor = TOP_PAD - MILESTONE_H;
  for (const item of items) {
    let top = cursor;
    if (item.month !== null) top = Math.max(top, scale(item.month) - item.anchorOffset);
    tops.set(item, top);
    cursor = top + item.height + CARD_GAP;
  }

  // Spine junctions, nudged apart when two share the same month's y.
  const junctionYByKey = new Map<string, number>();
  const rawJunctions = timeline
    .flatMap((entry) => {
      const out = [{ key: `${entry.label}:out`, y: scale(entryStart(entry)) }];
      if (!isOngoing(entry)) out.push({ key: `${entry.label}:in`, y: scale(entryEnd(entry)) });
      return out;
    })
    .sort((a, b) => a.y - b.y);
  let prevJunctionY = -Infinity;
  for (const junction of rawJunctions) {
    const y = Math.max(junction.y, prevJunctionY + JUNCTION_GAP);
    junctionYByKey.set(junction.key, y);
    prevJunctionY = y;
  }

  const entries: LaidOutEntry[] = items
    .filter((item): item is EntryItem => item.kind === "entry")
    .map((item) => {
      const { entry } = item;
      const lane = laneOf.get(entry) ?? 1;
      const laneX = SPINE_X + lane * LANE_GAP;
      const cardY = tops.get(item) ?? TOP_PAD;
      const open = isOngoing(entry);
      const yOut = junctionYByKey.get(`${entry.label}:out`) ?? scale(entryStart(entry));
      const yIn = open ? null : (junctionYByKey.get(`${entry.label}:in`) ?? scale(entryEnd(entry)));

      // Spans as vertical extents on the lane, earliest (lowest) first.
      const parts = entry.spans
        .map((span) => ({
          yBottom: scale(monthIndex(span.start)),
          yTop: span.end ? scale(monthIndex(span.end)) : TOP_PAD,
        }))
        .sort((a, b) => b.yBottom - a.yBottom);

      const branchBottom = parts[0].yBottom;
      const branchTop = parts[parts.length - 1].yTop;
      const r = Math.min(ELBOW, Math.max(12, (branchBottom - branchTop) / 3));
      const dx = laneX - SPINE_X;
      const dxc = dx * 0.6;

      const segments: BranchSegment[] = [];
      const junctions: LaidOutEntry["junctions"] = [{ y: yOut, kind: "out" }];
      const pauses: LaidOutEntry["pauses"] = [];

      parts.forEach((part, i) => {
        const isFirst = i === 0;
        const isLast = i === parts.length - 1;
        const vBottom = isFirst ? part.yBottom - r : part.yBottom;
        const vTop = isLast && !open ? part.yTop + r : part.yTop;

        let d: string;
        let length = Math.max(0, vBottom - vTop);
        if (isFirst) {
          // Leave the spine horizontally, arrive on the lane vertically.
          d = `M ${SPINE_X} ${yOut} C ${SPINE_X + dxc} ${yOut}, ${laneX} ${vBottom + (yOut - vBottom) * 0.45}, ${laneX} ${vBottom} L ${laneX} ${vTop}`;
          length += dx + r;
        } else {
          d = `M ${laneX} ${vBottom} L ${laneX} ${vTop}`;
        }
        if (isLast && !open && yIn !== null) {
          d += ` C ${laneX} ${vTop - (vTop - yIn) * 0.45}, ${SPINE_X + dxc} ${yIn}, ${SPINE_X} ${yIn}`;
          length += dx + r;
        }
        segments.push({ d, dashed: false, length: length + 24 });
      });

      for (let i = 0; i < parts.length - 1; i += 1) {
        const gapBottom = parts[i].yTop;
        const gapTop = parts[i + 1].yBottom;
        if (gapBottom - gapTop > 2) {
          pauses.push({ yTop: gapTop, yBottom: gapBottom });
          segments.push({
            d: `M ${laneX} ${gapBottom} L ${laneX} ${gapTop}`,
            dashed: true,
            length: gapBottom - gapTop,
          });
        }
      }

      if (yIn !== null) junctions.push({ y: yIn, kind: "in" });

      // Leader from the branch to the card's title line. Clamped onto the
      // branch; if the card drifted, an elbow bridges the difference.
      const titleY = cardY + CARD_ANCHOR;
      const lo = branchTop + (open ? 4 : r + 4);
      const hi = branchBottom - r - 4;
      const attach = lo > hi ? (branchTop + branchBottom) / 2 : Math.min(Math.max(titleY, lo), hi);
      const leader =
        Math.abs(attach - titleY) < 1
          ? `M ${laneX + 6} ${titleY} H ${cardX - 14}`
          : `M ${laneX + 6} ${attach} H ${cardX - 30} V ${titleY} H ${cardX - 14}`;

      return {
        entry,
        key: entry.slug ?? entry.label.toLowerCase(),
        lane,
        laneX,
        segments,
        junctions,
        openY: open ? branchTop : null,
        branchTop,
        branchBottom,
        pauses,
        cardY,
        leader,
      };
    });

  const laidOutMilestones: LaidOutMilestone[] = items
    .filter((item): item is MilestoneItem => item.kind === "milestone")
    .map((item) => {
      const { milestone } = item;
      const labelY = tops.get(item) ?? TOP_PAD;
      const dotY = milestone.kind === "now" ? TOP_PAD : scale(monthIndex(milestone.at));
      const leader =
        milestone.kind === "now"
          ? null
          : `M ${SPINE_X + 7} ${dotY} L ${cardX - 14} ${labelY + MILESTONE_ANCHOR}`;
      return { milestone, dotY, labelY, leader };
    });

  const spineTop = TOP_PAD;
  const spineBottom = scale(START_M);
  const height = Math.max(spineBottom + 80, cursor + 24);

  const years: YearTick[] = [];
  let lastTickY = -Infinity;
  for (
    let year = Number(TIMELINE_END.slice(0, 4));
    year >= Number(TIMELINE_START.slice(0, 4));
    year -= 1
  ) {
    const y = scale(year * 12); // monthIndex of `${year}-01`
    if (y < spineTop - 8 || y > spineBottom + 8) continue;
    if (y - lastTickY < 30) continue;
    years.push({ year, y });
    lastTickY = y;
  }

  return {
    entries,
    milestones: laidOutMilestones,
    years,
    height,
    laneCount,
    graphWidth,
    cardX,
    spineTop,
    spineBottom,
  };
}
