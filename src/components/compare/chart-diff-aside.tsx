"use client";

import type { ReactNode } from "react";

export function ChartDiffAside({ title = "Relative gap", children }: { title?: string; children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-[var(--color-card-border)] bg-[color-mix(in_oklch,var(--color-card)_96%,var(--color-background))] px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{title}</p>
      <div className="mt-3 space-y-0">{children}</div>
    </div>
  );
}
