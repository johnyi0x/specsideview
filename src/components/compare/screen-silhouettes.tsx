"use client";

import type { Product } from "@/db/schema";
import type { LaptopSpecs } from "@/lib/spec-types";
import { getPanelGeometry } from "@/lib/panel-geometry";
import { panelAreaMm2 } from "@/lib/compare-diff";
import { ChartDiffAside } from "@/components/compare/chart-diff-aside";
import { DiffAreaBlurb } from "@/components/compare/diff-rich";
import { motion } from "framer-motion";

export function ScreenSilhouettes({
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
  const geoA = getPanelGeometry(specsA);
  const geoB = getPanelGeometry(specsB);
  if (!geoA || !geoB) return null;

  const maxMm = Math.max(geoA.widthMm, geoA.heightMm, geoB.widthMm, geoB.heightMm);
  const box = 160;

  const scaleA = box / maxMm;
  const scaleB = box / maxMm;

  const wa = geoA.widthMm * scaleA;
  const ha = geoA.heightMm * scaleA;
  const wb = geoB.widthMm * scaleB;
  const hb = geoB.heightMm * scaleB;

  const labelA = specsA.display?.label ?? `${geoA.widthMm.toFixed(0)}×${geoA.heightMm.toFixed(0)} mm panel`;
  const labelB = specsB.display?.label ?? `${geoB.widthMm.toFixed(0)}×${geoB.heightMm.toFixed(0)} mm panel`;

  const areaA = panelAreaMm2(geoA.widthMm, geoA.heightMm);
  const areaB = panelAreaMm2(geoB.widthMm, geoB.heightMm);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="card-surface rounded-2xl p-6 md:p-8"
    >
      <h3 className="font-display text-lg font-semibold tracking-tight md:text-xl">Display footprint</h3>
      <p className="mt-1 max-w-prose text-sm text-[var(--color-muted)]">
        Rectangles are drawn to the same scale using your stored panel width and height in millimeters (or a 16∶10
        estimate from diagonal inches when width/height are omitted).
      </p>
      <div className="mt-8 flex flex-wrap items-end justify-center gap-10 md:gap-16">
        <div className="flex flex-col items-center gap-3">
          <span className="text-center text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
            {productA.displayName}
          </span>
          <div className="flex h-44 items-end justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="rounded-xl border-2"
              style={{
                width: wa,
                height: ha,
                borderColor: "var(--chart-series-a)",
                boxShadow: "0 0 48px color-mix(in oklch, var(--chart-series-a) 40%, transparent)",
              }}
            />
          </div>
          <p className="max-w-[12rem] text-center text-xs text-[var(--color-muted)]">{labelA}</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="text-center text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
            {productB.displayName}
          </span>
          <div className="flex h-44 items-end justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.06 }}
              className="rounded-xl border-2"
              style={{
                width: wb,
                height: hb,
                borderColor: "var(--chart-series-b)",
                boxShadow: "0 0 48px color-mix(in oklch, var(--chart-series-b) 40%, transparent)",
              }}
            />
          </div>
          <p className="max-w-[12rem] text-center text-xs text-[var(--color-muted)]">{labelB}</p>
        </div>
      </div>

      <ChartDiffAside title="Relative gap">
        <DiffAreaBlurb nameA={productA.displayName} areaA={areaA} nameB={productB.displayName} areaB={areaB} />
        <p className="border-t border-[var(--color-card-border)] pt-3 text-xs leading-relaxed text-[var(--color-muted)]">
          Panel geometry ≈ {(areaA / 100).toFixed(0)} cm² vs {(areaB / 100).toFixed(0)} cm² (width × height).
        </p>
      </ChartDiffAside>
    </motion.section>
  );
}
