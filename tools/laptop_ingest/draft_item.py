#!/usr/bin/env python3
"""
Script 2 — Draft full product JSON with Claude (review before push).

  python draft_item.py --name "Lenovo Yoga 9i Gen 10"
  python draft_item.py --asin B0XXXXXXXXX
  python draft_item.py --amazon "https://www.amazon.com/dp/B0XXXXXXXXX"
  python draft_item.py --sku "21XXX-XXX" --name "ThinkPad X1 Carbon Gen 12"

Output: drafts/<slug>.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

from amazon_helpers import amazon_url_from_asin, apply_associate_tag, associate_tag, extract_asin
from claude_polish import polish_laptop
from product_schema import validate_draft
from registry import find_catalog_duplicate, update_recommendation_status

ROOT = Path(__file__).resolve().parent
DRAFTS = ROOT / "drafts"


def main() -> None:
    load_dotenv(ROOT / ".env")
    load_dotenv()

    parser = argparse.ArgumentParser(description="Script 2: Claude draft for one laptop")
    parser.add_argument("--name", help="Product name / model")
    parser.add_argument("--asin", help="Amazon ASIN (10 chars)")
    parser.add_argument("--amazon", help="Amazon product URL")
    parser.add_argument("--sku", help="Manufacturer / config SKU")
    parser.add_argument("--notes", help="Extra context for Claude")
    parser.add_argument("--out", type=Path, help="Output path")
    args = parser.parse_args()

    if not args.name and not args.asin and not args.amazon:
        parser.error("Provide --name, --asin, and/or --amazon")

    asin = None
    amazon_hint = None
    if args.asin:
        asin = extract_asin(args.asin)
        amazon_hint = amazon_url_from_asin(asin)
    elif args.amazon:
        asin = extract_asin(args.amazon)
        amazon_hint = apply_associate_tag(args.amazon)

    query = args.name or f"Amazon ASIN {asin}"
    extra = args.notes or ""
    if args.sku:
        extra = (extra + f"\nManufacturer SKU: {args.sku}").strip()

    print(f"Calling Claude for: {query}", file=sys.stderr)
    if associate_tag():
        print(f"Amazon tag: {associate_tag()} (appended to URLs in draft)", file=sys.stderr)

    data = polish_laptop(query, amazon_hint=amazon_hint, extra_context=extra or None)

    if asin:
        data["amazonAsin"] = asin
    if args.sku:
        data["modelSku"] = args.sku
    if amazon_hint and not data.get("amazonUrl"):
        data["amazonUrl"] = amazon_hint
    elif data.get("amazonUrl"):
        data["amazonUrl"] = apply_associate_tag(data["amazonUrl"])

    errors = validate_draft(data)
    dup = find_catalog_duplicate(
        data.get("displayName") or query,
        data.get("slug"),
        data.get("amazonAsin"),
    )
    if dup:
        errors.append(dup)

    slug = data["slug"]
    out = args.out or (DRAFTS / f"{slug}.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    update_recommendation_status(
        display_name=data.get("displayName"),
        slug=slug,
        asin=data.get("amazonAsin"),
        status="drafted",
    )

    print(f"Wrote draft: {out}")
    if data.get("sourcesNote"):
        print(f"Sources: {data['sourcesNote']}")
    if errors:
        print("\nReview warnings:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1 if any("already" in e for e in errors) else 0)

    print("\nNext — edit the JSON, then Script 3:")
    print(f"  python push_product.py {out} --dry-run")
    print(f"  python push_product.py {out} --push")


if __name__ == "__main__":
    main()
