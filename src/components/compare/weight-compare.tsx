"use client";

import type { Product } from "@/db/schema";
import type { LaptopSpecs } from "@/lib/spec-types";
import { ChartDiffAside } from "@/components/compare/chart-diff-aside";
import { DiffHeavierBlurb } from "@/components/compare/diff-rich";
import { motion } from "framer-motion";

function WeightColumn({
  weightKg,
  productName,
  barHeightPct,
  fill,
  delay,
}: {
  weightKg: number;
  productName: string;
  barHeightPct: number;
  fill: string;
  delay: number;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-32 w-16 items-end justify-center rounded-t-lg bg-[color-mix(in_oklch,var(--color-card-border)_60%,transparent)]">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${barHeightPct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 16, delay }}
          className="w-full rounded-t-md"
          style={{ background: fill }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color: fill }}>
        {weightKg.toFixed(2)} kg
      </span>
      <span className="flex min-h-[2.5rem] max-w-[9rem] items-start justify-center text-center text-[10px] uppercase leading-snug tracking-wide text-[var(--color-muted)] line-clamp-2">
        {productName}
      </span>
    </div>
  );
}

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
      <div className="mx-auto mt-8 grid max-w-xs grid-cols-2 gap-8 place-items-start">
        <WeightColumn
          weightKg={wa}
          productName={productA.displayName}
          barHeightPct={hA}
          fill="var(--chart-series-a)"
          delay={0}
        />
        <WeightColumn
          weightKg={wb}
          productName={productB.displayName}
          barHeightPct={hB}
          fill="var(--chart-series-b)"
          delay={0.05}
        />
      </div>

      <ChartDiffAside title="Relative gap">
        <DiffHeavierBlurb nameA={productA.displayName} kgA={wa} nameB={productB.displayName} kgB={wb} />
      </ChartDiffAside>
    </motion.section>
  );
}
