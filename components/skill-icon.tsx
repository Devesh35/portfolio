import { iconFor } from "@/content/skill-icons";

/**
 * The real brand mark for a skill, inlined at build time from SVG Logos,
 * devicon and simple-icons (see scripts/build-skill-icons.mjs). Nothing is
 * fetched at runtime and no icon library ships to the browser.
 *
 * Marks render at full brand colour. The two exceptions are measured, not
 * hand-listed: a mark whose lightest colour is too dark to read on this page
 * is tagged by the generator — neutral black marks (GitHub, Express) invert to
 * white the way those brands render on dark, and dark coloured marks (Datadog,
 * Razorpay) are lifted while keeping their hue.
 *
 * Practices that were never a product ("Schema design", "Blue-green
 * deployment") get a neutral dot so the chips stay aligned; tools with no mark
 * in any open set get a short monogram.
 */
function aspect(viewBox: string): number {
  const [, , w, h] = viewBox.split(/\s+/).map(Number);
  return w && h ? w / h : 1;
}

export function SkillIcon({
  name,
  size = 14,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const icon = iconFor(name);

  if (!icon) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="block h-1 w-1 rounded-full bg-current opacity-40" />
      </span>
    );
  }

  if (icon.kind === "monogram") {
    return (
      <span
        aria-hidden="true"
        className={`skill-icon inline-flex shrink-0 items-center justify-center rounded-[2px] border border-current font-mono font-semibold leading-none opacity-70 ${className}`}
        style={{
          width: Math.round(size * 1.5),
          height: size,
          fontSize: Math.max(6, Math.round(size * 0.46)),
        }}
      >
        {icon.text}
      </span>
    );
  }

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={icon.viewBox}
      className={`skill-icon shrink-0 ${icon.tone ? `skill-icon-${icon.tone}` : ""} ${className}`}
      style={{ height: size, width: Math.round(size * aspect(icon.viewBox)) }}
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
