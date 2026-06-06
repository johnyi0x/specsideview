import type { LaptopSpecs } from "@/lib/spec-types";
import { batteryWh, cpuMultiScore, cpuSingleScore, fmtSpec } from "@/lib/spec-types";

export type SpecRow = {
  label: string;
  a: string;
  b: string;
};

export type SpecSection = {
  id: string;
  title: string;
  rows: SpecRow[];
};

function row(label: string, a: string | number | null | undefined, b: string | number | null | undefined): SpecRow {
  return { label, a: fmtSpec(a), b: fmtSpec(b) };
}

/** Build nanoreview-style comparison table sections from two spec documents. */
export function buildSpecSections(specsA: LaptopSpecs, specsB: LaptopSpecs): SpecSection[] {
  const sections: SpecSection[] = [];

  const performance: SpecRow[] = [
    row("CPU", specsA.cpu?.label, specsB.cpu?.label),
    row("Geekbench 6 single-core", cpuSingleScore(specsA), cpuSingleScore(specsB)),
    row("Geekbench 6 multi-core", cpuMultiScore(specsA), cpuMultiScore(specsB)),
    row("GPU", specsA.gpu?.label, specsB.gpu?.label),
    row("GPU benchmark score", specsA.gpu?.benchmarkScore, specsB.gpu?.benchmarkScore),
    row("AI / ML benchmark", specsA.ai?.benchmarkScore, specsB.ai?.benchmarkScore),
    row("RAM", specsA.ramGb != null ? `${specsA.ramGb} GB` : null, specsB.ramGb != null ? `${specsB.ramGb} GB` : null),
    row(
      "Storage",
      specsA.storageGb != null ? `${specsA.storageGb} GB` : null,
      specsB.storageGb != null ? `${specsB.storageGb} GB` : null,
    ),
  ].filter((r) => r.a !== "—" || r.b !== "—");

  if (performance.length) sections.push({ id: "performance", title: "Performance", rows: performance });

  const display: SpecRow[] = [
    row("Panel", specsA.display?.label, specsB.display?.label),
    row("Size", specsA.display?.diagonalIn != null ? `${specsA.display.diagonalIn}"` : null, specsB.display?.diagonalIn != null ? `${specsB.display.diagonalIn}"` : null),
    row("Resolution", specsA.display?.resolution, specsB.display?.resolution),
    row("Refresh rate", specsA.display?.refreshHz != null ? `${specsA.display.refreshHz} Hz` : null, specsB.display?.refreshHz != null ? `${specsB.display.refreshHz} Hz` : null),
    row("Peak brightness", specsA.display?.peakNits != null ? `${specsA.display.peakNits} nits` : null, specsB.display?.peakNits != null ? `${specsB.display.peakNits} nits` : null),
    row("Panel type", specsA.display?.panelType, specsB.display?.panelType),
    row("Weight", specsA.weightKg != null ? `${specsA.weightKg} kg` : null, specsB.weightKg != null ? `${specsB.weightKg} kg` : null),
  ].filter((r) => r.a !== "—" || r.b !== "—");

  if (display.length) sections.push({ id: "display", title: "Display & chassis", rows: display });

  const battery: SpecRow[] = [
    row("Battery capacity", batteryWh(specsA) != null ? `${batteryWh(specsA)} Wh` : null, batteryWh(specsB) != null ? `${batteryWh(specsB)} Wh` : null),
    row("Claimed battery life", specsA.battery?.claimedLifeHours, specsB.battery?.claimedLifeHours),
    row("Charger", specsA.battery?.chargerWatt != null ? `${specsA.battery.chargerWatt} W` : null, specsB.battery?.chargerWatt != null ? `${specsB.battery.chargerWatt} W` : null),
  ].filter((r) => r.a !== "—" || r.b !== "—");

  if (battery.length) sections.push({ id: "battery", title: "Battery", rows: battery });

  const conn = specsA.connectivity;
  const connB = specsB.connectivity;
  const connectivity: SpecRow[] = [
    row("Wi-Fi", conn?.wifi, connB?.wifi),
    row("Bluetooth", conn?.bluetooth, connB?.bluetooth),
    row("Fingerprint", conn?.fingerprint, connB?.fingerprint),
    row("Infrared sensor", conn?.infrared, connB?.infrared),
    row("Webcam", conn?.webcam, connB?.webcam),
    row("Webcam resolution", conn?.webcamResolution, connB?.webcamResolution),
  ].filter((r) => r.a !== "—" || r.b !== "—");

  if (connectivity.length) sections.push({ id: "connectivity", title: "Connectivity", rows: connectivity });

  const portsA = specsA.ports;
  const portsB = specsB.ports;
  const ports: SpecRow[] = [
    row("USB-A", portsA?.usbA, portsB?.usbA),
    row("USB Type-C", portsA?.usbC, portsB?.usbC),
    row("Thunderbolt", portsA?.thunderbolt, portsB?.thunderbolt),
    row("HDMI", portsA?.hdmi, portsB?.hdmi),
    row("DisplayPort", portsA?.displayPort, portsB?.displayPort),
    row("VGA", portsA?.vga, portsB?.vga),
    row("Audio jack (3.5 mm)", portsA?.audioJack, portsB?.audioJack),
    row("Ethernet (RJ45)", portsA?.ethernet, portsB?.ethernet),
    row("SD card reader", portsA?.sdCard, portsB?.sdCard),
    row("Proprietary charging", portsA?.proprietaryCharging, portsB?.proprietaryCharging),
  ].filter((r) => r.a !== "—" || r.b !== "—");

  if (ports.length) sections.push({ id: "ports", title: "Ports", rows: ports });

  const inpA = specsA.input;
  const inpB = specsB.input;
  const input: SpecRow[] = [
    row("Keyboard", inpA?.keyboard, inpB?.keyboard),
    row("Touchpad", inpA?.touchpad, inpB?.touchpad),
    row(
      "Touchpad size",
      inpA?.touchpadWidthMm && inpA?.touchpadHeightMm ? `${inpA.touchpadWidthMm} × ${inpA.touchpadHeightMm} mm` : null,
      inpB?.touchpadWidthMm && inpB?.touchpadHeightMm ? `${inpB.touchpadWidthMm} × ${inpB.touchpadHeightMm} mm` : null,
    ),
  ].filter((r) => r.a !== "—" || r.b !== "—");

  if (input.length) sections.push({ id: "input", title: "Input", rows: input });

  return sections;
}
