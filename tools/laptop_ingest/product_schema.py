"""Shape of a laptop draft JSON file — matches SpecSideView `products` + specs."""

from __future__ import annotations

import re
from typing import Any

REQUIRED_TOP = ("slug", "displayName", "specs")


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    if "-vs-" in s:
        s = s.replace("-vs-", "-")
    return s


def validate_draft(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    for key in REQUIRED_TOP:
        if key not in data or not data[key]:
            errors.append(f"Missing required field: {key}")
    slug = data.get("slug")
    if isinstance(slug, str) and "-vs-" in slug:
        errors.append("slug must not contain '-vs-' (reserved for compare URLs)")
    specs = data.get("specs")
    if not isinstance(specs, dict):
        errors.append("specs must be an object")
        return errors
    cpu = specs.get("cpu")
    if isinstance(cpu, dict):
        if cpu.get("geekbenchSingle") is None and cpu.get("geekbenchMulti") is None:
            errors.append("cpu needs geekbenchSingle and/or geekbenchMulti for charts")
    return errors


LAPTOP_JSON_SCHEMA_HINT = """
Return ONLY valid JSON (no markdown) with this shape:
{
  "slug": "kebab-case-url-slug",
  "displayName": "Short product name",
  "subtitle": "One-line config summary",
  "amazonAsin": null,
  "modelSku": null or "manufacturer SKU",
  "imageUrl": null,
  "amazonUrl": null,
  "amazonPriceLabel": null or "$1,299",
  "specs": {
    "cpu": { "label": "...", "geekbenchSingle": number, "geekbenchMulti": number },
    "gpu": { "label": "...", "benchmarkScore": number },
    "ai": { "label": "Geekbench ML or similar", "benchmarkScore": number },
    "ramGb": number,
    "storageGb": number,
    "display": {
      "label": "14\\" 16:10 IPS",
      "diagonalIn": number,
      "widthMm": number,
      "heightMm": number,
      "resolution": "2880x1800",
      "refreshHz": number,
      "peakNits": number,
      "panelType": "IPS/OLED/Mini-LED"
    },
    "weightKg": number,
    "battery": {
      "capacityWh": number,
      "claimedLifeHours": "up to 18 h",
      "chargerWatt": number
    },
    "connectivity": {
      "wifi": "Wi-Fi 6E (802.11ax)",
      "bluetooth": "5.3",
      "fingerprint": "Yes / Optional / No",
      "infrared": "No",
      "webcam": "Above display / 1080p IR",
      "webcamResolution": "1920x1080"
    },
    "ports": {
      "usbA": "No / 1x USB 3.2",
      "usbC": "2x USB4",
      "thunderbolt": "2x Thunderbolt 4 / No",
      "hdmi": "1x HDMI 2.1 / No",
      "displayPort": "No",
      "vga": "No",
      "audioJack": "Yes / No",
      "ethernet": "No / RJ45",
      "sdCard": "microSD / No",
      "proprietaryCharging": "No"
    },
    "input": {
      "keyboard": "Backlit, 1.5 mm travel",
      "touchpad": "Glass, precision",
      "touchpadWidthMm": number or null,
      "touchpadHeightMm": number or null
    },
    "highlights": ["bullet 1", "bullet 2"]
  },
  "sourcesNote": "Where specs came from; flag estimates."
}
Rules:
- Fill connectivity, ports, and input like Nanoreview comparison tables when known.
- Use real Geekbench 6 numbers when known; otherwise conservative estimates in sourcesNote.
- display widthMm/heightMm must match diagonalIn.
- Never invent ASINs, amazonUrl, imageUrl, or prices — always null unless user provided a verified URL in the prompt.
- amazonPriceLabel: price ONLY like "$949.00" — no dates or notes.
- slug must not contain "-vs-".
"""
