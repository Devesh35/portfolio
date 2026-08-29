"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { nav } from "@/content/site";
import { profile } from "@/content/profile";
import { useResume } from "@/components/resume-modal";
import { NavIcon } from "@/components/nav-icon";
import { OPEN_SEARCH_EVENT } from "@/components/site-search";

/**
 * The mobile sheet is a SIBLING of <header>, never a child.
 *
 * Once the page is scrolled the header gains backdrop-blur, and an element
 * with a backdrop-filter becomes the containing block for its fixed-position
 * descendants. Nested inside, the sheet's `inset-0` resolved against a 64px
 * header instead of the viewport and collapsed to a strip, letting the page
 * show through. Keeping it outside the filtered element is the fix.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { open: openResume } = useResume();
  const sheetRef = useRef<HTMLDivElement>(null);

  const scrolled = useSyncExternalStore(subscribeToScroll, isScrolled, () => false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    sheetRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled
            ? "border-b border-line bg-ground/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-mono text-sm tracking-tight"
            aria-label={`${profile.name} — home`}
          >
            <span className="h-1.5 w-1.5 bg-ember transition-transform duration-500 group-hover:scale-150" />
            <span className="font-medium">{profile.name}</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`link-wipe font-mono text-[0.8125rem] transition-colors duration-300 ${
                  isActive(item.href) ? "text-ember" : "text-muted hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))}
              aria-label="Search projects and skills"
              className="flex items-center gap-2 border border-line px-2.5 py-1.5 font-mono text-[0.6875rem] text-dim transition-colors duration-300 hover:border-line-bright hover:text-text"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
                <path d="M15.5 15.5 L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Ctrl K
            </button>
            <a
              href={profile.resume.href}
              download={profile.resume.downloadAs}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                event.preventDefault();
                openResume();
              }}
              className="btn btn-primary !px-3.5 !py-2 !text-xs"
            >
              Résumé
            </a>
          </nav>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))}
            aria-label="Search projects and skills"
            className="flex h-11 w-11 items-center justify-center md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
              <path d="M15.5 15.5 L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label="Open menu"
            className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[6px] md:hidden"
          >
            <span className="block h-px w-6 bg-text" />
            <span className="block h-px w-6 bg-text" />
          </button>
        </div>
      </header>

      {/* Sheet — sibling of <header>, so no filtered ancestor can contain it. */}
      <div
        id="mobile-nav"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!menuOpen}
        style={{ backgroundColor: "var(--color-void)" }}
        className="nav-sheet fixed inset-0 z-[70] flex-col overflow-y-auto overscroll-contain md:hidden"
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <span className="flex items-center gap-2.5 font-mono text-sm">
            <span className="h-1.5 w-1.5 bg-ember" />
            <span className="font-medium">{profile.name}</span>
          </span>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="-mr-2 flex h-11 w-11 items-center justify-center"
          >
            <span className="relative block h-6 w-6">
              <span className="absolute left-0 top-1/2 block h-px w-6 rotate-45 bg-text" />
              <span className="absolute left-0 top-1/2 block h-px w-6 -rotate-45 bg-text" />
            </span>
          </button>
        </div>

        <nav aria-label="Mobile" className="flex flex-col px-5 pt-4">
          {nav.map((item, i) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                aria-current={active ? "page" : undefined}
                style={{ "--rise-delay": `${i * 45}ms` } as React.CSSProperties}
                className={`animate-rise flex items-center justify-between gap-4 border-b border-line py-4 ${
                  active ? "text-ember" : "text-text"
                }`}
              >
                <span className="flex items-center gap-4">
                  <NavIcon
                    href={item.href}
                    className={active ? "text-ember" : "text-dim"}
                  />
                  <span className="font-display text-[2rem] font-medium leading-none">
                    {item.label}
                  </span>
                </span>
                {active && (
                  <span className="h-1.5 w-1.5 shrink-0 bg-ember" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 pt-8">
          <a
            href={profile.resume.href}
            download={profile.resume.downloadAs}
            onClick={(event) => {
              closeMenu();
              if (event.metaKey || event.ctrlKey || event.shiftKey) return;
              event.preventDefault();
              openResume();
            }}
            style={{ "--rise-delay": `${nav.length * 45}ms` } as React.CSSProperties}
            className="animate-rise btn btn-primary w-full justify-center"
          >
            View résumé
          </a>
        </div>

        <div className="mt-auto px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-10">
          <p className="label">Direct</p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-3 block font-mono text-sm text-muted"
          >
            {profile.email}
          </a>
          <div className="mt-4 flex gap-5 font-mono text-xs text-dim">
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={profile.links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={profile.links.devtools} target="_blank" rel="noreferrer">
              DevTools
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > 12;
