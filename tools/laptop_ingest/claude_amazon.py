"""Claude fallback for Amazon fields when SerpAPI fails."""

from __future__ import annotations

import json
import os
from typing import Any

from amazon_helpers import amazon_url_from_asin, apply_associate_tag, extract_asin, normalize_price_label
from claude_polish import _extract_json


def claude_fill_amazon_fields(
    product_name: str,
    *,
    subtitle: str | None = None,
    model_sku: str | None = None,
) -> dict[str, Any] | None:
    """
    Second Claude call — Amazon ASIN, URL, price, image only.
    Used when SerpAPI returns no match.
    """
    from anthropic import Anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return None

    model = os.environ.get("ANTHROPIC_MODEL", "claude-opus-4-7")
    client = Anthropic(api_key=api_key)

    lines = [f"Product: {product_name}"]
    if subtitle:
        lines.append(f"Config: {subtitle}")
    if model_sku:
        lines.append(f"Manufacturer SKU: {model_sku}")

    prompt = "\n".join(lines) + """

Return ONLY valid JSON (no markdown) for the most common US Amazon.com listing for this exact laptop config:
{
  "amazonAsin": "10-character ASIN",
  "amazonUrl": "https://www.amazon.com/dp/ASIN",
  "amazonPriceLabel": "$949.00",
  "imageUrl": "https://m.media-amazon.com/images/I/....jpg"
}

Rules:
- amazonPriceLabel must be ONLY a US dollar price like "$949.00" — no dates, no notes, no "verify" text.
- imageUrl should be a direct m.media-amazon.com image URL when possible.
- If you are not confident about the ASIN, return null for all fields rather than inventing one that 404s.
"""

    try:
        message = client.messages.create(
            model=model,
            max_tokens=1024,
            system="You look up Amazon US product listings. Output JSON only. Price field is dollar amount only.",
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception:
        return None

    raw = "".join(b.text for b in message.content if b.type == "text")
    try:
        data = _extract_json(raw)
    except (json.JSONDecodeError, ValueError):
        return None

    asin = extract_asin(data.get("amazonAsin") or data.get("amazonUrl") or "")
    if not asin:
        return None

    url = data.get("amazonUrl")
    if url:
        url = apply_associate_tag(str(url).strip())
    else:
        url = amazon_url_from_asin(asin)

    price = normalize_price_label(data.get("amazonPriceLabel"))
    image = data.get("imageUrl")

    if not url or not price:
        return None

    return {
        "amazonAsin": asin,
        "amazonUrl": url,
        "amazonPriceLabel": price,
        "imageUrl": str(image).strip() if image else None,
        "amazonSource": "claude",
    }
