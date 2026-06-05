"use client";

import type { ReactNode } from "react";

import {
  metricComparativeDelta,
  metricWeightDelta,
  type ComparativeKind,
} from "@/lib/compare-diff";

function SeriesName({ isA, children }: { isA: boolean; children: ReactNode }) {
  return (
    <span className="font-medium" style={{ color: isA ? "var(--chart-series-a)" : "var(--chart-series-b)" }}>
      {children}
    </span>
  );
}

/** Inline delta — winner hue, tabular figures, no badge or bold. */
function DeltaFigure({ winnerIsA, delta, suffix }: { winnerIsA: boolean; delta: string; suffix: string }) {
  const hue = winnerIsA ? "var(--chart-series-a)" : "var(--chart-series-b)";
  return (
    <span className="whitespace-nowrap">
      <span className="tabular-nums tracking-tight" style={{ color: hue }}>
        {delta}
      </span>
      <span className="text-[var(--color-muted)]"> {suffix}</span>
    </span>
  );
}

function DiffRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 border-t border-[var(--color-card-border)] pt-3 first:border-t-0 first:pt-0">
      <span
        className="mt-0.5 w-16 shrink-0 text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]"
        aria-hidden
      >
        {label}
      </span>
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-[var(--color-foreground)]">{children}</p>
    </div>
  );
}

function ComparativeBlurb({
  label,
  nameA,
  valueA,
  nameB,
  valueB,
  kind,
}: {
  label: string;
  nameA: string;
  valueA: number;
  nameB: string;
  valueB: number;
  kind: ComparativeKind;
}) {
  const meta = metricComparativeDelta(valueA, valueB, kind);
  if (meta.equal) {
    return (
      <DiffRow label={label}>
        <SeriesName isA>{nameA}</SeriesName>
        <span className="text-[var(--color-muted)]"> and </span>
        <SeriesName isA={false}>{nameB}</SeriesName>
        <span className="text-[var(--color-muted)]"> are even on this metric.</span>
      </DiffRow>
    );
  }
  const winA = meta.winnerIsA;
  const winnerName = winA ? nameA : nameB;
  const otherName = winA ? nameB : nameA;
  return (
    <DiffRow label={label}>
      <SeriesName isA={winA}>{winnerName}</SeriesName>
      <span className="text-[var(--color-muted)]"> is </span>
      <DeltaFigure winnerIsA={winA} delta={meta.delta} suffix={meta.suffix} />
      <span className="text-[var(--color-muted)]"> than </span>
      <SeriesName isA={!winA}>{otherName}</SeriesName>
      <span className="text-[var(--color-muted)]">.</span>
    </DiffRow>
  );
}

export function DiffHigherBlurb({
  label,
  nameA,
  valueA,
  nameB,
  valueB,
  kind = "performance",
}: {
  label: string;
  nameA: string;
  valueA: number;
  nameB: string;
  valueB: number;
  kind?: ComparativeKind;
}) {
  return (
    <ComparativeBlurb label={label} nameA={nameA} valueA={valueA} nameB={nameB} valueB={valueB} kind={kind} />
  );
}

export function DiffAreaBlurb({
  nameA,
  areaA,
  nameB,
  areaB,
}: {
  nameA: string;
  areaA: number;
  nameB: string;
  areaB: number;
}) {
  return (
    <ComparativeBlurb
      label="Display"
      nameA={nameA}
      valueA={areaA}
      nameB={nameB}
      valueB={areaB}
      kind="displayArea"
    />
  );
}

export function DiffHeavierBlurb({ nameA, kgA, nameB, kgB }: { nameA: string; kgA: number; nameB: string; kgB: number }) {
  const meta = metricWeightDelta(kgA, kgB);
  if (meta.equal) {
    return (
      <DiffRow label="Weight">
        <SeriesName isA>{nameA}</SeriesName>
        <span className="text-[var(--color-muted)]"> and </span>
        <SeriesName isA={false}>{nameB}</SeriesName>
        <span className="text-[var(--color-muted)]"> weigh the same in your dataset.</span>
      </DiffRow>
    );
  }
  const heavyA = meta.heavierIsA;
  const heavyName = heavyA ? nameA : nameB;
  const lightName = heavyA ? nameB : nameA;
  const l = Math.min(kgA, kgB);
  const h = Math.max(kgA, kgB);
  return (
    <DiffRow label="Weight">
      <SeriesName isA={heavyA}>{heavyName}</SeriesName>
      <span className="text-[var(--color-muted)]"> is </span>
      <DeltaFigure winnerIsA={heavyA} delta={meta.delta} suffix={meta.suffix} />
      <span className="text-[var(--color-muted)]"> than </span>
      <SeriesName isA={!heavyA}>{lightName}</SeriesName>
      <span className="text-[var(--color-muted)]">
        {" "}
        ({l.toFixed(2)} kg vs {h.toFixed(2)} kg).
      </span>
    </DiffRow>
  );
}
