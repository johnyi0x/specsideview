#!/usr/bin/env python3
"""
Create a published comparison between two existing product slugs.

  python create_comparison.py neo-laptop-alpha voyage-air-thirteen --dry-run
  python create_comparison.py slug-a slug-b --push --title "NeoBook vs Voyage Air"
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent


def main() -> None:
    load_dotenv(ROOT / ".env")
    load_dotenv()

    parser = argparse.ArgumentParser()
    parser.add_argument("slug_a", help="First product slug (left column)")
    parser.add_argument("slug_b", help="Second product slug (right column)")
    parser.add_argument("--slug", help="Comparison URL slug (default: slug_a-vs-slug_b)")
    parser.add_argument("--title", help="meta_title for SEO")
    parser.add_argument("--description", help="meta_description")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--dry-run", action="store_true")
    group.add_argument("--push", action="store_true")
    args = parser.parse_args()

    cmp_slug = args.slug or f"{args.slug_a}-vs-{args.slug_b}"
    title = args.title or f"{args.slug_a} vs {args.slug_b}"
    desc = args.description or f"SpecSideView comparison: {args.slug_a} vs {args.slug_b}."

    sql = """
    INSERT INTO comparisons (slug, category_id, product_a_id, product_b_id, meta_title, meta_description, published)
    SELECT
      %(cmp_slug)s,
      c.id,
      (SELECT id FROM products WHERE slug = %(slug_a)s LIMIT 1),
      (SELECT id FROM products WHERE slug = %(slug_b)s LIMIT 1),
      %(title)s,
      %(desc)s,
      true
    FROM categories c
    WHERE c.slug = 'laptops'
    ON CONFLICT (slug) DO NOTHING
    """
    params = {"cmp_slug": cmp_slug, "slug_a": args.slug_a, "slug_b": args.slug_b, "title": title, "desc": desc}

    if args.dry_run:
        print(f"-- comparison slug: {cmp_slug}")
        print(sql)
        print(params)
        return

    url = os.environ.get("DATABASE_URL")
    if not url:
        print("DATABASE_URL not set", file=sys.stderr)
        sys.exit(1)

    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            if cur.rowcount == 0:
                print("No row inserted — slug exists or product slugs invalid", file=sys.stderr)
                sys.exit(1)
        conn.commit()
    print(f"Published comparison: /compare/{cmp_slug}")


if __name__ == "__main__":
    main()
