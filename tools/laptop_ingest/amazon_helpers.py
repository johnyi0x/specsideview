"""Amazon ASIN extraction and Associate tag helpers."""

from __future__ import annotations

import os
import re
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

ASIN_RE = re.compile(r"(?:/dp/|/gp/product/|/product/)([A-Z0-9]{10})", re.I)
PRICE_RE = re.compile(r"\$[\d,]+(?:\.\d{2})?")


def normalize_price_label(raw: str | None) -> str | None:
    """Keep only the dollar amount, e.g. '$949.00'."""
    if not raw:
        return None
    match = PRICE_RE.search(str(raw))
    return match.group(0) if match else None


def associate_tag() -> str | None:
    tag = os.environ.get("AMAZON_ASSOCIATE_TAG", "").strip()
    return tag or None


def extract_asin(value: str) -> str | None:
    value = value.strip()
    if re.fullmatch(r"[A-Z0-9]{10}", value, re.I):
        return value.upper()
    match = ASIN_RE.search(value)
    return match.group(1).upper() if match else None


def apply_associate_tag(url: str, tag: str | None = None) -> str:
    """Ensure ?tag=yourtag-20 is on an Amazon product URL."""
    tag = tag or associate_tag()
    if not tag or not url:
        return url
    parsed = urlparse(url)
    if "amazon." not in parsed.netloc:
        return url
    qs = parse_qs(parsed.query, keep_blank_values=True)
    qs["tag"] = [tag]
    new_query = urlencode({k: v[0] for k, v in qs.items()})
    return urlunparse(parsed._replace(query=new_query))


def amazon_url_from_asin(asin: str, tag: str | None = None) -> str:
    tag = tag or associate_tag()
    base = f"https://www.amazon.com/dp/{asin.upper()}"
    return apply_associate_tag(base, tag) if tag else base


def apply_verified_amazon_link(
    data: dict,
    *,
    amazon_url: str | None = None,
    price_label: str | None = None,
    image_url: str | None = None,
) -> dict:
    """
    Set Amazon fields only from a URL you copied on Amazon (SiteStripe / address bar).
    Never guess ASINs — Claude often invents invalid ones that 404.
    """
    if amazon_url:
        url = apply_associate_tag(amazon_url.strip())
        data["amazonUrl"] = url
        asin = extract_asin(url)
        if asin:
            data["amazonAsin"] = asin
    if price_label:
        data["amazonPriceLabel"] = normalize_price_label(price_label) or price_label.strip()
    if image_url:
        data["imageUrl"] = image_url.strip()
    return data


def clear_unverified_amazon_fields(data: dict) -> dict:
    """Remove guessed Amazon data — user must paste real links after checking Amazon."""
    data["amazonAsin"] = None
    data["amazonUrl"] = None
    data["imageUrl"] = None
    data["amazonPriceLabel"] = None
    data["amazonReview"] = (
        "Before push: open Amazon, find this exact model/config, then paste: "
        "(1) SiteStripe affiliate link → amazonUrl, "
        "(2) price you see → amazonPriceLabel, "
        "(3) product image URL (right-click image) → imageUrl. "
        "Or run: python apply_amazon_link.py drafts/<file>.json --url \"...\""
    )
    return data
