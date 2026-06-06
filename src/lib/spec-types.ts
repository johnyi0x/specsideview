/**
 * Expected shape inside `products.specs` (JSON). All fields optional —
 * charts and tables render only what you provide after manual QA.
 */
export type LaptopSpecs = {
  cpu?: {
    label: string;
    benchmarkScore?: number;
    geekbenchSingle?: number;
    geekbenchMulti?: number;
  };
  gpu?: {
    label: string;
    benchmarkScore?: number;
  };
  ai?: {
    label?: string;
    benchmarkScore?: number;
  };
  ramGb?: number;
  storageGb?: number;
  display?: {
    label?: string;
    diagonalIn?: number;
    widthMm?: number;
    heightMm?: number;
    resolution?: string;
    refreshHz?: number;
    peakNits?: number;
    panelType?: string;
  };
  weightKg?: number;
  /** @deprecated prefer specs.battery.capacityWh */
  batteryWh?: number;
  battery?: {
    capacityWh?: number;
    claimedLifeHours?: string;
    chargerWatt?: number;
  };
  connectivity?: {
    wifi?: string;
    bluetooth?: string;
    fingerprint?: string;
    infrared?: string;
    webcam?: string;
    webcamResolution?: string;
  };
  ports?: {
    usbA?: string;
    usbC?: string;
    thunderbolt?: string;
    hdmi?: string;
    displayPort?: string;
    vga?: string;
    audioJack?: string;
    ethernet?: string;
    sdCard?: string;
    proprietaryCharging?: string;
  };
  input?: {
    keyboard?: string;
    touchpad?: string;
    touchpadWidthMm?: number;
    touchpadHeightMm?: number;
  };
  highlights?: string[];
};

export function parseLaptopSpecs(raw: Record<string, unknown>): LaptopSpecs {
  return raw as LaptopSpecs;
}

export function cpuMultiScore(specs: LaptopSpecs): number | undefined {
  const m = specs.cpu?.geekbenchMulti;
  if (m != null) return m;
  return specs.cpu?.benchmarkScore;
}

export function cpuSingleScore(specs: LaptopSpecs): number | undefined {
  return specs.cpu?.geekbenchSingle;
}

export function batteryWh(specs: LaptopSpecs): number | undefined {
  return specs.battery?.capacityWh ?? specs.batteryWh;
}

/** Format a spec value for table cells; returns em dash when missing. */
export function fmtSpec(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return String(value);
}
