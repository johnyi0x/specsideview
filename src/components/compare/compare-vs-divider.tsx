/** Quiet pairing marker between two comparison cells (mobile stack + desktop gutter). */
export function CompareVsDivider() {
  return (
    <div className="flex items-center justify-center self-center py-2 lg:px-1 lg:py-0" aria-hidden>
      <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--color-muted)] opacity-60">
        vs
      </span>
    </div>
  );
}
