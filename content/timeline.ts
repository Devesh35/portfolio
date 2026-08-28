/**
 * Career timeline — the single source of truth for every date on this site.
 *
 * Project pages read their period from here, so the timeline graph and the case
 * studies can never disagree. Dates are Dev's own recollection and in several
 * places they differ from Devesh_Singh_Resume.pdf (Datachamps, Bestosys,
 * Modcart, Boongg, Observability, WellCompanion). The résumé is downloadable
 * from this same site, so those two must be reconciled before it goes public.
 *
 * Months are 1-indexed. `end: null` means ongoing.
 */

export type Track = "personal" | "nirmitee";
export type Emphasis = "main" | "support" | "standard";

export interface Span {
  start: string; // "YYYY-MM"
  end: string | null;
}

export interface TimelineEntry {
  /** Matches a slug in content/projects.ts, or null for a milestone. */
  slug: string | null;
  label: string;
  track: Track;
  emphasis: Emphasis;
  /** More than one span means the work paused and resumed — Estateguru's phase 2. */
  spans: Span[];
  note?: string;
}

/** Point-in-time events that sit on the spine rather than on a branch. */
export interface Milestone {
  at: string; // "YYYY-MM"
  label: string;
  detail?: string;
  kind: "start" | "event" | "now";
}

export const TIMELINE_START = "2020-10"; // graduation
export const TIMELINE_END = "2026-08"; // present

export const milestones: Milestone[] = [
  { at: "2026-08", label: "Present", detail: "SDE 2 at Nirmitee.io", kind: "now" },
  { at: "2024-04", label: "Promoted to SDE 2", kind: "event" },
  { at: "2021-11", label: "Joined Nirmitee.io", detail: "Training, then first client assignment", kind: "event" },
  { at: "2020-10", label: "Graduated", detail: "BE, Datta Meghe College of Engineering", kind: "start" },
];

export const timeline: TimelineEntry[] = [
  {
    slug: "devtools",
    label: "DevTools",
    track: "personal",
    emphasis: "main",
    spans: [{ start: "2026-04", end: null }],
    note: "Simarium",
  },
  {
    slug: "nextdecade",
    label: "Observability Platform",
    track: "nirmitee",
    emphasis: "main",
    spans: [{ start: "2026-06", end: "2026-07" }],
  },
  {
    slug: "estateguru",
    label: "Estateguru",
    track: "nirmitee",
    emphasis: "main",
    spans: [
      { start: "2023-06", end: "2025-06" },
      { start: "2025-11", end: null },
    ],
    note: "Phase 2 from Nov 2025",
  },
  {
    slug: "wellcompanion",
    label: "WellCompanion",
    track: "nirmitee",
    emphasis: "main",
    spans: [{ start: "2025-07", end: "2025-11" }],
  },
  {
    slug: "goapi",
    label: "GOAPI",
    track: "nirmitee",
    emphasis: "standard",
    spans: [{ start: "2023-03", end: "2023-05" }],
  },
  {
    slug: "modcart",
    label: "Modcart",
    track: "nirmitee",
    emphasis: "main",
    spans: [{ start: "2022-06", end: "2023-05" }],
  },
  {
    slug: "boongg",
    label: "Boongg",
    track: "nirmitee",
    emphasis: "standard",
    spans: [{ start: "2022-08", end: "2022-10" }],
  },
  {
    slug: "tradegully",
    label: "Tradegully",
    track: "nirmitee",
    emphasis: "support",
    spans: [{ start: "2022-04", end: "2022-08" }],
  },
  {
    slug: "bestosys",
    label: "Bestosys",
    track: "nirmitee",
    emphasis: "standard",
    spans: [{ start: "2022-02", end: "2022-03" }],
  },
  {
    slug: "datachamps",
    label: "Datachamps",
    track: "nirmitee",
    emphasis: "main",
    spans: [{ start: "2021-12", end: "2022-05" }],
  },
  {
    slug: "dine-in",
    label: "Dine In",
    track: "personal",
    emphasis: "standard",
    spans: [{ start: "2021-05", end: "2021-10" }],
  },
];

/* ------------------------------------------------------------------ helpers */

export const monthIndex = (ym: string) => {
  const [year, month] = ym.split("-").map(Number);
  return year * 12 + (month - 1);
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const formatMonth = (ym: string) => {
  const [year, month] = ym.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

/** "Jun 2023 – Jun 2025 · Nov 2025 – Present" */
export const formatSpans = (spans: Span[]) =>
  spans
    .map((s) => `${formatMonth(s.start)} – ${s.end ? formatMonth(s.end) : "Present"}`)
    .join(" · ");

export const entryStart = (entry: TimelineEntry) =>
  Math.min(...entry.spans.map((s) => monthIndex(s.start)));

export const entryEnd = (entry: TimelineEntry) =>
  Math.max(...entry.spans.map((s) => monthIndex(s.end ?? TIMELINE_END)));

/** Total months a project ran, summed across spans. */
export const entryMonths = (entry: TimelineEntry) =>
  entry.spans.reduce(
    (total, s) => total + (monthIndex(s.end ?? TIMELINE_END) - monthIndex(s.start)) + 1,
    0,
  );

export const isOngoing = (entry: TimelineEntry) => entry.spans.some((s) => s.end === null);

/**
 * Ordering rule for both the graph and the mobile list.
 *
 * Still running comes first — a current assignment is the thing a reader wants
 * at the top, regardless of when it began. Within that, the client assignment
 * leads the personal project. Everything finished then follows by start date,
 * newest first, so an earlier start is always further down.
 */
export function orderRank(entry: TimelineEntry): number {
  if (!isOngoing(entry)) return 0;
  return entry.track === "nirmitee" ? 2 : 1;
}

export const compareEntries = (a: TimelineEntry, b: TimelineEntry) =>
  orderRank(b) - orderRank(a) || entryStart(b) - entryStart(a);

export const getEntry = (slug: string) => timeline.find((e) => e.slug === slug);

/**
 * The period string every other surface uses — project pages, the résumé.
 * Dates live in this file and nowhere else, so nothing can drift out of sync.
 */
export function periodFor(slug: string): string {
  const entry = getEntry(slug);
  if (!entry) throw new Error(`No timeline entry for project "${slug}"`);
  return formatSpans(entry.spans);
}

/* --------------------------------------------------- derived, for page copy */

/** Longest single engagement, in months. */
export const longestRun = () => Math.max(...timeline.map(entryMonths));

/** Most projects running in any one month. */
export function peakConcurrency(): number {
  const first = Math.min(...timeline.map(entryStart));
  const last = Math.max(...timeline.map(entryEnd));
  let peak = 0;

  for (let month = first; month <= last; month += 1) {
    const running = timeline.filter((entry) =>
      entry.spans.some(
        (span) => monthIndex(span.start) <= month && month <= monthIndex(span.end ?? TIMELINE_END),
      ),
    ).length;
    peak = Math.max(peak, running);
  }

  return peak;
}
