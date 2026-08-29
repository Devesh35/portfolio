/**
 * Build-mode flag for editorial/meta UI (internal reminders like the
 * "screenshots pending" strip). Only an explicit development environment
 * shows them — no NODE_ENV, or any other value, is treated as production.
 */
export const isDevBuild = process.env.NODE_ENV === "development";
