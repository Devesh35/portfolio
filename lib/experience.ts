import { CAREER_START, CAREER_END } from "@/content/profile";

/** Months worked, clamped at CAREER_END so the number stops growing after the exit. */
function monthsWorked(now: Date): number {
  const at = now > CAREER_END ? CAREER_END : now;
  return (
    (at.getFullYear() - CAREER_START.getFullYear()) * 12 +
    (at.getMonth() - CAREER_START.getMonth())
  );
}

/** "4.9" — one decimal, floored, so it never overstates. */
export function yearsSinceCareerStart(now: Date = new Date()): string {
  const months = monthsWorked(now);
  return (Math.floor((months / 12) * 10) / 10).toFixed(1);
}

/**
 * "Nearly 5 Years" / "5+ Years" — the résumé-header phrasing, derived so it
 * can never drift the way the four hand-typed PDFs did.
 */
export function experienceLabel(now: Date = new Date()): string {
  const months = monthsWorked(now);
  const whole = Math.floor(months / 12);
  return months % 12 >= 9 ? `Nearly ${whole + 1} Years` : `${whole}+ Years`;
}
