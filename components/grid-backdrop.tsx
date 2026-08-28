/**
 * Hero backdrop: masked dot grid, one drifting ember glow, one slow scan line.
 * Everything is transform/opacity only, so it composites on the GPU and never
 * triggers layout. Purely decorative — hidden from assistive tech.
 */
export function GridBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="dot-grid mask-fade-b absolute inset-0" />
      <div className="animate-glow absolute -right-40 -top-56 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(232,115,74,0.16)_0%,rgba(232,115,74,0.04)_42%,transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-40 overflow-hidden">
        <div className="animate-scan h-px w-full bg-gradient-to-r from-transparent via-ember/25 to-transparent" />
      </div>
    </div>
  );
}
