/** Quiet pairing marker between two comparison cells (center gutter). */
export function CompareVsDivider() {
  return (
    <div className="flex items-center justify-center self-stretch px-0.5 pt-8 sm:px-1 sm:pt-12" aria-hidden>
      <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] opacity-50 sm:text-[10px] sm:tracking-[0.32em] sm:opacity-60">
        vs
      </span>
    </div>
  );
}
