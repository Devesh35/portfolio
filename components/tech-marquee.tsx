import { marqueeSkills } from "@/content/skills";

/**
 * Pure CSS marquee — the track holds two identical copies and translates -50%,
 * so it loops seamlessly with no JS and no layout thrash. Pauses on hover.
 */
export function TechMarquee() {
  const track = [...marqueeSkills, ...marqueeSkills];

  return (
    <div
      className="marquee-host mask-fade-x overflow-hidden border-y border-line py-4"
      aria-hidden="true"
    >
      <ul className="animate-marquee flex items-center gap-10 pr-10">
        {track.map((skill, i) => (
          <li key={`${skill}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-mono text-sm text-dim">{skill}</span>
            <span className="h-1 w-1 shrink-0 bg-ember-dim" />
          </li>
        ))}
      </ul>
    </div>
  );
}
