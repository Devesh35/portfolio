import { permanentRedirect } from "next/navigation";

/**
 * The skills page moved to /systems (SYSTEMS-PAGE-PLAN.md, 2026-09-09). The
 * real redirect — query string included, so ?skill= deep links survive — is
 * the permanent entry in next.config.ts, which runs before this route is ever
 * reached; this stub only exists because the file does, and backstops the
 * config entry if it is ever removed.
 */
export default function SkillsMoved() {
  permanentRedirect("/systems");
}
