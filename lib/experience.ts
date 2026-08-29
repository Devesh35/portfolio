import { CAREER_START } from "@/content/profile";

/** "4.9" — one decimal, floored, so it never overstates. */
export function yearsSinceCareerStart(now: Date = new Date()): string {
  const months =
    (now.getFullYear() - CAREER_START.getFullYear()) * 12 +
    (now.getMonth() - CAREER_START.getMonth());
  return (Math.floor((months / 12) * 10) / 10).toFixed(1);
}

/**
 * "Nearly 5 Years" / "5+ Years" — the résumé-header phrasing, derived so it
 * can never drift the way the four hand-typed PDFs did.
 */
export function experienceLabel(now: Date = new Date()): string {
  const months =
    (now.getFullYear() - CAREER_START.getFullYear()) * 12 +
    (now.getMonth() - CAREER_START.getMonth());
  const whole = Math.floor(months / 12);
  return months % 12 >= 9 ? `Nearly ${whole + 1} Years` : `${whole}+ Years`;
}
