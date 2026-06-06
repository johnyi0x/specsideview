"""Local product registry — synced from Neon so Claude and scripts avoid duplicates offline."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from product_schema import slugify

ROOT = Path(__file__).resolve().parent
CATALOG_PATH = ROOT / "catalog.json"


def _empty_catalog() -> dict[str, Any]:
    return {"updatedAt": None, "products": []}


def load_catalog() -> dict[str, Any]:
    if not CATALOG_PATH.exists():
        return _empty_catalog()
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def save_catalog(products: list[dict[str, Any]]) -> None:
    payload = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "products": sorted(products, key=lambda p: p.get("slug", "")),
    }
    CATALOG_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def catalog_slugs() -> set[str]:
    return {p["slug"] for p in load_catalog().get("products", []) if p.get("slug")}


def catalog_display_names() -> set[str]:
    names: set[str] = set()
    for p in load_catalog().get("products", []):
        if p.get("displayName"):
            names.add(_normalize_name(p["displayName"]))
    return names


def _normalize_name(name: str) -> str:
    return " ".join(name.lower().split())


def find_catalog_duplicate(display_name: str, slug: str | None = None) -> str | None:
    """Return reason string if this looks like an existing product."""
    cat = load_catalog()
    norm = _normalize_name(display_name)
    guess = slug or slugify(display_name)

    for p in cat.get("products", []):
        if p.get("slug") == guess:
            return f"slug '{guess}' already in catalog"
        if p.get("displayName") and _normalize_name(p["displayName"]) == norm:
            return f"display name matches existing '{p['displayName']}' (slug: {p.get('slug')})"
    return None


def merge_catalog_entry(entry: dict[str, Any]) -> None:
    cat = load_catalog()
    products: list[dict[str, Any]] = list(cat.get("products", []))
    slug = entry["slug"]
    products = [p for p in products if p.get("slug") != slug]
    products.append(
        {
            "slug": slug,
            "displayName": entry["displayName"],
            "subtitle": entry.get("subtitle"),
            "category": entry.get("category", "laptops"),
        }
    )
    save_catalog(products)


def catalog_summary_for_claude(max_items: int = 200) -> str:
    """Compact list for Claude prompt — existing products to avoid duplicating."""
    products = load_catalog().get("products", [])
    if not products:
        return "No products in local catalog yet."
    lines = ["Existing products in database (do NOT create duplicates — pick a new slug/name if unsure):"]
    for p in products[:max_items]:
        sub = f" — {p['subtitle']}" if p.get("subtitle") else ""
        lines.append(f"- {p.get('slug')}: {p.get('displayName')}{sub}")
    if len(products) > max_items:
        lines.append(f"... and {len(products) - max_items} more")
    return "\n".join(lines)
