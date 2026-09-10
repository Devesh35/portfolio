"use client";

import { SkillIcon } from "@/components/skill-icon";
import { iconFor } from "@/content/skill-icons";
import { CATEGORY, type DiagramNode } from "@/lib/architecture";

import { Glyph } from "./glyph";

/** How a box reads right now — the orchestrator decides, the node just paints. */
export type Emphasis = "default" | "active" | "related" | "dimmed" | "hit";

export interface Interaction {
  onEnter: () => void;
  onLeave: () => void;
  onToggle: () => void;
}

interface GraphNodeProps {
  node: DiagramNode;
  x: number;
  y: number;
  rank: number;
  emphasis: Emphasis;
  interaction: Interaction;
  nodeRef: (el: HTMLDivElement | null) => void;
}

const OPACITY: Record<Emphasis, number> = { default: 1, active: 1, related: 1, dimmed: 0.35, hit: 1 };

/**
 * One box: a category-coloured top rule, the kind's glyph in a tile, the
 * label with its category caption in mono, and the tools as a row of brand
 * marks (names live in the aria-label, the title tooltip and the detail
 * panel — Dev, 2026-09-10: icons only on the box). Selection is a ring in
 * the box's own colour, not an accent bar.
 */
export function GraphNode({ node, x, y, rank, emphasis, interaction, nodeRef }: GraphNodeProps) {
  const color = CATEGORY[node.category].color;
  const active = emphasis === "active";
  const hit = emphasis === "hit";
  const lit = active || hit;
  const description = `${node.label}: ${node.items.join(", ")}`;

  return (
    <div
      ref={nodeRef}
      role="button"
      tabIndex={0}
      aria-label={description}
      aria-pressed={active}
      onMouseEnter={interaction.onEnter}
      onMouseLeave={interaction.onLeave}
      onFocus={interaction.onEnter}
      onBlur={interaction.onLeave}
      onClick={interaction.onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          interaction.onToggle();
        }
      }}
      className="reveal-item arch-enter arch-node absolute w-max cursor-pointer rounded-md border bg-surface font-sans transition-[opacity,box-shadow]"
      style={{
        // Inline: the unlayered `.reveal-item { position: relative }` global
        // would otherwise beat the `absolute` utility.
        position: "absolute",
        left: x,
        top: y,
        opacity: OPACITY[emphasis],
        // Longhands only — React warns when a shorthand (borderColor) and a
        // longhand (borderTopColor) both change on rerender.
        borderTopWidth: 2,
        borderTopColor: color,
        borderRightColor: lit ? color : "var(--color-line)",
        borderBottomColor: lit ? color : "var(--color-line)",
        borderLeftColor: lit ? color : "var(--color-line)",
        boxShadow: active
          ? `0 0 0 3px color-mix(in srgb, ${color} 14%, transparent), 0 1px 0 rgb(0 0 0 / 0.35)`
          : "0 1px 0 rgb(0 0 0 / 0.35)",
        ["--reveal" as string]: color,
        ["--rank" as string]: rank,
      }}
    >
      {node.variant === "stage" ? (
        <div className={`flex flex-col px-3 pb-2.5 pt-2.5 ${node.parallel ? "" : "min-w-[5.5rem]"}`}>
          <span className="flex items-center gap-2 text-[13px] font-semibold leading-4 tracking-[-0.01em] text-text">
            <span style={{ color }}>
              <Glyph id={node.kind} size={14} />
            </span>
            {node.label}
          </span>
          {/* An authored caption (Deploy: what gets deployed; Publish: the
              stores) — the category label alone says nothing on a stage. */}
          {node.caption !== CATEGORY[node.category].label && (
            <span className="mt-0.5 font-mono text-[9.5px] uppercase leading-3 tracking-[0.08em]" style={{ color: lit ? color : "var(--color-dim)" }}>
              {node.caption}
            </span>
          )}
          {/* Every stage shows its marks (Dev, 2026-09-10: lint / test too). */}
          <ToolTiles items={node.items} className="mt-2" />
        </div>
      ) : (
        <div className="min-w-[8.5rem]">
          {/* A plain element (no marks) closes with the same padding below. */}
          <div className={`flex items-center gap-2 px-3 pt-2.5 ${node.items.some((item) => iconFor(item)) ? "" : "pb-2.5"}`}>
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded-[5px] border bg-ground"
              style={{ color, borderColor: lit ? color : "var(--color-line)" }}
            >
              <Glyph id={node.kind} size={14} />
            </span>
            <span className="flex flex-col">
              <span className="text-[13px] font-semibold leading-4 tracking-[-0.01em] text-text">{node.label}</span>
              <span className="font-mono text-[9.5px] uppercase leading-3 tracking-[0.08em]" style={{ color: lit ? color : "var(--color-dim)" }}>
                {node.caption}
              </span>
            </span>
          </div>
          <ToolTiles items={node.items} className="px-3 pb-2.5 pt-2" />
        </div>
      )}
    </div>
  );
}

/** The box's tools as a row of brand marks. Practices with no mark ("Schema
 *  design") stay in the aria-label and the detail panel; a blank tile would
 *  say nothing. */
function ToolTiles({ items, className = "" }: { items: string[]; className?: string }) {
  const marked = items.filter((item) => iconFor(item));
  if (marked.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-hidden="true">
      {marked.map((item) => (
        <li
          key={item}
          title={item}
          className="grid h-[26px] w-[26px] place-items-center rounded-[5px] border border-line bg-ground text-muted [&_.skill-icon]:filter-none"
        >
          <SkillIcon name={item} size={15} />
        </li>
      ))}
    </ul>
  );
}
