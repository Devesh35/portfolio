import type { Metadata } from "next";
import Link from "next/link";

import { ResumeButton } from "@/components/resume-button";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about full-stack and DevOps work, or just to compare notes on infrastructure.",
  alternates: { canonical: "/contact" },
};

/**
 * Contact — the same workspace grammar as About (Dev, 2026-09-10): one clear
 * ask, the channels as a bordered grid of cells, and a rail with what a good
 * fit looks like, where and when to reach him, and the résumé. The message
 * form stays out until its endpoint is live.
 */

const CHANNELS = [
  {
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    note: "The fastest way. I read everything that lands here.",
    primary: true,
  },
  {
    label: "Phone",
    value: profile.phone,
    href: `tel:${profile.phone.replace(/\s+/g, "")}`,
    note: "Calls and WhatsApp, IST working hours.",
    primary: true,
  },
  {
    label: "LinkedIn",
    value: "in/devesh-singh",
    href: profile.links.linkedin,
    note: "Roles, introductions and the professional record.",
  },
  {
    label: "GitHub",
    value: "Devesh35",
    href: profile.links.github,
    note: "Code, when it is mine to share.",
  },
  {
    label: "DevTools",
    value: "devtools.simarium.in",
    href: profile.links.devtools,
    note: "The tooling I build outside work.",
  },
] as const;

const GOOD_FITS = [
  "Full-stack roles where the infrastructure is part of the job, not a separate team.",
  "DevOps and platform work: pipelines, environments as code, monitoring.",
  "Contract work that takes a feature from design through to a monitored production release.",
  "Comparing notes on system design — no project required.",
] as const;

export default function ContactPage() {
  const style = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

  return (
    <div className="mx-auto max-w-[87.5rem] px-5 pb-28 pt-36 sm:px-8 sm:pt-44">
      {/* ------------------------------------------------------------- header */}
      <header className="max-w-[60rem]">
        <p className="animate-rise label">{profile.location} · IST (UTC+5:30)</p>
        <h1
          className="animate-rise font-display mt-5 text-[clamp(2.75rem,9vw,6rem)] font-bold leading-[0.95]"
          style={{ "--rise-delay": "100ms" } as React.CSSProperties}
        >
          Let&apos;s talk about
          <br />
          <span className="text-ember">what needs shipping.</span>
        </h1>
        <p
          className="animate-rise prose-body mt-8 text-lg sm:text-xl"
          style={{ "--rise-delay": "180ms" } as React.CSSProperties}
        >
          Open to full-stack and DevOps roles, and to contract work where someone needs a
          feature taken from design through to a monitored production deployment. A few
          lines about what you are building is plenty to start.
        </p>
      </header>

      <div className="rule-accent mt-16 w-full" />

      {/* ------------------------------------------------- channels + rail */}
      <div className="mt-12 gap-14 lg:grid lg:grid-cols-[1fr_17rem] xl:grid-cols-[1fr_19rem]">
        <section aria-labelledby="channels" className="min-w-0">
          <h2 id="channels" className="label">
            Reach me
          </h2>
          <ul className="mt-5 grid border-l border-t border-line sm:grid-cols-6">
            {CHANNELS.map((channel, i) => {
              const external = channel.href.startsWith("http");
              return (
                <li
                  key={channel.label}
                  data-reveal
                  style={style(i * 70)}
                  className={`border-b border-r border-line ${"primary" in channel && channel.primary ? "sm:col-span-3" : "sm:col-span-2"}`}
                >
                  <a
                    href={channel.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="group/ch reveal-item flex h-full flex-col justify-between gap-8 bg-ground p-6 transition-colors duration-300 hover:bg-surface sm:p-7"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-dim">{channel.label}</span>
                      <span
                        aria-hidden="true"
                        className="font-mono text-xs text-dim transition-[color,transform] duration-300 group-hover/ch:translate-x-0.5 group-hover/ch:text-ember"
                      >
                        {external ? "↗" : "→"}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`block break-all font-display font-semibold transition-colors duration-300 group-hover/ch:text-ember ${
                          "primary" in channel && channel.primary ? "text-[clamp(1.35rem,2.1vw,1.9rem)]" : "text-xl"
                        }`}
                      >
                        {channel.value}
                      </span>
                      <span className="mt-2 block text-[0.9rem] leading-relaxed text-muted">{channel.note}</span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>

          <div data-reveal style={style(300)} className="mt-10 border-t border-line pt-6">
            <p className="label">Before you write</p>
            <ul className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {GOOD_FITS.map((fit) => (
                <li key={fit} className="flex gap-3 text-[0.9rem] leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-ember-dim" />
                  <span>{fit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="mt-14 lg:mt-0 lg:sticky lg:top-28 lg:self-start">
          <dl data-reveal style={style(120)} className="divide-y divide-line border-y border-line">
            {[
              ["Based in", profile.location],
              ["Time zone", "IST · UTC+5:30"],
              ["Replies", "Usually within a couple of days"],
              ["Currently", profile.currentRole],
            ].map(([term, value]) => (
              <div key={term} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-dim">{term}</dt>
                <dd className="text-right font-mono text-xs text-text">{value}</dd>
              </div>
            ))}
          </dl>

          <div data-reveal style={style(200)} className="panel mt-8 p-6">
            <p className="label">Résumé</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">Two pages, updated {profile.resume.updated}.</p>
            <ResumeButton className="btn btn-primary mt-5 w-full justify-center">View résumé</ResumeButton>
          </div>

          <div data-reveal style={style(260)} className="mt-8">
            <p className="label">Not ready to write?</p>
            <ul className="mt-3 space-y-1.5">
              <li>
                <Link href="/work" className="link-wipe font-mono text-[0.8125rem] text-muted hover:text-text">
                  See the work first
                </Link>
              </li>
              <li>
                <Link href="/systems" className="link-wipe font-mono text-[0.8125rem] text-muted hover:text-text">
                  Browse the toolkit
                </Link>
              </li>
              <li>
                <Link href="/about" className="link-wipe font-mono text-[0.8125rem] text-muted hover:text-text">
                  Read how I work
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
