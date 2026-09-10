"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { layoutView, routeKey, type Box, type DiagramView, type NodeCategory, type Size } from "@/lib/architecture";

import { type Attention, boxEmphasis, edgeState } from "./emphasis";
import { clearSpot, edgePath, EdgeMarkers, GraphEdge, labelRect, type LabelSpot, routedPath } from "./graph-edge";
import { GraphGroup } from "./graph-group";
import { GraphNode } from "./graph-node";

/**
 * One view, drawn: real HTML boxes (sized by their content, measured after
 * mount and again once fonts settle) over an SVG edge layer, positioned by
 * lib/architecture/layout.ts. Scales down to its column past a floor, then
 * scrolls sideways — phones get the whole picture and a scroll, not a
 * squeezed one. Knows nothing about projects; the orchestrator
 * (project-systems.tsx) owns selection, search and filters.
 */

const PAD_LEFT = 16;
const PAD = 16;

interface CanvasProps {
  view: DiagramView;
  attention: Attention;
  onHover: (id: string | null) => void;
  onToggle: (id: string) => void;
}

export function ArchitectureCanvas({ view, attention, onHover, onToggle }: CanvasProps) {
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const [hostWidth, setHostWidth] = useState<number | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const hostRef = useRef<HTMLDivElement>(null);

  /* Measure the boxes: on mount, and again once fonts have settled. */
  const measure = useCallback(() => {
    setSizes((current) => {
      const next: Record<string, Size> = {};
      let changed = false;
      for (const [nodeId, el] of nodeRefs.current) {
        const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
        next[nodeId] = { w, h };
        if (!current[nodeId] || current[nodeId].w !== w || current[nodeId].h !== h) changed = true;
      }
      return changed ? next : current;
    });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, view]);

  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [measure]);

  const { boxes, left, top, width, height, rank, routes } = layoutView(
    view,
    sizes,
    hostWidth === null ? undefined : hostWidth - PAD_LEFT - PAD,
  );
  const categoryOf = new Map<string, NodeCategory>();
  for (const node of view.nodes) categoryOf.set(node.id, node.category);
  for (const group of view.groups) categoryOf.set(group.id, group.category);
  const nodeBoxes = view.nodes.map((node) => boxes.get(node.id)).filter((box): box is Box => !!box);

  // Label spots, resolved in edge order against every node and every label
  // already placed, so no two labels land on each other.
  const vertical = view.layout === "flow" && view.direction === "TB";
  const labelAt = new Map<string, LabelSpot>();
  const labelRects: Box[] = [];
  {
    const taken: Box[] = [...nodeBoxes];
    for (const edge of view.edges) {
      const from = boxes.get(edge.from), to = boxes.get(edge.to);
      if (!from || !to || !edge.label) continue;
      const route = routes.get(routeKey(edge.from, edge.to));
      const path = route ? routedPath(route) : edgePath(from, to, vertical ? "vertical" : "auto");
      if (!path.labelled) continue;
      const spots: LabelSpot[] = "spots" in path && path.spots ? path.spots : [{ lx: path.lx, ly: path.ly }];
      const spot = clearSpot(spots, edge.label, taken, path.anchor);
      labelAt.set(routeKey(edge.from, edge.to), spot);
      const rect = labelRect(spot, edge.label, path.anchor);
      taken.push(rect);
      labelRects.push(rect);
    }
  }
  // The drawing's frame grows to include labels that hang past the boxes
  // (a narrow pipeline with a wide label), so nothing is ever clipped.
  const overL = Math.max(0, left - Math.min(left, ...labelRects.map((r) => r.x)));
  const overR = Math.max(0, Math.max(left + width, ...labelRects.map((r) => r.x + r.w)) - (left + width));
  const padL = PAD_LEFT + overL;
  const naturalW = width + padL + PAD + overR;
  const naturalH = height + PAD * 2;

  // The whole picture always fits its column: scale down, never scroll
  // (Dev, 2026-09-10). Width is read from the host and the scale derived in
  // render, so a late font measurement can never leave a stale scale.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => setHostWidth(entry.contentRect.width));
    observer.observe(host);
    setHostWidth(host.clientWidth);
    return () => observer.disconnect();
  }, []);
  const scale = hostWidth === null ? 1 : Math.min(1, hostWidth / naturalW);

  const edgeLayer = (part: "line" | "label") =>
    view.edges.map((edge) => {
      const from = boxes.get(edge.from);
      const to = boxes.get(edge.to);
      if (!from || !to) return null;
      const origin = categoryOf.get(edge.from) ?? "service";
      const { hot, dimmed } = edgeState(view, edge, attention);
      return (
        <GraphEdge
          key={`${edge.from}-${edge.to}`}
          edge={edge}
          from={from}
          to={to}
          origin={origin}
          prefer={vertical ? "vertical" : "auto"}
          labelAt={labelAt.get(routeKey(edge.from, edge.to))}
          route={routes.get(routeKey(edge.from, edge.to))}
          markers={view.id}
          hot={hot}
          dimmed={dimmed}
          part={part}
        />
      );
    });

  const interaction = (id: string) => ({
    onEnter: () => onHover(id),
    onLeave: () => onHover(null),
    onToggle: () => onToggle(id),
  });

  return (
    <div ref={hostRef} className="overflow-hidden">
      {/* Scaled stage: the wrapper takes the scaled size so nothing below shifts. */}
      <div className="mx-auto" style={{ width: naturalW * scale, height: naturalH * scale }}>
        <div
          className="relative font-mono"
          style={{ width: naturalW, height: naturalH, transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {view.groups.map((group) => {
            const box = boxes.get(group.id);
            if (!box) return null;
            return (
              <GraphGroup
                key={group.id}
                group={group}
                x={box.x - left + padL}
                y={box.y - top + PAD}
                w={box.w}
                h={box.h}
                emphasis={boxEmphasis(view, group.id, group.category, attention)}
                interaction={interaction(group.id)}
              />
            );
          })}

          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            width={naturalW}
            height={naturalH}
            viewBox={`${left - padL} ${top - PAD} ${naturalW} ${naturalH}`}
          >
            <EdgeMarkers id={view.id} />
            {edgeLayer("line")}
          </svg>

          {view.nodes.map((node) => {
            const box = boxes.get(node.id);
            if (!box) return null;
            return (
              <GraphNode
                key={node.id}
                node={node}
                x={box.x - left + padL}
                y={box.y - top + PAD}
                rank={rank.get(node.id) ?? 0}
                emphasis={boxEmphasis(view, node.id, node.category, attention)}
                interaction={interaction(node.id)}
                nodeRef={(el) => {
                  if (el) nodeRefs.current.set(node.id, el);
                  else nodeRefs.current.delete(node.id);
                }}
              />
            );
          })}

          {/* Labels above the boxes, so none is ever hidden behind one. */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            width={naturalW}
            height={naturalH}
            viewBox={`${left - padL} ${top - PAD} ${naturalW} ${naturalH}`}
          >
            {edgeLayer("label")}
          </svg>
        </div>
      </div>
    </div>
  );
}
