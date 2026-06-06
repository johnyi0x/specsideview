"""Local registry: catalog (in DB), recommendation log, pending queue."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

from amazon_helpers import extract_asin
from product_schema import slugify

ROOT = Path(__file__).resolve().parent
CATALOG_PATH = ROOT / "catalog.json"
RECOMMENDATION_LOG_PATH = ROOT / "recommendation_log.json"
PENDING_PATH = ROOT / "pending_recommendations.json"

Status = Literal["recommended", "drafted", "pushed", "skipped"]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_json(path: Path, default: dict[str, Any]) -> dict[str, Any]:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: dict[str, Any]) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


# --- Catalog (mirrors Neon products) ---


def load_catalog() -> dict[str, Any]:
    return load_json(CATALOG_PATH, {"updatedAt": None, "products": []})


def save_catalog(products: list[dict[str, Any]]) -> None:
    save_json(
        CATALOG_PATH,
        {"updatedAt": _now(), "products": sorted(products, key=lambda p: p.get("slug", ""))},
    )


def merge_catalog_entry(entry: dict[str, Any]) -> None:
    cat = load_catalog()
    products = [p for p in cat.get("products", []) if p.get("slug") != entry["slug"]]
    products.append(
        {
            "slug": entry["slug"],
            "displayName": entry["displayName"],
            "subtitle": entry.get("subtitle"),
            "category": entry.get("category", "laptops"),
            "amazonAsin": entry.get("amazonAsin"),
            "modelSku": entry.get("modelSku"),
        }
    )
    save_catalog(products)


def catalog_slugs() -> set[str]:
    return {p["slug"] for p in load_catalog().get("products", []) if p.get("slug")}


def catalog_asins() -> set[str]:
    out: set[str] = set()
    for p in load_catalog().get("products", []):
        asin = p.get("amazonAsin")
        if asin:
            out.add(asin.upper())
        url = p.get("amazonUrl") or ""
        extracted = extract_asin(url)
        if extracted:
            out.add(extracted)
    return out


def catalog_skus() -> set[str]:
    return {p["modelSku"].strip().upper() for p in load_catalog().get("products", []) if p.get("modelSku")}


def catalog_summary_for_claude(max_items: int = 200) -> str:
    products = load_catalog().get("products", [])
    if not products:
        return "No products in local catalog yet."
    lines = ["Products already in database (do NOT recommend or duplicate):"]
    for p in products[:max_items]:
        extra = []
        if p.get("amazonAsin"):
            extra.append(f"ASIN {p['amazonAsin']}")
        if p.get("modelSku"):
            extra.append(f"SKU {p['modelSku']}")
        suffix = f" ({', '.join(extra)})" if extra else ""
        lines.append(f"- {p.get('slug')}: {p.get('displayName')}{suffix}")
    if len(products) > max_items:
        lines.append(f"... and {len(products) - max_items} more")
    return "\n".join(lines)


def find_catalog_duplicate(display_name: str, slug: str | None = None, asin: str | None = None) -> str | None:
    norm = " ".join(display_name.lower().split())
    guess = slug or slugify(display_name)
    asin_u = asin.upper() if asin else None

    for p in load_catalog().get("products", []):
        if p.get("slug") == guess:
            return f"slug '{guess}' already in catalog"
        if p.get("displayName") and " ".join(p["displayName"].lower().split()) == norm:
            return f"display name matches '{p['displayName']}'"
        if asin_u and p.get("amazonAsin") and p["amazonAsin"].upper() == asin_u:
            return f"ASIN {asin_u} already in catalog"
    return None


# --- Recommendation log (never re-recommend) ---


def load_recommendation_log() -> dict[str, Any]:
    return load_json(RECOMMENDATION_LOG_PATH, {"items": []})


def log_recommendations(items: list[dict[str, Any]]) -> None:
    log = load_recommendation_log()
    existing = log.get("items", [])
    existing_keys = {_item_key(i) for i in existing}
    for item in items:
        key = _item_key(item)
        if key in existing_keys:
            continue
        existing.append(
            {
                "displayName": item["displayName"],
                "slugGuess": item.get("slugGuess") or slugify(item["displayName"]),
                "amazonAsin": item.get("amazonAsin"),
                "modelSku": item.get("modelSku"),
                "status": "recommended",
                "recommendedAt": _now(),
                "notes": item.get("notes"),
            }
        )
        existing_keys.add(key)
    save_json(RECOMMENDATION_LOG_PATH, {"items": existing})


def update_recommendation_status(
    *,
    display_name: str | None = None,
    slug: str | None = None,
    asin: str | None = None,
    status: Status,
) -> None:
    log = load_recommendation_log()
    for item in log.get("items", []):
        if display_name and item.get("displayName") == display_name:
            item["status"] = status
        elif slug and item.get("slugGuess") == slug:
            item["status"] = status
        elif asin and item.get("amazonAsin") and item["amazonAsin"].upper() == asin.upper():
            item["status"] = status
    save_json(RECOMMENDATION_LOG_PATH, log)


def excluded_from_recommendations() -> dict[str, set[str]]:
    """Everything script 1 must skip."""
    slugs: set[str] = set(catalog_slugs())
    asins: set[str] = set(catalog_asins())
    skus: set[str] = set(catalog_skus())
    names: set[str] = set()

    for item in load_recommendation_log().get("items", []):
        if item.get("slugGuess"):
            slugs.add(item["slugGuess"])
        if item.get("amazonAsin"):
            asins.add(item["amazonAsin"].upper())
        if item.get("modelSku"):
            skus.add(item["modelSku"].upper())
        if item.get("displayName"):
            names.add(" ".join(item["displayName"].lower().split()))

    drafts = ROOT / "drafts"
    if drafts.exists():
        for f in drafts.glob("*.json"):
            slugs.add(f.stem)

    return {"slugs": slugs, "asins": asins, "skus": skus, "names": names}


def _item_key(item: dict[str, Any]) -> str:
    if item.get("amazonAsin"):
        return f"asin:{item['amazonAsin'].upper()}"
    if item.get("modelSku"):
        return f"sku:{item['modelSku'].upper()}"
    return f"name:{slugify(item.get('displayName', ''))}"


def save_pending_recommendations(items: list[dict[str, Any]]) -> None:
    save_json(PENDING_PATH, {"generatedAt": _now(), "items": items})


def load_pending_recommendations() -> list[dict[str, Any]]:
    return load_json(PENDING_PATH, {"items": []}).get("items", [])
