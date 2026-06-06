"""Neon/Postgres helpers — list existing laptops, insert draft, duplicate guard."""

from __future__ import annotations

import json
import os
from typing import Any

import psycopg

from amazon_helpers import extract_asin
from registry import catalog_slugs, merge_catalog_entry


def normalize_database_url(url: str) -> str:
    """Neon requires SSL; ensure sslmode is set."""
    if "sslmode=" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}sslmode=require"
    return url


def get_database_url() -> str | None:
    raw = os.environ.get("DATABASE_URL") or None
    return normalize_database_url(raw) if raw else None


def connection_url_candidates() -> list[str]:
    """Pooled first, then direct (non-pooler) — helps when pooler times out on some networks."""
    urls: list[str] = []
    primary = get_database_url()
    if primary:
        urls.append(primary)

    unpooled = os.environ.get("DATABASE_URL_UNPOOLED", "").strip()
    if unpooled:
        urls.append(normalize_database_url(unpooled))
    elif primary and "-pooler" in primary:
        urls.append(normalize_database_url(primary.replace("-pooler", "")))

    # dedupe preserving order
    seen: set[str] = set()
    out: list[str] = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def _connect():
    urls = connection_url_candidates()
    if not urls:
        raise RuntimeError("DATABASE_URL is not set")

    last: Exception | None = None
    for url in urls:
        try:
            return psycopg.connect(url, connect_timeout=30)
        except Exception as exc:
            last = exc
    assert last is not None
    raise last


def fetch_all_products_for_catalog() -> list[dict[str, Any]]:
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT p.slug, p.display_name, p.subtitle, c.slug AS category_slug,
                       p.amazon_url
                FROM products p
                JOIN categories c ON c.id = p.category_id
                ORDER BY p.display_name
                """
            )
            rows = []
            for slug, name, subtitle, category, amazon_url in cur.fetchall():
                rows.append(
                    {
                        "slug": slug,
                        "displayName": name,
                        "subtitle": subtitle,
                        "category": category,
                        "amazonAsin": extract_asin(amazon_url or "") if amazon_url else None,
                        "modelSku": None,
                    }
                )
            return rows


def list_existing_slugs() -> set[str]:
    """Union of Neon slugs (when online) and local catalog.json."""
    slugs = catalog_slugs()
    try:
        with _connect() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT slug FROM products")
                slugs |= {row[0] for row in cur.fetchall()}
    except Exception:
        pass
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

    with _connect() as conn:
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
            "amazonAsin": data.get("amazonAsin") or extract_asin(data.get("amazonUrl") or ""),
            "modelSku": data.get("modelSku"),
        }
    )
    return f"Inserted product: {slug} (catalog.json updated)"


def _format_insert_sql(params: dict[str, Any]) -> str:
    specs_escaped = json.dumps(params["specs"]).replace("'", "''")
    parts = [
        f"-- slug: {params['slug']}",
        "INSERT INTO products (category_id, slug, display_name, subtitle, image_url, amazon_url, amazon_price_label, specs)",
        f"SELECT c.id, '{params['slug']}', '{params['display_name']}',",
        f"  {_sql_literal(params['subtitle'])}, {_sql_literal(params['image_url'])},",
        f"  {_sql_literal(params['amazon_url'])}, {_sql_literal(params['amazon_price_label'])},",
        f"  '{specs_escaped}'::jsonb",
        "FROM categories c WHERE c.slug = 'laptops';",
    ]
    return "\n".join(parts)


def _sql_literal(val: Any) -> str:
    if val is None:
        return "NULL"
    return "'" + str(val).replace("'", "''") + "'"
