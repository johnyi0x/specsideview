/**
 * Comparative deltas for chart callouts. Smaller value is the baseline.
 * At ≥100% relative gap, show a multiplier (e.g. 3.10×) instead of a percent.
 */

const EPS = 1e-9;

function formatMultiplier(hi: number, lo: number): string {
  const m = hi / lo;
  return `${m >= 10 ? m.toFixed(1) : m.toFixed(2)}×`;
}

export type ComparativeKind = "performance" | "capacity" | "displayArea";

function comparativeSuffix(kind: ComparativeKind): string {
  switch (kind) {
    case "performance":
      return "faster";
    case "capacity":
      return "more capacity";
    case "displayArea":
      return "more viewable area";
  }
}

export type MetricDelta = {
  equal: boolean;
  winnerIsA: boolean;
  /** Numeric highlight only, e.g. "76%" or "3.10×" */
  delta: string;
  /** Words after the number, e.g. "faster", "more capacity" */
  suffix: string;
};

export function metricComparativeDelta(
  valueA: number,
  valueB: number,
  kind: ComparativeKind,
): MetricDelta {
  if (Math.abs(valueA - valueB) < EPS) {
    return { equal: true, winnerIsA: true, delta: "", suffix: "" };
  }
  const winnerIsA = valueA >= valueB;
  const maxV = Math.max(valueA, valueB);
  const minV = Math.min(valueA, valueB);
  const pct = ((maxV - minV) / minV) * 100;
  const useMultiplier = pct >= 100 - EPS;
  const delta = useMultiplier ? formatMultiplier(maxV, minV) : `${Math.round(pct)}%`;
  return {
    equal: false,
    winnerIsA,
    delta,
    suffix: comparativeSuffix(kind),
  };
}

export type WeightDelta = {
  equal: boolean;
  heavierIsA: boolean;
  delta: string;
  suffix: "heavier" | "lighter";
};

export function metricWeightDelta(kgA: number, kgB: number): WeightDelta {
  if (Math.abs(kgA - kgB) < EPS) {
    return { equal: true, heavierIsA: true, delta: "", suffix: "heavier" };
  }
  const l = Math.min(kgA, kgB);
  const h = Math.max(kgA, kgB);
  const heavierIsA = kgA > kgB;
  const pct = ((h - l) / l) * 100;
  const useMultiplier = pct >= 100 - EPS;
  return {
    equal: false,
    heavierIsA,
    delta: useMultiplier ? formatMultiplier(h, l) : `${Math.round(pct)}%`,
    suffix: "heavier",
  };
}

export function panelAreaMm2(widthMm: number, heightMm: number): number {
  return widthMm * heightMm;
}
