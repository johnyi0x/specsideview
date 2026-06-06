#!/usr/bin/env python3
"""
Create a reviewable laptop draft JSON using Claude.

  python polish_laptop.py "MacBook Pro 16 M4 Max 2024"
  python polish_laptop.py "Dell XPS 15 9530" --amazon "https://www.amazon.com/dp/B0XXXX"
  python polish_laptop.py --from-draft drafts/my-laptop.json   # re-validate only
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

from claude_polish import polish_laptop
from registry import find_catalog_duplicate
from db import list_existing_slugs
from product_schema import validate_draft

ROOT = Path(__file__).resolve().parent
DRAFTS = ROOT / "drafts"


def main() -> None:
    load_dotenv(ROOT / ".env")
    load_dotenv()

    parser = argparse.ArgumentParser(description="Polish laptop data with Claude for SpecSideView.")
    parser.add_argument("query", nargs="?", help="Laptop name / model to research")
    parser.add_argument("--amazon", help="Amazon URL or ASIN hint for Claude")
    parser.add_argument("--notes", help="Extra context (config SKU, your SerpAPI paste, etc.)")
    parser.add_argument("--from-draft", type=Path, help="Validate an existing draft JSON instead of calling Claude")
    parser.add_argument("--out", type=Path, help="Output path (default: drafts/<slug>.json)")
    args = parser.parse_args()

    if args.from_draft:
        data = json.loads(args.from_draft.read_text(encoding="utf-8-sig"))
    else:
        if not args.query:
            parser.error("Provide a laptop query or --from-draft")
        print(f"Calling Claude for: {args.query}", file=sys.stderr)
        data = polish_laptop(args.query, amazon_hint=args.amazon, extra_context=args.notes)

    errors = validate_draft(data)
    slug = data["slug"]
    if slug in list_existing_slugs():
        errors.append(f"slug '{slug}' already exists in catalog/Neon — change slug before push")
    dup = find_catalog_duplicate(data.get("displayName") or "", slug)
    if dup:
        errors.append(dup)

    out = args.out or (DRAFTS / f"{slug}.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"Wrote draft: {out}")
    if data.get("sourcesNote"):
        print(f"Sources: {data['sourcesNote']}")
    if errors:
        print("\nReview warnings:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1 if any("already exists" in e for e in errors) else 0)


if __name__ == "__main__":
    main()
