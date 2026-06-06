"""Call Claude to turn a laptop name + hints into a SpecSideView product draft."""

from __future__ import annotations

import json
import os
import re
from typing import Any

from anthropic import Anthropic

from registry import catalog_summary_for_claude, find_catalog_duplicate
from amazon_helpers import extract_asin
from product_schema import LAPTOP_JSON_SCHEMA_HINT, slugify


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence:
        text = fence.group(1).strip()
    return json.loads(text)


def polish_laptop(
    query: str,
    *,
    amazon_hint: str | None = None,
    extra_context: str | None = None,
) -> dict[str, Any]:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")

    model = os.environ.get("ANTHROPIC_MODEL", "claude-opus-4-7")
    client = Anthropic(api_key=api_key)

    user_parts = [
        f"Research and normalize this laptop for SpecSideView (category: laptops):\n{query}",
        catalog_summary_for_claude(),
        "If this model is already listed above, STOP and return JSON with slug/displayName matching the existing entry — do not invent a near-duplicate.",
    ]
    if amazon_hint:
        user_parts.append(
            f"Verified Amazon listing (copy amazonUrl and amazonAsin exactly):\n{amazon_hint}"
        )
    if extra_context:
        user_parts.append(f"Additional context:\n{extra_context}")
    user_parts.append(LAPTOP_JSON_SCHEMA_HINT)

    message = client.messages.create(
        model=model,
        max_tokens=4096,
        system=(
            "You prepare electronics spec data for a comparison website. "
            "When verified Amazon JSON is provided, copy amazonAsin, amazonUrl, amazonPriceLabel, imageUrl exactly. "
            "amazonPriceLabel must be price only (e.g. $949.00), never dates or notes. "
            "Never invent ASINs, amazonUrl, imageUrl, or prices — leave them null unless Amazon JSON is in the prompt. "
            "Fill all spec sections thoroughly (connectivity, ports, input, battery). "
            "Mark estimates in sourcesNote. Output JSON only."
        ),
        messages=[{"role": "user", "content": "\n\n".join(user_parts)}],
    )

    raw = ""
    for block in message.content:
        if block.type == "text":
            raw += block.text

    data = _extract_json(raw)
    if not data.get("slug"):
        data["slug"] = slugify(data.get("displayName") or query)

    dup = find_catalog_duplicate(data.get("displayName") or query, data.get("slug"))
    if dup:
        data.setdefault("sourcesNote", "")
        data["sourcesNote"] = (data["sourcesNote"] + f" DUPLICATE WARNING: {dup}.").strip()

    return data
