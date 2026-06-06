"""Neon/Postgres helpers — list existing laptops, insert draft, duplicate guard."""

from __future__ import annotations

import json
import os
from typing import Any

import psycopg

from catalog import catalog_slugs, merge_catalog_entry


def get_database_url() -> str | None:
    return os.environ.get("DATABASE_URL") or None


def fetch_all_products_for_catalog() -> list[dict[str, Any]]:
    url = get_database_url()
    if not url:
        raise RuntimeError("DATABASE_URL is not set — cannot sync catalog")
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT p.slug, p.display_name, p.subtitle, c.slug AS category_slug
                FROM products p
                JOIN categories c ON c.id = p.category_id
                ORDER BY p.display_name
                """
            )
            return [
                {
                    "slug": row[0],
                    "displayName": row[1],
                    "subtitle": row[2],
                    "category": row[3],
                }
                for row in cur.fetchall()
            ]


def list_existing_slugs() -> set[str]:
    """Union of Neon slugs (when online) and local catalog.json."""
    slugs = catalog_slugs()
    url = get_database_url()
    if not url:
        return slugs
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT slug FROM products")
            slugs |= {row[0] for row in cur.fetchall()}
    return slugs


def slug_exists(slug: str) -> bool:
    return slug in list_existing_slugs()


def insert_product_draft(data: dict[str, Any], *, dry_run: bool = False) -> str:
    slug = data["slug"]
    if slug_exists(slug):
        raise ValueError(f"Duplicate slug already in database or catalog: {slug}")

    sql = """
    INSERT INTO products (category_id, slug, display_name, subtitle, image_url, amazon_url, amazon_price_label, specs)
    SELECT c.id, %(slug)s, %(display_name)s, %(subtitle)s, %(image_url)s, %(amazon_url)s, %(amazon_price_label)s, %(specs)s::jsonb
    FROM categories c WHERE c.slug = 'laptops'
    ON CONFLICT (slug) DO NOTHING
    """
    params = {
        "slug": slug,
        "display_name": data["displayName"],
        "subtitle": data.get("subtitle"),
        "image_url": data.get("imageUrl"),
        "amazon_url": data.get("amazonUrl"),
        "amazon_price_label": data.get("amazonPriceLabel"),
        "specs": json.dumps(data["specs"]),
    }

    if dry_run:
        return f"-- Would insert product: {slug}\n" + _format_insert_sql(params)

    url = get_database_url()
    if not url:
        raise RuntimeError("DATABASE_URL is not set")
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            if cur.rowcount == 0:
                raise RuntimeError("Insert failed — laptops category missing or slug conflict")
        conn.commit()

    merge_catalog_entry(
        {
            "slug": slug,
            "displayName": data["displayName"],
            "subtitle": data.get("subtitle"),
            "category": "laptops",
        }
    )
    return f"Inserted product: {slug} (catalog.json updated)"


def _format_insert_sql(params: dict[str, Any]) -> str:
    specs_escaped = json.dumps(params["specs"]).replace("'", "''")
    parts = [
        f"-- slug: {params['slug']}",
        f"INSERT INTO products (category_id, slug, display_name, subtitle, image_url, amazon_url, amazon_price_label, specs)",
        f"SELECT c.id, '{params['slug']}', '{params['display_name']}',",
        f"  {_sql_literal(params['subtitle'])}, {_sql_literal(params['image_url'])},",
        f"  {_sql_literal(params['amazon_url'])}, {_sql_literal(params['amazon_price_label'])},",
        f"  '{specs_escaped}'::jsonb",
        f"FROM categories c WHERE c.slug = 'laptops';",
    ]
    return "\n".join(parts)


def _sql_literal(val: Any) -> str:
    if val is None:
        return "NULL"
    return "'" + str(val).replace("'", "''") + "'"
