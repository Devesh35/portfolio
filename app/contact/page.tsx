import { ResumeButton } from "@/components/resume-button";
import { profile } from "@/content/profile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about full-stack and DevOps work, or just to compare notes on infrastructure.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "LinkedIn", value: "devesh-singh", href: profile.links.linkedin },
  { label: "GitHub", value: "Devesh35", href: profile.links.github },
  { label: "DevTools", value: "devtools.simarium.in", href: profile.links.devtools },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-28 pt-36 sm:px-8 sm:pt-44">
      <header>
        <p className="animate-rise label">{profile.location} · IST (UTC+5:30)</p>
        <h1
          className="animate-rise font-display mt-5 text-[clamp(2.75rem,9vw,6rem)] font-bold"
          style={{ "--rise-delay": "100ms" } as React.CSSProperties}
        >
          Contact
        </h1>
        <p
          className="animate-rise prose-body mt-6 text-lg"
          style={{ "--rise-delay": "180ms" } as React.CSSProperties}
        >
          Open to full-stack and DevOps roles, and to contract work where someone needs
          a feature taken from design through to a monitored production deployment.
        </p>
      </header>

      <div className="mt-20 grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        {/* <div data-reveal>
          <ContactForm />
        </div> */}

        <aside data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
          <h2 className="label">Direct</h2>
          <dl className="mt-5 divide-y divide-line border-y border-line">
            {CHANNELS.map((channel) => (
              <div key={channel.label} className="flex items-baseline justify-between gap-4 py-4">
                <dt className="font-mono text-xs text-dim">{channel.label}</dt>
                <dd>
                  <a
                    href={channel.href}
                    target={channel.href.startsWith("http") ? "_blank" : undefined}
                    rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
                    className="link-wipe font-mono text-sm text-muted hover:text-text"
                  >
                    {channel.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>

          <div className="panel mt-10 p-6">
            <p className="label">Résumé</p>
            <p className="mt-3 text-sm text-muted">
              Two pages, updated {profile.resume.updated}.
            </p>
            <ResumeButton className="btn btn-primary mt-6 w-full justify-center">
              View résumé
            </ResumeButton>
          </div>
        </aside>
      </div>
    </div>
  );
}
