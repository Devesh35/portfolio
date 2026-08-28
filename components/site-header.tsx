"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { nav } from "@/content/site";
import { profile } from "@/content/profile";
import { useResume } from "@/components/resume-modal";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { open: openResume } = useResume();

  // Subscribing to browser state, not mirroring it into an effect.
  const scrolled = useSyncExternalStore(subscribeToScroll, isScrolled, () => false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
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
          <a
            href={profile.resume.href}
            download={profile.resume.downloadAs}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey) return;
              event.preventDefault();
              openResume();
            }}
            className="btn btn-primary !py-2 !px-3.5 !text-xs"
          >
            Résumé
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
        >
          <span
            className={`block h-px w-5 bg-text transition-transform duration-300 ${
              menuOpen ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-5 bg-text transition-transform duration-300 ${
              menuOpen ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!menuOpen}
        className="fixed inset-0 top-16 z-40 flex flex-col gap-1 border-t border-line bg-ground px-5 pt-8 md:hidden"
      >
        {nav.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            style={{ "--rise-delay": `${i * 55}ms` } as React.CSSProperties}
            className={`animate-rise border-b border-line py-5 font-display text-3xl font-medium ${
              isActive(item.href) ? "text-ember" : "text-text"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <a
          href={profile.resume.href}
          download={profile.resume.downloadAs}
          onClick={(event) => {
            closeMenu();
            if (event.metaKey || event.ctrlKey || event.shiftKey) return;
            event.preventDefault();
            openResume();
          }}
          style={{ "--rise-delay": `${nav.length * 55}ms` } as React.CSSProperties}
          className="animate-rise mt-8 btn btn-primary justify-center"
        >
          View résumé
        </a>
      </div>
    </header>
  );
}

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > 12;
