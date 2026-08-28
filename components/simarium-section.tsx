import {simarium, STATUS_LABEL, type ToolStatus} from "@/content/simarium";

const STATUS_STYLE: Record<ToolStatus, string> = {
  live: "border-ember text-ember",
  partial: "border-line-bright text-muted",
  building: "border-line text-dim",
};

export function SimariumSection() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-void">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(232,115,74,0.13)_0%,transparent_68%)]"
        aria-hidden="true"
      />
      <div
        className="dot-grid pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div
          data-reveal
          className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              {simarium.name}
              <span className="text-dim"> — built for myself</span>
            </h2>
          </div>
          <a
            href={simarium.url}
            target="_blank"
            rel="noreferrer"
            className="link-wipe font-mono text-sm text-ember">
            {simarium.url.replace(/^https?:\/\//, "")} ↗
          </a>
        </div>
        <div data-rule className="mt-6 h-px w-full bg-line" />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div data-reveal className="lg:sticky lg:top-24 lg:self-start">
            <p className="font-display text-2xl font-medium leading-snug sm:text-3xl">
              {simarium.tagline}
            </p>
            <p className="prose-body mt-6">{simarium.body}</p>
            <blockquote className="mt-8 border-l-2 border-ember-dim pl-5 text-[0.9375rem] italic leading-relaxed text-muted">
              {simarium.why}
            </blockquote>
            <a
              href={simarium.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-8">
              Open {simarium.product}
            </a>
          </div>

          <ul className="divide-y divide-line border-y border-line">
            {simarium.tools.map((tool, i) => (
              <li
                key={tool.name}
                data-reveal
                style={{"--reveal-delay": `${i * 80}ms`} as React.CSSProperties}
                className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-6">
                <div className="flex items-center gap-3 sm:w-48 sm:shrink-0">
                  <span
                    className={`border px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-widest ${STATUS_STYLE[tool.status]}`}>
                    {STATUS_LABEL[tool.status]}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {tool.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
