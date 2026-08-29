"use client";

import { useEffect } from "react";

import { profile } from "@/content/profile";

/**
 * A note for the people who open DevTools first and read the page second.
 * Static strings from content/, printed once — nothing tracked, nothing sent.
 */
export function ConsoleSignature() {
  useEffect(() => {
    if (window.__signed) return;
    window.__signed = true;

    console.log(
      "%cDevesh Singh%c — Full Stack & DevOps Engineer",
      "color:#e8734a;font-size:16px;font-weight:700",
      "color:#98a1ac;font-size:13px",
    );
    console.log(
      "%cBuilt from scratch with Next.js 16, React 19 and Tailwind 4 — no template, no animation libraries.\n" +
        "The /work timeline is a single SVG generated at build time.\n" +
        `Résumé: ${profile.resume.href} · Say hi: ${profile.email}`,
      "color:#6b7480;font-size:12px;line-height:1.7",
    );
  }, []);

  return null;
}

declare global {
  interface Window {
    __signed?: boolean;
  }
}
