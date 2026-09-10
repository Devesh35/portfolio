import { SkillIcon } from "@/components/skill-icon";
import { CATEGORY, type DiagramGroup, type DiagramNode } from "@/lib/architecture";

interface NodeDetailsProps {
  shown: DiagramNode | DiagramGroup | null;
  /** Stack name → what it did on this project (Project.skillsUsed). */
  how: Record<string, string>;
}

/**
 * What the selected box is made of: each tool and what it did here (only
 * when the project records that). Fixed height so selecting never shifts the
 * page; an idle line drawing fills it when nothing is selected.
 */
export function NodeDetails({ shown, how }: NodeDetailsProps) {
  return (
    <div className="rule-fade-x mt-8 pt-5">
      <div className="scroll-thin h-52 overflow-y-auto" aria-live="polite">
      {shown ? (
        <>
          <DetailHeader shown={shown} />
          <ul className="mt-2 divide-y divide-line/60">
            {shown.items.map((item) => (
              <DetailRow key={item} tool={item} how={how[item]} />
            ))}
          </ul>
        </>
      ) : (
        <IdleArt />
      )}
      </div>
    </div>
  );
}

function DetailHeader({ shown }: { shown: DiagramNode | DiagramGroup }) {
  const { label, color } = CATEGORY[shown.category];
  return (
    <>
      <p className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-dim">
        <span>Node detail</span>
        <span className="rounded border border-line px-1.5 py-0.5 normal-case tracking-normal" style={{ color }}>
          {label.toLowerCase()}
        </span>
      </p>
      <p className="mt-1.5 font-sans text-base font-semibold tracking-[-0.01em] text-text">{shown.label}</p>
    </>
  );
}

function DetailRow({ tool, how }: { tool: string; how?: string }) {
  return (
    <li className="grid gap-x-6 gap-y-1 py-2 text-sm lg:grid-cols-[13rem_1fr]">
      <span className="flex items-center gap-2 font-mono text-xs text-text">
        <SkillIcon name={tool} size={13} />
        {tool}
      </span>
      <span className="leading-relaxed text-muted">{how ?? <span className="text-dim">—</span>}</span>
    </li>
  );
}

/** Idle state: a small system map in the site's hairline style, with the one
 *  instruction that matters. Decorative — the caption carries the meaning. */
function IdleArt() {
  return (
    <div className="flex h-full items-center gap-6">
      <svg
        aria-hidden="true"
        viewBox="0 0 320 150"
        className="h-full w-auto shrink-0 text-line-bright"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* boxes */}
        <rect x="20" y="20" width="70" height="34" rx="4" />
        <rect x="125" y="20" width="70" height="34" rx="4" />
        <rect x="230" y="20" width="70" height="34" rx="4" />
        <rect x="125" y="96" width="70" height="34" rx="4" />
        <rect x="230" y="96" width="70" height="34" rx="4" />
        {/* box contents: a glyph tile and two text bars */}
        {[
          [20, 20],
          [125, 20],
          [230, 20],
          [125, 96],
          [230, 96],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x + 8} y={y + 9} width="12" height="12" rx="2.5" />
            <path d={`M${x + 26} ${y + 13}h28M${x + 26} ${y + 20}h16`} opacity="0.7" />
          </g>
        ))}
        {/* icon tiles under the second box */}
        <g opacity="0.7">
          <rect x="133" y="40" width="8" height="8" rx="1.5" />
          <rect x="145" y="40" width="8" height="8" rx="1.5" />
          <rect x="157" y="40" width="8" height="8" rx="1.5" />
        </g>
        {/* connectors */}
        <path d="M90 37h30" />
        <path d="M195 37h30" />
        <path d="M160 54v37" />
        <path d="M265 54v37" strokeDasharray="2 3" />
        <path d="M195 113h30" strokeDasharray="5 4" />
        {/* arrowheads */}
        <path d="M117 34l4 3-4 3M222 34l4 3-4 3M157 88l3 4 3-4M262 88l3 4 3-4M222 110l4 3-4 3" />
        {/* the highlighted box, in the accent */}
        <g className="text-ember" stroke="currentColor">
          <rect x="124" y="19" width="72" height="36" rx="4.5" strokeWidth="1.2" />
          <path d="M156 66l6 14 2-6 6-2z" fill="currentColor" strokeWidth="0.8" />
        </g>
      </svg>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-dim">Node detail</p>
        <p className="mt-1.5 font-sans text-base font-semibold tracking-[-0.01em] text-text">Pick a box</p>
        <p className="mt-1 max-w-[34rem] text-[13px] leading-relaxed text-muted">
          Hover any box in the diagrams to see the tools behind it and what each one did on this project. Click to keep it open; Esc lets go. On a touch screen, tap.
        </p>
      </div>
    </div>
  );
}
