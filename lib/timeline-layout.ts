import {
  TIMELINE_END,
  TIMELINE_START,
  compareEntries,
  entryEnd,
  entryResumed,
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

const CARD_H = 176; // measured: title + dates + 2-line summary + outcome, or the meta column (role + 4 chips) — round 70
const CARD_GAP = 16;
const MILESTONE_H = 44;
/** The line inside a card that should meet its point in time (the title). */
const CARD_ANCHOR = 24;
const MILESTONE_ANCHOR = 10;

/** Floor for compressed, quiet stretches of the axis. */
const MIN_PX_PER_MONTH = 7;
/** Two distinct event months never share a y closer than this. */
const EVENT_GAP = 16;
/** A finished stint's branch is never shorter than this, however brief the
 *  engagement — a three-month project reads as a loop, not a blip (Dev,
 *  2026-09-10: GOAPI). Year ticks follow the stretched scale, so time still
 *  reads true, just not uniformly. */
const MIN_SPAN_PX = 56;
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
 * interleaves finished projects and milestones by date, newest first — a
 * project is dated by the start of its most recent span (see compareEntries).
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
          month: entryResumed(entry),
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
  // Same month: the milestone reads first ("Joined", then the training stint
  // that began that month), so its label can sit level with its dot while
  // the card below takes the elbow.
  ].sort((a, b) => (b.month ?? 0) - (a.month ?? 0) || (a.kind === "milestone" ? -1 : 1));

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
  const yOf = new Map<number, number>();
  let prev: EventPoint | null = null;

  // Spans keyed by start month; their end months are swept first (the sweep
  // runs present → past), so a start can be held MIN_SPAN_PX below its end.
  const spansStarting = new Map<number, number[]>();
  for (const entry of timeline) {
    for (const span of entry.spans) {
      if (!span.end) continue;
      const start = monthIndex(span.start);
      spansStarting.set(start, [...(spansStarting.get(start) ?? []), monthIndex(span.end)]);
    }
  }

  for (const month of collectEventMonths()) {
    let y = TOP_PAD;
    if (prev) {
      y = prev.y + Math.max(EVENT_GAP, (prev.month - month) * MIN_PX_PER_MONTH);
    }
    const anchored = anchors.get(month);
    if (anchored !== undefined) y = Math.max(y, anchored);
    for (const end of spansStarting.get(month) ?? []) {
      const endY = yOf.get(end);
      if (endY !== undefined) y = Math.max(y, endY + MIN_SPAN_PX);
    }

    const point = { month, y };
    points.push(point);
    yOf.set(month, y);
    prev = point;
  }

  return points;
}

/** Monotonic month→y interpolation over the swept control points. */
/**
 * Where a span's end sits on the lane. A span that starts and ends in the
 * same month (the Nov 2021 onboarding stint) has no height on the axis, so
 * its end is lifted MIN_SPAN_PX above its start — the loop still reads as a
 * loop, the way GOAPI's three months do.
 */
function spanEndY(scale: (month: number) => number, start: number, end: number): number {
  return end === start ? scale(start) - MIN_SPAN_PX : scale(end);
}

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

/**
 * Milestone leaders are horizontal: the label sits level with its dot. A
 * milestone's dot is also spaced off any branch junction sharing its month
 * (Left Nirmitee.io lands on the Estateguru and NextDecade end junctions), so
 * its leader never runs through a branch elbow.
 */
const MILESTONE_JUNCTION_GAP = 18;

interface Placement {
  scale: (month: number) => number;
  tops: Map<StackItem, number>;
  junctionYByKey: Map<string, number>;
  milestoneDotY: Map<Milestone, number>;
}

function place(items: StackItem[], anchors: Map<number, number>): Placement {
  const scale = makeScale(sweepEvents(anchors));

  // Spine junctions (and milestone dots), nudged apart when they share a y.
  const junctionYByKey = new Map<string, number>();
  const milestoneDotY = new Map<Milestone, number>();
  const rawJunctions: { key: string; y: number; milestone?: Milestone }[] = timeline.flatMap((entry) => {
    const out = [{ key: `${entry.label}:out`, y: scale(entryStart(entry)) }];
    if (!isOngoing(entry)) out.push({ key: `${entry.label}:in`, y: spanEndY(scale, entryStart(entry), entryEnd(entry)) });
    return out;
  });
  for (const milestone of milestones) {
    if (milestone.kind === "now") continue;
    rawJunctions.push({ key: `milestone:${milestone.at}`, y: scale(monthIndex(milestone.at)), milestone });
  }
  rawJunctions.sort((a, b) => a.y - b.y);
  let prevJunctionY = -Infinity;
  let prevWasMilestone = false;
  for (const junction of rawJunctions) {
    const gap = junction.milestone || prevWasMilestone ? MILESTONE_JUNCTION_GAP : JUNCTION_GAP;
    const y = Math.max(junction.y, prevJunctionY + gap);
    if (junction.milestone) milestoneDotY.set(junction.milestone, y);
    else junctionYByKey.set(junction.key, y);
    prevJunctionY = y;
    prevWasMilestone = Boolean(junction.milestone);
  }

  // Final placement: same stacking, but each dated item now snaps to the
  // fitted scale, so cards sit exactly beside their moment on the graph.
  const tops = new Map<StackItem, number>();
  let cursor = TOP_PAD - MILESTONE_H;
  for (const item of items) {
    let top = cursor;
    if (item.month !== null) {
      const moment =
        item.kind === "milestone"
          ? (milestoneDotY.get(item.milestone) ?? scale(item.month))
          : scale(item.month);
      top = Math.max(top, moment - item.anchorOffset);
    }
    tops.set(item, top);
    cursor = top + item.height + CARD_GAP;
  }

  return { scale, tops, junctionYByKey, milestoneDotY };
}

export function buildTimelineLayout(): TimelineLayout {
  const items = readingOrder();
  const anchors = stackAnchors(items);

  // A milestone label pushed below its dot by the cards above it would need a
  // diagonal leader. Feed the label's y back as that month's anchor and
  // re-fit until every milestone sits level with its dot (y only ever grows,
  // so this settles in a few rounds).
  // A month that also starts a card is never fed back: card and label would
  // push each other down the page without end.
  const cardMonths = new Set(items.filter((i) => i.kind === "entry").map((i) => i.month));
  let placement = place(items, anchors);
  for (let round = 0; round < 8; round += 1) {
    let moved = false;
    for (const item of items) {
      if (item.kind !== "milestone" || item.month === null || cardMonths.has(item.month)) continue;
      const dotY = placement.milestoneDotY.get(item.milestone);
      const labelY = placement.tops.get(item);
      if (dotY === undefined || labelY === undefined) continue;
      if (labelY + item.anchorOffset > dotY + 0.5) {
        anchors.set(item.month, Math.max(anchors.get(item.month) ?? 0, labelY + item.anchorOffset));
        moved = true;
      }
    }
    if (!moved) break;
    placement = place(items, anchors);
  }
  const { scale, tops, junctionYByKey, milestoneDotY } = placement;

  const laneOf = assignLanes();
  const laneCount = Math.max(...laneOf.values(), 1);
  const graphWidth = SPINE_X + (laneCount + 1) * LANE_GAP;
  const cardX = graphWidth + 44;


  const entries: LaidOutEntry[] = items
    .filter((item): item is EntryItem => item.kind === "entry")
    .map((item) => {
      const { entry } = item;
      const lane = laneOf.get(entry) ?? 1;
      const laneX = SPINE_X + lane * LANE_GAP;
      const cardY = tops.get(item) ?? TOP_PAD;
      const open = isOngoing(entry);
      const yOut = junctionYByKey.get(`${entry.label}:out`) ?? scale(entryStart(entry));
      const yIn = open ? null : (junctionYByKey.get(`${entry.label}:in`) ?? spanEndY(scale, entryStart(entry), entryEnd(entry)));

      // Spans as vertical extents on the lane, earliest (lowest) first.
      const parts = entry.spans
        .map((span) => ({
          yBottom: scale(monthIndex(span.start)),
          yTop: span.end ? spanEndY(scale, monthIndex(span.start), monthIndex(span.end)) : TOP_PAD,
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
      const dotY =
        milestone.kind === "now"
          ? TOP_PAD
          : (milestoneDotY.get(milestone) ?? scale(monthIndex(milestone.at)));
      // Horizontal by construction (see buildTimelineLayout); the elbow is
      // only a safety net if the fit ever fails to settle.
      const leader =
        milestone.kind === "now"
          ? null
          : Math.abs(labelY + MILESTONE_ANCHOR - dotY) < 1
            ? `M ${SPINE_X + 7} ${dotY} H ${cardX - 14}`
            : `M ${SPINE_X + 7} ${dotY} H ${cardX - 30} V ${labelY + MILESTONE_ANCHOR} H ${cardX - 14}`;
      return { milestone, dotY, labelY, leader };
    });

  const spineTop = TOP_PAD;
  const spineBottom = scale(START_M);
  const stackBottom = Math.max(...items.map((item) => (tops.get(item) ?? TOP_PAD) + item.height));
  const height = Math.max(spineBottom + 80, stackBottom + CARD_GAP + 24);

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
