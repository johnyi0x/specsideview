"""Fetch real Amazon listing data via SerpAPI (ASIN, price, image, URL)."""

from __future__ import annotations

import os
import re
from typing import Any
from urllib.parse import unquote

from amazon_helpers import amazon_url_from_asin, apply_associate_tag, extract_asin, normalize_price_label

SKIP_TITLE_TERMS = (
    "case",
    "cover",
    "sleeve",
    "charger",
    "cable",
    "adapter",
    "screen protector",
    "keyboard cover",
    "skin",
    "decal",
    "replacement",
    "battery for",
    "mount",
    "stand only",
    "bag only",
)


def _serpapi_search(params: dict[str, Any]) -> dict[str, Any]:
    from serpapi import GoogleSearch

    return GoogleSearch(params).get_dict()


def _score_result(title: str, query: str) -> int:
    title_l = title.lower()
    if any(term in title_l for term in SKIP_TITLE_TERMS):
        return -100
    q_words = [w for w in re.split(r"[^a-z0-9]+", query.lower()) if len(w) > 2]
    if not q_words:
        return 0
    hits = sum(1 for w in q_words if w in title_l)
    score = hits * 10
    if "laptop" in title_l or "macbook" in title_l or "notebook" in title_l or "xps" in title_l:
        score += 5
    if title_l.startswith("renewed") or "refurbished" in title_l:
        score -= 3
    return score


def _pick_best_result(results: list[dict[str, Any]], query: str) -> dict[str, Any] | None:
    candidates: list[tuple[int, dict[str, Any]]] = []
    for item in results:
        if not item.get("asin") and not item.get("link"):
            continue
        title = item.get("title") or ""
        score = _score_result(title, query)
        if item.get("sponsored"):
            score -= 2
        if score > 0:
            candidates.append((score, item))
    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0], reverse=True)
    return candidates[0][1]


def _fetch_product_detail(asin: str, api_key: str) -> dict[str, Any] | None:
    try:
        data = _serpapi_search(
            {
                "engine": "amazon_product",
                "asin": asin,
                "amazon_domain": "amazon.com",
                "api_key": api_key,
            }
        )
        return data.get("product_results") or data
    except Exception:
        return None


def _clean_amazon_link(link: str | None) -> str | None:
    if not link:
        return None
    if link.startswith("/"):
        link = "https://www.amazon.com" + link
    # unwrap sspa redirect urls
    if "url=" in link and "amazon.com" in link:
        m = re.search(r"url=([^&]+)", link)
        if m:
            link = unquote(m.group(1))
            if link.startswith("/"):
                link = "https://www.amazon.com" + link
    return link


def fetch_amazon_listing(query: str) -> dict[str, Any] | None:
    """
    Search Amazon for query; return verified ASIN, affiliate URL, price, image.
    Requires SERPAPI_API_KEY in environment.
    """
    api_key = os.environ.get("SERPAPI_API_KEY", "").strip()
    if not api_key:
        return None

    try:
        search = _serpapi_search(
            {
                "engine": "amazon",
                "k": query,
                "amazon_domain": "amazon.com",
                "api_key": api_key,
            }
        )
    except Exception:
        return None

    organic = search.get("organic_results") or []
    pick = _pick_best_result(organic, query)
    if not pick:
        return None

    asin = (pick.get("asin") or "").upper() or extract_asin(_clean_amazon_link(pick.get("link")) or "")
    if not asin:
        return None

    price = pick.get("price")
    if not price and pick.get("extracted_price") is not None:
        price = f"${pick['extracted_price']:,.2f}"

    image = pick.get("thumbnail")

    detail = _fetch_product_detail(asin, api_key)
    if detail:
        if detail.get("price"):
            price = detail["price"]
        thumbs = detail.get("thumbnails") or detail.get("images")
        if isinstance(thumbs, list) and thumbs:
            first = thumbs[0]
            image = first if isinstance(first, str) else first.get("link") or first.get("url")
        elif detail.get("thumbnail"):
            image = detail["thumbnail"]

    link = amazon_url_from_asin(asin)
    if not link:
        raw = _clean_amazon_link(pick.get("link_clean") or pick.get("link"))
        link = apply_associate_tag(raw) if raw else None

    if not link:
        return None

    price_label = normalize_price_label(str(price) if price else None)

    return {
        "amazonAsin": asin,
        "amazonUrl": link,
        "amazonPriceLabel": price_label,
        "imageUrl": image,
        "amazonListingTitle": pick.get("title"),
        "amazonSource": "serpapi",
    }


def apply_listing_to_draft(
    data: dict[str, Any],
    listing: dict[str, Any],
    *,
    only_missing: bool = False,
) -> dict[str, Any]:
    amazon_keys = ("amazonAsin", "amazonUrl", "amazonPriceLabel", "imageUrl")
    for key in amazon_keys:
        if only_missing and data.get(key):
            continue
        if listing.get(key):
            val = listing[key]
            if key == "amazonPriceLabel":
                val = normalize_price_label(val) or val
            data[key] = val
    data.pop("amazonReview", None)
    source = listing.get("amazonSource", "serpapi")
    if source == "claude":
        note = "Amazon listing fields from Claude."
    else:
        note = "Amazon listing fields from SerpAPI fallback — verify ASIN, price, and image on Amazon."
    existing = data.get("sourcesNote") or ""
    if note not in existing:
        data["sourcesNote"] = (existing + " " + note).strip()
    if listing.get("amazonListingTitle"):
        data["amazonListingTitle"] = listing["amazonListingTitle"]
    return data
