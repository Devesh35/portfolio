"use client";

import { CATEGORY, type DiagramGroup } from "@/lib/architecture";

import { Glyph } from "./glyph";
import type { Emphasis, Interaction } from "./graph-node";

interface GraphGroupProps {
  group: DiagramGroup;
  x: number;
  y: number;
  w: number;
  h: number;
  emphasis: Emphasis;
  interaction: Interaction;
}

/** A dashed boundary around its members (the cloud account around its
 *  services). Hoverable and an edge endpoint in its own right. */
export function GraphGroup({ group, x, y, w, h, emphasis, interaction }: GraphGroupProps) {
  const color = CATEGORY[group.category].color;
  const active = emphasis === "active";
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${group.label}: ${group.items.join(", ")}`}
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
      className="absolute cursor-pointer rounded-lg border border-dashed transition-[opacity,border-color]"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        // Tinted in the group's own colour so the frame reads on the dark
        // ground (Dev, 2026-09-10: Nx Cloud's border was not visible).
        borderColor: active ? color : `color-mix(in srgb, ${color} 55%, var(--color-line-bright))`,
        background: active ? `color-mix(in srgb, ${color} 4%, transparent)` : "transparent",
        opacity: emphasis === "dimmed" ? 0.45 : 1,
      }}
    >
      {/* Label rides the bottom rule, bottom-right, like a drawing's title
          block — bottom-left for a pipeline group, whose edges leave from the
          bottom-right toward Deploy ‖ Publish and would cross it. */}
      <span
        className={`absolute -bottom-[8px] ${group.kind === "nxcloud" ? "left-2.5" : "right-2.5"} flex items-center gap-1.5 bg-ground px-1.5 font-mono text-[10px] uppercase leading-4 tracking-[0.1em]`}
        style={{ color: active ? color : "var(--color-muted)" }}
      >
        <span style={{ color }}>
          <Glyph id={group.kind} size={13} />
        </span>
        {group.label}
      </span>
    </div>
  );
}
