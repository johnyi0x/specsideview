import type { LaptopSpecs } from "@/lib/spec-types";

/** Returns width/height in mm for drawing proportional silhouettes. */
export function getPanelGeometry(specs: LaptopSpecs): { widthMm: number; heightMm: number } | null {
  const d = specs.display;
  if (!d) return null;
  if (d.widthMm && d.heightMm) {
    return { widthMm: d.widthMm, heightMm: d.heightMm };
  }
  if (d.diagonalIn) {
    const ratio = 16 / 10;
    const diagMm = d.diagonalIn * 25.4;
    const h = diagMm / Math.sqrt(ratio * ratio + 1);
    const w = h * ratio;
    return { widthMm: w, heightMm: h };
  }
  return null;
}
