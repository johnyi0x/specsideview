#!/usr/bin/env python3
"""
Script 2 — Draft: Claude specs + SerpAPI Amazon (Claude fallback if SerpAPI fails).

  python draft_item.py --from-pending 1
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

from amazon_helpers import apply_associate_tag, apply_verified_amazon_link, associate_tag, normalize_price_label
from claude_amazon import claude_fill_amazon_fields
from claude_polish import polish_laptop
from product_schema import validate_draft
from registry import find_catalog_duplicate, load_pending_recommendations, update_recommendation_status
from serp_amazon import apply_listing_to_draft, fetch_amazon_listing

ROOT = Path(__file__).resolve().parent
DRAFTS = ROOT / "drafts"


def _fill_amazon_listing(
    *,
    search_query: str,
    name: str,
    subtitle: str | None,
    sku: str | None,
    skip_serp: bool,
    verified_amazon_url: str | None,
) -> dict | None:
    if verified_amazon_url:
        return None

    listing = None
    if not skip_serp and os.environ.get("SERPAPI_API_KEY", "").strip():
        print(f"SerpAPI Amazon search: {search_query}", file=sys.stderr)
        listing = fetch_amazon_listing(search_query)
        if listing:
            print(f"  SerpAPI: {listing.get('amazonListingTitle', '')[:70]}", file=sys.stderr)
            print(f"  ASIN {listing.get('amazonAsin')}  Price {listing.get('amazonPriceLabel')}", file=sys.stderr)
            return listing
        print("  SerpAPI: no match — trying Claude for Amazon fields…", file=sys.stderr)
    elif not skip_serp:
        print("  SerpAPI key not set — using Claude for Amazon fields…", file=sys.stderr)

    listing = claude_fill_amazon_fields(name, subtitle=subtitle, model_sku=sku)
    if listing:
        print(f"  Claude: ASIN {listing.get('amazonAsin')}  Price {listing.get('amazonPriceLabel')}", file=sys.stderr)
    return listing


def main() -> None:
    load_dotenv(ROOT / ".env")
    load_dotenv()

    parser = argparse.ArgumentParser(description="Script 2: Claude + SerpAPI draft")
    parser.add_argument("--name")
    parser.add_argument("--amazon", help="Verified Amazon URL override")
    parser.add_argument("--sku")
    parser.add_argument("--from-pending", type=int, metavar="N")
    parser.add_argument("--notes")
    parser.add_argument("--out", type=Path)
    parser.add_argument("--skip-serp", action="store_true")
    args = parser.parse_args()

    name = args.name
    sku = args.sku
    verified_amazon_url = args.amazon.strip() if args.amazon else None

    if args.from_pending is not None:
        pending = load_pending_recommendations()
        if not pending or args.from_pending < 1 or args.from_pending > len(pending):
            print(f"Error: --from-pending {args.from_pending} but pending has {len(pending)} item(s).", file=sys.stderr)
            sys.exit(1)
        pick = pending[args.from_pending - 1]
        name = pick.get("displayName") or name
        sku = sku or pick.get("modelSku")

    if not name and not verified_amazon_url:
        parser.error("Provide --from-pending N, --name, and/or --amazon")

    search_query = f"{name} {sku or ''}".strip()
    print(f"Calling Claude for specs: {name}", file=sys.stderr)

    listing = _fill_amazon_listing(
        search_query=search_query,
        name=name or search_query,
        subtitle=None,
        sku=sku,
        skip_serp=args.skip_serp,
        verified_amazon_url=verified_amazon_url,
    )

    extra = args.notes or ""
    if sku:
        extra = (extra + f"\nManufacturer SKU: {sku}").strip()

    amazon_hint = None
    if verified_amazon_url:
        amazon_hint = apply_associate_tag(verified_amazon_url)
    elif listing:
        amazon_hint = listing.get("amazonUrl")
        extra = (extra + f"\nAmazon listing for reference:\n{json.dumps(listing, indent=2)}").strip()

    if associate_tag():
        print(f"Affiliate tag: {associate_tag()}", file=sys.stderr)

    data = polish_laptop(name or search_query, amazon_hint=amazon_hint, extra_context=extra or None)

    if sku:
        data["modelSku"] = sku

    if listing:
        apply_listing_to_draft(data, listing)
    elif verified_amazon_url:
        apply_verified_amazon_link(data, amazon_url=verified_amazon_url)
        data.pop("amazonReview", None)
    elif not verified_amazon_url:
        # Retry Claude with subtitle from specs draft (helps exact config match)
        retry = claude_fill_amazon_fields(
            data.get("displayName") or name or search_query,
            subtitle=data.get("subtitle"),
            model_sku=data.get("modelSku") or sku,
        )
        if retry:
            print(
                f"  Claude (with subtitle): ASIN {retry.get('amazonAsin')}  Price {retry.get('amazonPriceLabel')}",
                file=sys.stderr,
            )
            apply_listing_to_draft(data, retry)

    # Normalize price if Claude main draft added extra text
    if data.get("amazonPriceLabel"):
        data["amazonPriceLabel"] = normalize_price_label(data["amazonPriceLabel"])

    errors = validate_draft(data)
    dup = find_catalog_duplicate(data.get("displayName") or name, data.get("slug"), data.get("amazonAsin"))
    if dup:
        errors.append(dup)

    slug = data["slug"]
    out = args.out or (DRAFTS / f"{slug}.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    update_recommendation_status(display_name=data.get("displayName"), slug=slug, status="drafted")

    missing = [k for k in ("amazonAsin", "amazonUrl", "amazonPriceLabel", "imageUrl") if not data.get(k)]
    print(f"\nWrote draft: {out}")
    print(f"  amazonAsin:       {data.get('amazonAsin')}")
    print(f"  amazonUrl:        {data.get('amazonUrl')}")
    print(f"  amazonPriceLabel: {data.get('amazonPriceLabel')}")
    print(f"  imageUrl:         {(data.get('imageUrl') or '')[:80]}")

    if missing:
        print(f"\nWARNING: missing {', '.join(missing)}", file=sys.stderr)
    else:
        print("\n✓ All four Amazon fields filled.")

    if errors:
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1 if any("already" in e for e in errors) else 0)

    print(f"\n  python push_product.py \"{out}\" --push")


if __name__ == "__main__":
    main()
