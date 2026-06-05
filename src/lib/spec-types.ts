/**
 * Expected shape inside `products.specs` (JSON). All fields optional —
 * charts render only what you provide after manual QA.
 */
export type LaptopSpecs = {
  cpu?: {
    label: string;
    /**
     * @deprecated Prefer geekbenchMulti; still used as Geekbench 6 multi-core fallback
     * when geekbenchMulti is omitted.
     */
    benchmarkScore?: number;
    /** Geekbench 6 CPU single-core (or equivalent you normalize to that scale). */
    geekbenchSingle?: number;
    /** Geekbench 6 CPU multi-core. */
    geekbenchMulti?: number;
  };
  gpu?: {
    label: string;
    benchmarkScore?: number;
  };
  /** AI / ML benchmark (e.g. Geekbench ML, UL Procyon AI, or your own index). */
  ai?: {
    label?: string;
    benchmarkScore?: number;
  };
  ramGb?: number;
  storageGb?: number;
  /** Physical panel size drives the on-screen silhouette comparison. */
  display?: {
    label?: string;
    diagonalIn?: number;
    widthMm?: number;
    heightMm?: number;
    resolution?: string;
    refreshHz?: number;
    peakNits?: number;
  };
  weightKg?: number;
  batteryWh?: number;
  /** Freeform bullet strings for narrative callouts. */
  highlights?: string[];
};

export function parseLaptopSpecs(raw: Record<string, unknown>): LaptopSpecs {
  return raw as LaptopSpecs;
}

/** Multi-core value for charts: explicit Geekbench 6 multi, else legacy benchmarkScore. */
export function cpuMultiScore(specs: LaptopSpecs): number | undefined {
  const m = specs.cpu?.geekbenchMulti;
  if (m != null) return m;
  return specs.cpu?.benchmarkScore;
}

export function cpuSingleScore(specs: LaptopSpecs): number | undefined {
  return specs.cpu?.geekbenchSingle;
}
