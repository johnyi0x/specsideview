#!/usr/bin/env python3
"""
Sync catalog.json from Neon (or use local-only if DB unreachable).

  python sync_catalog.py
  python sync_catalog.py --offline   # skip DB, just report local catalog
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv

from registry import CATALOG_PATH, save_catalog

ROOT = Path(__file__).resolve().parent


def main() -> None:
    load_dotenv(ROOT / ".env")
    load_dotenv()

    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--offline", action="store_true", help="Do not connect to Neon")
    args = parser.parse_args()

    if args.offline:
        from registry import load_catalog

        products = load_catalog().get("products", [])
        print(f"Offline mode: {len(products)} product(s) in local catalog.json")
        return

    try:
        from db import fetch_all_products_for_catalog

        products = fetch_all_products_for_catalog()
    except Exception as exc:
        print(f"Could not connect to Neon: {exc}", file=sys.stderr)
        print("\nTips:", file=sys.stderr)
        print("  1. Copy DATABASE_URL from Neon dashboard → Connection string → Pooled connection", file=sys.stderr)
        print("  2. Paste into tools/laptop_ingest/.env (not the unpooled URL if pooler fails)", file=sys.stderr)
        print("  3. Or run: python sync_catalog.py --offline", file=sys.stderr)
        print("  4. Script 1/2 still work using local catalog.json + recommendation_log.json", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(products)} product(s) in Neon.")
    if args.dry_run:
        for p in products[:10]:
            print(f"  - {p['slug']}: {p['displayName']}")
        return

    save_catalog(products)
    print(f"Wrote {CATALOG_PATH}")


if __name__ == "__main__":
    main()
