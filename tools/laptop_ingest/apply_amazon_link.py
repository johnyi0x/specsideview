#!/usr/bin/env python3
"""
Paste a real Amazon link into a draft JSON (after you verify it on Amazon).

  python apply_amazon_link.py drafts/apple-macbook-air-15-m4-2025.json --url "https://www.amazon.com/dp/B0REAL1234"
  python apply_amazon_link.py drafts/apple-macbook-air-15-m4-2025.json --url "..." --price "$1,299" --image "https://..."

Your tag (specsideview-20) is appended automatically if missing.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

from amazon_helpers import apply_associate_tag, apply_verified_amazon_link, associate_tag, extract_asin

ROOT = Path(__file__).resolve().parent


def main() -> None:
    load_dotenv(ROOT / ".env")
    load_dotenv()

    parser = argparse.ArgumentParser()
    parser.add_argument("draft", type=Path)
    parser.add_argument("--url", required=True, help="Amazon product URL from SiteStripe or address bar")
    parser.add_argument("--price", help='e.g. "$1,299 · checked 7 Jun 2026"')
    parser.add_argument("--image", help="Product image URL (right-click image on Amazon → copy address)")
    args = parser.parse_args()

    if not args.draft.exists():
        print(f"Not found: {args.draft}", file=sys.stderr)
        sys.exit(1)

    data = json.loads(args.draft.read_text(encoding="utf-8-sig"))
    url = apply_associate_tag(args.url.strip())
    asin = extract_asin(url)

    apply_verified_amazon_link(data, amazon_url=url, price_label=args.price, image_url=args.image)
    data.pop("amazonReview", None)

    args.draft.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"Updated: {args.draft}")
    print(f"  amazonAsin: {data.get('amazonAsin')}")
    print(f"  amazonUrl:  {data.get('amazonUrl')}")
    print(f"  amazonPriceLabel: {data.get('amazonPriceLabel')}")
    print(f"  imageUrl:   {data.get('imageUrl')}")
    if associate_tag():
        print(f"  (tag {associate_tag()} applied if it was missing)")
    if not asin:
        print("Warning: could not parse ASIN from URL — check the link", file=sys.stderr)


if __name__ == "__main__":
    main()
