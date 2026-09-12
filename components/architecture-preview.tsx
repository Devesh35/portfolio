import Image from "next/image";

/**
 * The still of the 3D scene (public/architecture-preview.webp — a headless
 * 2× render of the live scene, re-generated after geometry changes). Used
 * as the tap target on phones and as the desktop fallback when WebGL
 * isn't available (round 52; nothing shows while the chunk loads — round 53).
 *
 * It's above the fold wherever it appears, so it loads eagerly (Next flags
 * it as the LCP otherwise). `priority` would also add a <link rel=preload>,
 * which on desktop would fetch ~330 KB for an image that stays hidden —
 * so eager loading only, no preload, unless the caller asks.
 */
export const PREVIEW_ALT =
  "Line-art cutaway of an office building standing in for a software system: glass frontend floors, elevator shafts as the API, a server-room basement as the backend, colour-coded utility pipes for external integrations, and a foundation for infra.";

export function ArchitecturePreview({ priority = false, sizes = "100vw" }: { priority?: boolean; sizes?: string }) {
  return (
    <Image
      src="/architecture-preview.webp"
      alt={PREVIEW_ALT}
      width={1520}
      height={1440}
      sizes={sizes}
      priority={priority}
      loading="eager"
      className="h-full w-full object-contain"
    />
  );
}

/** Fallback for the desktop hero column: the still, centred, same footprint as the live scene. */
export function ArchitectureFallback() {
  return (
    <div className="relative flex h-full min-h-[26rem] w-full items-center justify-center">
      <ArchitecturePreview sizes="(min-width: 992px) 44vw, 0px" />
    </div>
  );
}
