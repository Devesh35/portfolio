"use client";

import { useEffect, useState } from "react";

import type { DiagramView } from "@/lib/architecture";

import { ArchitectureCanvas } from "./canvas";
import { NodeDetails } from "./node-details";

interface Selection {
  view: string;
  id: string;
}

interface ProjectSystemsProps {
  views: DiagramView[];
  how: Record<string, string>;
}

const NO_FILTER = new Set<never>();

// Static class names — Tailwind only emits what it can see in the source.
const VIEW_COLUMN = ["lg:col-start-1", "lg:col-start-3", "lg:col-start-5"];
const RULE_COLUMN = ["lg:col-start-2", "lg:col-start-4"];
/** Column templates by view count; rules take the 1px tracks. */
const COLUMN_GRID: Record<number, string> = {
  2: "lg:grid-cols-[1fr_1px_1fr] lg:gap-10",
  3: "lg:grid-cols-[4.5fr_1px_3fr_1px_4.5fr] lg:gap-8",
};

/**
 * The project page's system views and the one piece of state they share:
 * a selection (hover previews, click or Enter pins, Esc clears) shown in the
 * detail panel below. Views are whatever lib/architecture/views.ts produced —
 * this component doesn't know which project it is showing. (Search and
 * category filters were dropped on 2026-09-10 — Dev: the diagrams are small
 * enough to read whole.)
 */
export function ProjectSystems({ views, how }: ProjectSystemsProps) {
  const [hovered, setHovered] = useState<Selection | null>(null);
  const [pinned, setPinned] = useState<Selection | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPinned(null);
        setHovered(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const shown = hovered ?? pinned;
  const shownBox = shown
    ? (views.find((view) => view.id === shown.view)?.nodes.find((node) => node.id === shown.id) ??
      views.find((view) => view.id === shown.view)?.groups.find((group) => group.id === shown.id) ??
      null)
    : null;

  const columns = views;
  const renderView = (view: DiagramView, className = "") => (
    <section key={view.id} className={`flex min-w-0 flex-col ${className}`}>
      <h2 className="border-b border-line pb-3 text-lg font-semibold tracking-[-0.02em] text-text">{view.title}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-dim">{view.description}</p>
      <div className="mt-4 flex flex-1 flex-col justify-center">
        <div>
          <ArchitectureCanvas
            view={view}
            attention={{
              shownId: shown?.view === view.id ? shown.id : null,
              hits: null,
              hidden: NO_FILTER,
            }}
            onHover={(id) => setHovered(id ? { view: view.id, id } : null)}
            onToggle={(id) =>
              setPinned((current) => (current?.view === view.id && current.id === id ? null : { view: view.id, id }))
            }
          />
          {view.nodes.length === 1 && view.groups.length === 0 && (
            <p className="mt-3 font-mono text-[0.6875rem] text-dim">
              One node: nothing in this stack runs outside the client — no services or data stores of its own.
            </p>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div>
      {/* All views on one row on wide screens — the app map, a narrow vertical
          pipeline, and a roomy infrastructure map — with fading rules between;
          columns stretch to the tallest. Stacked below lg. */}
      <div className={`grid gap-8 ${COLUMN_GRID[columns.length] ?? ""}`}>
        {columns.map((view, index) => renderView(view, VIEW_COLUMN[index]))}
        {columns.slice(1).map((view, index) => (
          <div key={`rule-${view.id}`} aria-hidden="true" className={`rule-fade-y hidden lg:block lg:row-start-1 ${RULE_COLUMN[index]}`} />
        ))}
      </div>

      <NodeDetails shown={shownBox} how={how} />
    </div>
  );
}
