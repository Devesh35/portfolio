import type { DiagramEdge, DiagramView, NodeCategory } from "@/lib/architecture";

import type { Emphasis } from "./graph-node";

/**
 * What the reader is attending to, resolved into a per-box state. One
 * selection at a time wins over search, search over category filters —
 * so a selected node always reads clearly whatever else is set.
 */
export interface Attention {
  /** Selected (hovered or pinned) box in THIS view. */
  shownId: string | null;
  /** Boxes matching the search — null when there is no query. */
  hits: Set<string> | null;
  /** Categories switched off in the filter bar. */
  hidden: Set<NodeCategory>;
}

const touches = (edge: DiagramEdge, id: string) => edge.from === id || edge.to === id;

export function neighbours(view: DiagramView, id: string): Set<string> {
  const set = new Set<string>([id]);
  for (const edge of view.edges) {
    if (edge.from === id) set.add(edge.to);
    if (edge.to === id) set.add(edge.from);
  }
  return set;
}

export function boxEmphasis(view: DiagramView, id: string, category: NodeCategory, attention: Attention): Emphasis {
  const { shownId, hits, hidden } = attention;
  if (shownId) {
    if (id === shownId) return "active";
    return neighbours(view, shownId).has(id) ? "related" : "dimmed";
  }
  if (hits) return hits.has(id) ? "hit" : "dimmed";
  return hidden.has(category) ? "dimmed" : "default";
}

export function edgeState(view: DiagramView, edge: DiagramEdge, attention: Attention): { hot: boolean; dimmed: boolean } {
  const { shownId, hits, hidden } = attention;
  const hot = shownId !== null && touches(edge, shownId);
  if (shownId) return { hot, dimmed: !hot };
  if (hits) return { hot: false, dimmed: !(hits.has(edge.from) && hits.has(edge.to)) };
  const categoryOf = (id: string) =>
    view.nodes.find((node) => node.id === id)?.category ?? view.groups.find((group) => group.id === id)?.category;
  const a = categoryOf(edge.from), b = categoryOf(edge.to);
  return { hot: false, dimmed: (a !== undefined && hidden.has(a)) || (b !== undefined && hidden.has(b)) };
}

/** Boxes whose label, tools or kind match the query (case-insensitive). */
export function searchView(view: DiagramView, query: string): Set<string> | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const hits = new Set<string>();
  const test = (label: string, items: string[]) =>
    label.toLowerCase().includes(q) || items.some((item) => item.toLowerCase().includes(q));
  for (const node of view.nodes) if (test(node.label, node.items)) hits.add(node.id);
  for (const group of view.groups) if (test(group.label, group.items)) hits.add(group.id);
  return hits;
}
