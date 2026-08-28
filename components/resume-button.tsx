"use client";

import { useResume } from "@/components/resume-modal";
import { profile } from "@/content/profile";

/**
 * Opens the résumé viewer. Rendered as a real link to the PDF, so without
 * JavaScript it still downloads — the modal is the enhancement, not the feature.
 */
export function ResumeButton({
  className = "btn",
  children = "View résumé",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { open } = useResume();

  return (
    <a
      href={profile.resume.href}
      download={profile.resume.downloadAs}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        open();
      }}
      className={className}
    >
      {children}
    </a>
  );
}
