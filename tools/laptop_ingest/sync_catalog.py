#!/usr/bin/env python3
"""
Pull all products from Neon into local catalog.json (duplicate guard for Claude).

  python sync_catalog.py
  python sync_catalog.py --dry-run
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv

from catalog import CATALOG_PATH, save_catalog
from db import fetch_all_products_for_catalog

ROOT = Path(__file__).resolve().parent


def main() -> None:
    load_dotenv(ROOT / ".env")
    load_dotenv()

    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Print count only, do not write catalog.json")
    args = parser.parse_args()

    try:
        products = fetch_all_products_for_catalog()
    except RuntimeError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(products)} product(s) in Neon.")
    if args.dry_run:
        for p in products[:10]:
            print(f"  - {p['slug']}: {p['displayName']}")
        if len(products) > 10:
            print(f"  ... and {len(products) - 10} more")
        return

    save_catalog(products)
    print(f"Wrote {CATALOG_PATH}")


if __name__ == "__main__":
    main()
