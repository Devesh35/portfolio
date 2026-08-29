/**
 * Line icons for the mobile menu, drawn to match the site's hairline weight
 * (1.25px stroke on a 24px grid) rather than pulled from an icon library.
 * Five icons is not worth a dependency, and a library's default 2px stroke
 * would sit heavier than every other line on the page.
 */
const PATHS: Record<string, React.ReactNode> = {
  "/": (
    <>
      <path d="M3.5 10.2 12 3.8l8.5 6.4V20a.8.8 0 0 1-.8.8h-4.4v-6h-6.6v6H4.3a.8.8 0 0 1-.8-.8Z" />
    </>
  ),
  "/work": (
    <>
      <rect x="3" y="7.2" width="18" height="13" rx="1.2" />
      <path d="M9 7.2V5.4a1.2 1.2 0 0 1 1.2-1.2h3.6A1.2 1.2 0 0 1 15 5.4v1.8" />
      <path d="M3 12.4h18" />
    </>
  ),
  "/skills": (
    <>
      <path d="M12 3.4 21 8l-9 4.6L3 8Z" />
      <path d="m3 12.6 9 4.6 9-4.6" />
      <path d="m3 16.9 9 4.6 9-4.6" />
    </>
  ),
  "/about": (
    <>
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  "/contact": (
    <>
      <rect x="3" y="5.2" width="18" height="13.6" rx="1.4" />
      <path d="m3.6 6.4 8.4 6 8.4-6" />
    </>
  ),
};

export function NavIcon({ href, className = "" }: { href: string; className?: string }) {
  const paths = PATHS[href];
  if (!paths) return null;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {paths}
    </svg>
  );
}
