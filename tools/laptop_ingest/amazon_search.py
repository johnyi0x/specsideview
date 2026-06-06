#!/usr/bin/env python3
"""
Open Amazon search for a draft product — helps you find the real listing for Step 3.

  python amazon_search.py drafts/apple-macbook-air-15-m4-2025.json
  python amazon_search.py drafts/apple-macbook-air-15-m4-2025.json --open
"""

from __future__ import annotations

import argparse
import json
import sys
import webbrowser
from pathlib import Path
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parent


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("draft", type=Path)
    parser.add_argument("--open", action="store_true", help="Open search in default browser")
    args = parser.parse_args()

    if not args.draft.exists():
        print(f"Not found: {args.draft}", file=sys.stderr)
        sys.exit(1)

    data = json.loads(args.draft.read_text(encoding="utf-8-sig"))
    name = data.get("displayName") or data.get("slug", "")
    subtitle = data.get("subtitle") or ""
    query = f"{name} {subtitle}".strip()
    url = f"https://www.amazon.com/s?k={quote_plus(query)}"

    print("=" * 60)
    print("STEP 3 — Amazon (manual, required before push)")
    print("=" * 60)
    print(f"Product: {name}")
    print(f"Search:  {url}\n")
    print("1. Open search → pick the EXACT model/config (not accessories)")
    print("2. SiteStripe → Get link → copy URL")
    print("3. Note price on that page")
    print("4. Right-click main product image → Copy image address\n")
    print("Then run:")
    print(f'  python apply_amazon_link.py "{args.draft}" ^')
    print('    --url "PASTE_SITESTRIPE_LINK" ^')
    print('    --price "$1,299 · checked today" ^')
    print('    --image "PASTE_IMAGE_URL"\n')
    print("Or push without Amazon button (specs only):")
    print(f'  python push_product.py "{args.draft}" --push')

    if args.open:
        webbrowser.open(url)
        print("(Opened in browser)")


if __name__ == "__main__":
    main()
