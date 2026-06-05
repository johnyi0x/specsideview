"use client";

import type { Product } from "@/db/schema";
import type { LaptopSpecs } from "@/lib/spec-types";
import { ChartDiffAside } from "@/components/compare/chart-diff-aside";
import { DiffHigherBlurb } from "@/components/compare/diff-rich";
import { motion } from "framer-motion";

function MiniMeter({
  label,
  valueA,
  valueB,
  unit,
  nameA,
  nameB,
}: {
  label: string;
  valueA: number;
  valueB: number;
  unit: string;
  nameA: string;
  nameB: string;
}) {
  const max = Math.max(valueA, valueB, 1);
  const pctA = (valueA / max) * 100;
  const pctB = (valueB / max) * 100;
  const fillA = "var(--chart-series-a)";
  const fillB = "var(--chart-series-b)";
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[var(--color-foreground)]">{label}</p>
      <div className="space-y-2">
        <div>
          <div className="mb-1 flex justify-between text-[10px] text-[var(--color-muted)]">
            <span className="truncate pr-2 font-medium" style={{ color: fillA }}>
              {nameA}
            </span>
            <span className="tabular-nums font-semibold" style={{ color: fillA }}>
              {valueA}
              {unit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_oklch,var(--color-card-border)_70%,transparent)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctA}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: fillA }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[10px] text-[var(--color-muted)]">
            <span className="truncate pr-2 font-medium" style={{ color: fillB }}>
              {nameB}
            </span>
            <span className="tabular-nums font-semibold" style={{ color: fillB }}>
              {valueB}
              {unit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_oklch,var(--color-card-border)_70%,transparent)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctB}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
              className="h-full rounded-full"
              style={{ background: fillB }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RamStorageMeters({
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
  const ra = specsA.ramGb;
  const rb = specsB.ramGb;
  const sa = specsA.storageGb;
  const sb = specsB.storageGb;
  const hasRam = ra != null && rb != null;
  const hasSto = sa != null && sb != null;
  if (!hasRam && !hasSto) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 }}
      className="card-surface rounded-2xl p-6 md:p-8"
    >
      <h3 className="font-display text-lg font-semibold tracking-tight md:text-xl">Memory & storage</h3>
      <p className="mt-1 max-w-prose text-sm text-[var(--color-muted)]">
        Straightforward capacity duel — pair with your written context when configs are not apples-to-apples (soldered
        vs SO-DIMM, etc.).
      </p>
      <div className="mt-6 space-y-8">
        {hasRam && (
          <MiniMeter
            label="System RAM"
            valueA={ra!}
            valueB={rb!}
            unit=" GB"
            nameA={productA.displayName}
            nameB={productB.displayName}
          />
        )}
        {hasSto && (
          <MiniMeter
            label="Primary storage"
            valueA={sa!}
            valueB={sb!}
            unit=" GB"
            nameA={productA.displayName}
            nameB={productB.displayName}
          />
        )}
      </div>

      <ChartDiffAside title="Relative gap">
        {hasRam && (
          <DiffHigherBlurb
            label="RAM"
            kind="capacity"
            nameA={productA.displayName}
            valueA={ra!}
            nameB={productB.displayName}
            valueB={rb!}
          />
        )}
        {hasSto && (
          <DiffHigherBlurb
            label="Storage"
            kind="capacity"
            nameA={productA.displayName}
            valueA={sa!}
            nameB={productB.displayName}
            valueB={sb!}
          />
        )}
      </ChartDiffAside>
    </motion.section>
  );
}
