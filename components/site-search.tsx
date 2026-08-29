"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SearchEntry } from "@/lib/search-index";

/** The header buttons open this dialog by dispatching this event. */
export const OPEN_SEARCH_EVENT = "open-site-search";

const TYPE_LABEL: Record<SearchEntry["type"], string> = {
  project: "Projects",
  skill: "Skills",
};

/** "cicd" should find "CI/CD pipelines" — compare with separators stripped. */
const squash = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

function matches(entry: SearchEntry, query: string): number {
  const label = entry.label.toLowerCase();
  const flatLabel = squash(entry.label);
  const flatQuery = squash(query);
  if (label.startsWith(query) || flatLabel.startsWith(flatQuery)) return 0;
  if (label.includes(query) || flatLabel.includes(flatQuery)) return 1;
  if (entry.keywords.some((keyword) => keyword.includes(query) || squash(keyword).includes(flatQuery)))
    return 2;
  return -1;
}

/**
 * Site-wide search over projects and skills. Opens with Ctrl/⌘K or the header
 * button; arrow keys move, Enter goes, Escape closes. The index arrives fully
 * built from the server — no fetching, no state beyond the dialog itself.
 */
export function SiteSearch({ index }: { index: SearchEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .map((entry) => ({ entry, rank: matches(entry, q) }))
      .filter((hit) => hit.rank >= 0)
      .sort(
        (a, b) =>
          a.rank - b.rank ||
          (a.entry.type === b.entry.type ? 0 : a.entry.type === "project" ? -1 : 1),
      )
      .slice(0, 10)
      .map((hit) => hit.entry);
  }, [index, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  }, []);

  const go = useCallback(
    (entry: SearchEntry) => {
      close();
      router.push(entry.href);
    },
    [close, router],
  );

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search projects and skills"
      className="fixed inset-0 z-[80] flex items-start justify-center bg-void/80 px-4 pt-[15vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-lg border border-line-bright bg-ground shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 focus-within:border-ember/60">
          <span className="font-mono text-xs text-dim" aria-hidden="true">
            /
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") close();
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setCursor((c) => Math.min(c + 1, results.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              }
              if (event.key === "Enter" && results[cursor]) go(results[cursor]);
            }}
            placeholder="Search projects and skills…"
            className="w-full bg-transparent py-3.5 font-mono text-sm text-text placeholder:text-dim focus:outline-none"
            aria-label="Search"
          />
          <span className="font-mono text-[0.625rem] uppercase tracking-widest text-dim">esc</span>
        </div>

        {query.trim() && (
          <ul className="max-h-[50vh] overflow-y-auto py-2" role="listbox">
            {results.map((entry, i) => (
              <li key={`${entry.type}-${entry.label}`} role="option" aria-selected={i === cursor}>
                <button
                  type="button"
                  onClick={() => go(entry)}
                  onMouseEnter={() => setCursor(i)}
                  className={`flex w-full items-baseline justify-between gap-4 px-4 py-2.5 text-left ${
                    i === cursor ? "bg-surface" : ""
                  }`}
                >
                  <span className="flex min-w-0 flex-1 items-baseline gap-3">
                    <span
                      className={`min-w-0 truncate font-display text-sm font-semibold ${
                        i === cursor ? "text-ember" : "text-text"
                      }`}
                    >
                      {entry.label}
                    </span>
                    <span className="shrink-0 whitespace-nowrap font-mono text-[0.6875rem] text-dim">
                      {entry.sub}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[0.625rem] uppercase tracking-widest text-dim">
                    {TYPE_LABEL[entry.type]}
                  </span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-4 py-3 font-mono text-xs text-dim">No matches for “{query}”.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
