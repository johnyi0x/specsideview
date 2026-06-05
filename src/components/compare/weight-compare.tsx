"use client";

import type { Product } from "@/db/schema";
import type { LaptopSpecs } from "@/lib/spec-types";
import { ChartDiffAside } from "@/components/compare/chart-diff-aside";
import { DiffHeavierBlurb } from "@/components/compare/diff-rich";
import { motion } from "framer-motion";

export function WeightCompare({
  productA,
  productB,
  specsA,
  specsB,
}: {
  productA: Product;
  productB: Product;
  specsA: LaptopSpecs;
  specsB: LaptopSpecs;
}) {
  const wa = specsA.weightKg;
  const wb = specsB.weightKg;
  if (wa == null || wb == null) return null;
  const max = Math.max(wa, wb);
  const hA = (wa / max) * 100;
  const hB = (wb / max) * 100;

  const fillA = "var(--chart-series-a)";
  const fillB = "var(--chart-series-b)";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="card-surface rounded-2xl p-6 md:p-8"
    >
      <h3 className="font-display text-lg font-semibold tracking-tight md:text-xl">Carry weight</h3>
      <p className="mt-1 max-w-prose text-sm text-[var(--color-muted)]">
        Taller bar = heavier chassis in your dataset. Great for backpack vs desktop-replacement tradeoffs.
      </p>
      <div className="mt-8 flex items-end justify-center gap-12">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-32 w-16 items-end justify-center rounded-t-lg bg-[color-mix(in_oklch,var(--color-card-border)_60%,transparent)]">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${hA}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 16 }}
              className="w-full rounded-t-md"
              style={{ background: fillA }}
            />
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--chart-series-a)" }}>
            {wa.toFixed(2)} kg
          </span>
          <span className="max-w-[9rem] text-center text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            {productA.displayName}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-32 w-16 items-end justify-center rounded-t-lg bg-[color-mix(in_oklch,var(--color-card-border)_60%,transparent)]">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${hB}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.05 }}
              className="w-full rounded-t-md"
              style={{ background: fillB }}
            />
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--chart-series-b)" }}>
            {wb.toFixed(2)} kg
          </span>
          <span className="max-w-[9rem] text-center text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            {productB.displayName}
          </span>
        </div>
      </div>

      <ChartDiffAside title="Relative gap">
        <DiffHeavierBlurb nameA={productA.displayName} kgA={wa} nameB={productB.displayName} kgB={wb} />
      </ChartDiffAside>
    </motion.section>
  );
}
