#!/usr/bin/env python3
"""
Push a reviewed draft JSON into Neon (or print SQL).

  python push_product.py drafts/macbook-pro-16-m4.json --dry-run
  python push_product.py drafts/macbook-pro-16-m4.json --push
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

from db import insert_product_draft
from product_schema import validate_draft
from registry import update_recommendation_status
from amazon_helpers import extract_asin, normalize_price_label

ROOT = Path(__file__).resolve().parent


def main() -> None:
    load_dotenv(ROOT / ".env")
    load_dotenv()

    parser = argparse.ArgumentParser()
    parser.add_argument("draft", type=Path, help="Path to reviewed draft JSON")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--dry-run", action="store_true", help="Print SQL only")
    group.add_argument("--push", action="store_true", help="Insert into Neon")
    args = parser.parse_args()

    data = json.loads(args.draft.read_text(encoding="utf-8-sig"))
    data.pop("amazonReview", None)
    if data.get("amazonPriceLabel"):
        data["amazonPriceLabel"] = normalize_price_label(data["amazonPriceLabel"])
    errors = validate_draft(data)
    if errors:
        for e in errors:
            print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    result = insert_product_draft(data, dry_run=args.dry_run)
    print(result)
    if args.push:
        update_recommendation_status(
            display_name=data.get("displayName"),
            slug=data["slug"],
            asin=data.get("amazonAsin") or extract_asin(data.get("amazonUrl") or ""),
            status="pushed",
        )
        print("Done. Live at /en/compare/<slug-a>-vs-<slug-b> — no comparison row needed.")


if __name__ == "__main__":
    main()
