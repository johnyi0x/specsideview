#!/usr/bin/env python3
"""
Script 1 — Recommend new laptops to add (does NOT call Claude for full specs).

  python recommend_items.py
  python recommend_items.py --limit 5
  python recommend_items.py --from-watchlist

Reads exclusion lists from:
  - catalog.json (already in Neon)
  - recommendation_log.json (previously recommended — never re-suggest)
  - drafts/*.json

Writes:
  - pending_recommendations.json  ← pick from this list for Script 2
  - appends to recommendation_log.json

Uses Claude only to suggest names/ASINs, not full product data.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv

from registry import (
    PENDING_PATH,
    catalog_summary_for_claude,
    excluded_from_recommendations,
    load_pending_recommendations,
    log_recommendations,
    save_pending_recommendations,
)

ROOT = Path(__file__).resolve().parent
WATCHLIST = ROOT / "watchlist.txt"


def load_watchlist() -> list[str]:
    if not WATCHLIST.exists():
        return []
    return [
        line.strip()
        for line in WATCHLIST.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]


def claude_suggest(limit: int, watchlist_hint: list[str]) -> list[dict]:
    from anthropic import Anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")

    excluded = excluded_from_recommendations()
    exclude_lines = []
    if excluded["names"]:
        exclude_lines.append("Names already handled: " + ", ".join(sorted(excluded["names"])[:40]))
    if excluded["asins"]:
        exclude_lines.append("ASINs already handled: " + ", ".join(sorted(excluded["asins"])))
    if excluded["skus"]:
        exclude_lines.append("SKUs already handled: " + ", ".join(sorted(excluded["skus"])))

    hint = ""
    if watchlist_hint:
        hint = "Prefer suggesting from this watchlist when not excluded:\n" + "\n".join(f"- {n}" for n in watchlist_hint)

    prompt = f"""Suggest exactly {limit} popular or recently released laptops for a spec comparison website.
Category: laptops only. US market. Real models only.

{catalog_summary_for_claude()}

DO NOT suggest anything matching excluded lists below or already in the database.

{chr(10).join(exclude_lines) if exclude_lines else "No extra exclusions."}

{hint}

Return ONLY a JSON array (no markdown) like:
[
  {{"displayName": "MacBook Air 15 M4 2025", "amazonAsin": null, "modelSku": null, "notes": "why this model"}},
  {{"displayName": "...", "amazonAsin": null, "modelSku": "optional OEM sku", "notes": "..."}}
]
IMPORTANT: always set amazonAsin to null. Do NOT guess ASINs — they are often wrong and break Amazon links."""

    client = Anthropic(api_key=api_key)
    model = os.environ.get("ANTHROPIC_MODEL", "claude-opus-4-7")
    msg = client.messages.create(
        model=model,
        max_tokens=2048,
        system="You recommend electronics for a comparison database. Output valid JSON array only.",
        messages=[{"role": "user", "content": prompt}],
    )
    raw = "".join(b.text for b in msg.content if b.type == "text")
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
    if fence:
        raw = fence.group(1)
    return json.loads(raw.strip())


def filter_new(items: list[dict]) -> list[dict]:
    excluded = excluded_from_recommendations()
    out: list[dict] = []
    for item in items:
        name = " ".join(item.get("displayName", "").lower().split())
        asin = (item.get("amazonAsin") or "").upper()
        sku = (item.get("modelSku") or "").upper()
        if name and name in excluded["names"]:
            continue
        if asin and asin in excluded["asins"]:
            continue
        if sku and sku in excluded["skus"]:
            continue
        out.append(item)
    return out


def main() -> None:
    load_dotenv(ROOT / ".env")
    load_dotenv()

    parser = argparse.ArgumentParser(description="Script 1: recommend new laptops to add")
    parser.add_argument("--limit", type=int, default=3, help="How many to suggest (default 3)")
    parser.add_argument("--from-watchlist", action="store_true", help="Bias suggestions toward watchlist.txt")
    args = parser.parse_args()

    watchlist = load_watchlist() if args.from_watchlist else []
    print(f"Requesting {args.limit} recommendation(s) from Claude...", file=sys.stderr)

    try:
        raw_items = claude_suggest(args.limit + 2, watchlist)
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)

    if not isinstance(raw_items, list):
        print("Error: Claude did not return a JSON array", file=sys.stderr)
        sys.exit(1)

    # Never trust ASINs from Claude — they frequently 404 on Amazon
    for item in raw_items:
        item["amazonAsin"] = None

    items = filter_new(raw_items)[: args.limit]
    if not items:
        print("No new recommendations — everything suggested was already known. Try editing watchlist.txt.")
        return

    log_recommendations(items)
    save_pending_recommendations(items)

    print(f"\nRecommended {len(items)} laptop(s). Saved to:")
    print(f"  {PENDING_PATH}")
    print(f"  recommendation_log.json (won't re-suggest these)\n")
    for i, item in enumerate(items, 1):
        print(f"  {i}. {item['displayName']}")
        if item.get("notes"):
            print(f"     {item['notes']}")
    print("\nNext — Script 2 (specs only; Amazon link you add manually after):")
    print("  python draft_item.py --from-pending 1")
    print('  python apply_amazon_link.py drafts/<slug>.json --url "YOUR_SITESTRIPE_LINK" --price "$1,299"')


if __name__ == "__main__":
    main()
