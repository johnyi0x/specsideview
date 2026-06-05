"""Shape of a laptop draft JSON file — matches SpecSideView `products` + specs."""

from __future__ import annotations

import re
from typing import Any

REQUIRED_TOP = ("slug", "displayName", "specs")


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


def validate_draft(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    for key in REQUIRED_TOP:
        if key not in data or not data[key]:
            errors.append(f"Missing required field: {key}")
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
  "subtitle": "One-line positioning (config summary)",
  "imageUrl": null or "https://...",
  "amazonUrl": null or "https://www.amazon.com/dp/ASIN",
  "amazonPriceLabel": null or "$1,299 (verify on Amazon before publish)",
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
      "peakNits": number
    },
    "weightKg": number,
    "batteryWh": number,
    "highlights": ["bullet 1", "bullet 2", "bullet 3"]
  },
  "sourcesNote": "Brief note on where specs/benchmarks came from; flag estimates."
}
Rules:
- Use real-ish Geekbench 6 single/multi when known; otherwise conservative estimates and say so in sourcesNote.
- display widthMm/heightMm must match diagonalIn (16:10 unless stated).
- Omit fields you cannot support; never invent ASIN — leave amazonUrl null if unknown.
- slug must be unique, lowercase, hyphenated.
"""
