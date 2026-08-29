import Link from "next/link";
import { profile } from "@/content/profile";
import { nav } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-void">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="label">Available for work</p>
            <p className="mt-4 font-display text-2xl font-medium">
              Have something that needs shipping?
            </p>
            <Link
              href="/contact"
              className="link-wipe mt-4 inline-block font-mono text-sm text-ember"
            >
              Start a conversation →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="label">Pages</p>
              <ul className="mt-4 space-y-2.5">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-wipe font-mono text-sm text-muted hover:text-text"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label">Elsewhere</p>
              <ul className="mt-4 space-y-2.5">
                {[
                  { href: profile.links.github, label: "GitHub" },
                  { href: profile.links.linkedin, label: "LinkedIn" },
                  { href: profile.links.devtools, label: "DevTools" },
                  { href: `mailto:${profile.email}`, label: "Email" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                      className="link-wipe font-mono text-sm text-muted hover:text-text"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-8 font-mono text-xs text-dim sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>{profile.location} · Built from scratch with Next.js 16 — no template</span>
        </div>
      </div>
    </footer>
  );
}
