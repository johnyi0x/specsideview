"""Amazon ASIN extraction and Associate tag helpers."""

from __future__ import annotations

import os
import re
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

ASIN_RE = re.compile(r"(?:/dp/|/gp/product/|/product/)([A-Z0-9]{10})", re.I)


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
