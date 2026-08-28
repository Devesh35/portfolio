import { CAREER_START } from "@/content/profile";

/** "4.9" — one decimal, floored, so it never overstates. */
export function yearsSinceCareerStart(now: Date = new Date()): string {
  const months =
    (now.getFullYear() - CAREER_START.getFullYear()) * 12 +
    (now.getMonth() - CAREER_START.getMonth());
  return (Math.floor((months / 12) * 10) / 10).toFixed(1);
}
