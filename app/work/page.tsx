import type { Metadata } from "next";

import { CareerTimeline } from "@/components/career-timeline";
import { CareerTimelineMobile } from "@/components/career-timeline-mobile";
import { projects } from "@/content/projects";
import { longestRun, peakConcurrency, timeline } from "@/content/timeline";

// Counts come from the project data so the intro can't drift from the cards.
const WORDS = ["none", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const word = (n: number) => WORDS[n] ?? String(n);
const countOrigin = (origin: (typeof projects)[number]["origin"]) => projects.filter((p) => p.origin === origin).length;

export const metadata: Metadata = {
  title: "Work",
  description:
    "A branching timeline of everything built since 2021 — client platforms at Nirmitee.io and personal projects, with what was running when.",
  alternates: { canonical: "/work" },
};

const LEGEND = [
  { label: "Nirmitee.io", className: "bg-steel" },
  { label: "Personal", className: "bg-ember" },
];

export default function WorkPage() {
  const longest = longestRun();
  const peak = peakConcurrency();
  const greenfield = countOrigin("greenfield");
  const rebuilt = countOrigin("rebuild");
  const inherited = countOrigin("inherited") + countOrigin("support");
  const led = projects.filter((p) => p.ownership.includes("lead")).length;

  return (
    <div className="mx-auto max-w-[87.5rem] px-5 pb-28 pt-36 sm:px-8 sm:pt-44">
      <header>
        <p className="animate-rise label">Nirmitee.io &amp; personal · 2021 – present</p>
        <h1
          className="animate-rise font-display mt-5 text-[clamp(2.75rem,9vw,6rem)] font-bold"
          style={{ "--rise-delay": "100ms" } as React.CSSProperties}
        >
          Work
        </h1>
        <p
          className="animate-rise prose-body mt-6 text-lg"
          style={{ "--rise-delay": "180ms" } as React.CSSProperties}
        >
          {timeline.length} engagements since 2021: {word(greenfield)} started from an empty
          repository, {word(rebuilt)} replaced a live product, {word(inherited)} joined codebases
          that were already running. Property lending, advertising, bike rentals, dental
          practices, sports clubs, health tracking, financial analysis and an AI-assisted
          observability platform — rarely the same domain twice.
        </p>
        <p
          className="animate-rise prose-body mt-4 text-lg"
          style={{ "--rise-delay": "220ms" } as React.CSSProperties}
        >
          Often more than one at a time — at the busiest, {peak} ran in parallel. The
          longest ran {longest} months across two phases; the shortest, two. On most of
          them the work went end to end: requirements, system design, build, deployment and
          the monitoring afterwards. {word(led).charAt(0).toUpperCase() + word(led).slice(1)} of
          them I led.
        </p>

        <ul
          className="animate-rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-2"
          style={{ "--rise-delay": "240ms" } as React.CSSProperties}
        >
          {LEGEND.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${item.className}`} />
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-dim">
                {item.label}
              </span>
            </li>
          ))}
          <li className="hidden items-center gap-2 md:flex">
            <span className="h-px w-6 bg-dim" style={{ borderTop: "1px dashed currentColor" }} />
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-dim">
              Support role / paused
            </span>
          </li>
        </ul>

        <p
          className="animate-rise mt-4 hidden font-mono text-xs text-dim md:block"
          style={{ "--rise-delay": "280ms" } as React.CSSProperties}
        >
          Newest at the top. A branch leaves the trunk when a project began and merges back
          when it ended.
        </p>
        <p
          className="animate-rise mt-4 font-mono text-xs text-dim md:hidden"
          style={{ "--rise-delay": "280ms" } as React.CSSProperties}
        >
          Newest at the top, with each project&apos;s dates and duration beside it.
        </p>
      </header>

      {/* Graph on wide screens, single spine on phones. */}
      <section className="mt-20">
        <div className="hidden md:block">
          <CareerTimeline />
        </div>
        <div className="md:hidden">
          <CareerTimelineMobile />
        </div>
      </section>

    </div>
  );
}
