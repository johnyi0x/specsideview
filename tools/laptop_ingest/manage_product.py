#!/usr/bin/env python3
"""
Manage products already in Neon — list, inspect, delete, or patch fields.

  python manage_product.py list
  python manage_product.py show neo-laptop-alpha
  python manage_product.py delete neo-laptop-alpha voyage-air-thirteen --yes
  python manage_product.py update dell-xps-13-9350-2025 --price "$1,599.99"
  python manage_product.py update dell-xps-13-9350-2025 --spec weightKg 1.18
  python manage_product.py update dell-xps-13-9350-2025 --spec-json '{"display":{"peakNits":500}}'
  python manage_product.py apply-draft drafts/apple-macbook-air-15-m4-2025.json

  Commands
Task	Command
List all
python manage_product.py list
Full JSON
python manage_product.py show <slug>
Delete
python manage_product.py delete <slug> --yes
Fix price
python manage_product.py update <slug> --price "$949.00"
Fix name
python manage_product.py update <slug> --name "New Name"
Fix subtitle
python manage_product.py update <slug> --subtitle "..."
Fix Amazon URL
python manage_product.py update <slug> --amazon-url "https://..."
Fix image
python manage_product.py update <slug> --image-url "https://..."
Fix one spec
python manage_product.py update <slug> --spec weightKg 1.18
Fix nested spec
python manage_product.py update <slug> --spec display.peakNits 500
Fix specs JSON
python manage_product.py update <slug> --spec-json '{"cpu":{"geekbenchSingle":3751}}'
Apply whole draft
python manage_product.py apply-draft drafts/<slug>.json

"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from amazon_helpers import apply_associate_tag, extract_asin, normalize_price_label
from db import (
    delete_product_by_slug,
    fetch_all_products_for_catalog,
    fetch_product_by_slug,
    list_all_products_brief,
    update_product_by_slug,
)
from registry import merge_catalog_entry, remove_catalog_entry, save_catalog

ROOT = Path(__file__).resolve().parent
DRAFTS = ROOT / "drafts"


def _deep_merge(base: dict[str, Any], patch: dict[str, Any]) -> dict[str, Any]:
    out = dict(base)
    for key, val in patch.items():
        if key in out and isinstance(out[key], dict) and isinstance(val, dict):
            out[key] = _deep_merge(out[key], val)
        else:
            out[key] = val
    return out


def _set_nested(data: dict[str, Any], dotted_key: str, value: Any) -> None:
    parts = dotted_key.split(".")
    cur: dict[str, Any] = data
    for part in parts[:-1]:
        nxt = cur.get(part)
        if not isinstance(nxt, dict):
            nxt = {}
            cur[part] = nxt
        cur = nxt
    cur[parts[-1]] = value


def _parse_spec_value(raw: str) -> Any:
    raw = raw.strip()
    if not raw:
        return raw
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    if raw.lower() in ("true", "false"):
        return raw.lower() == "true"
    try:
        if "." in raw:
            return float(raw)
        return int(raw)
    except ValueError:
        return raw


def _refresh_catalog() -> None:
    save_catalog(fetch_all_products_for_catalog())


def _catalog_entry_from_product(product: dict[str, Any]) -> dict[str, Any]:
    return {
        "slug": product["slug"],
        "displayName": product["displayName"],
        "subtitle": product.get("subtitle"),
        "category": product.get("category", "laptops"),
        "amazonAsin": product.get("amazonAsin") or extract_asin(product.get("amazonUrl") or ""),
        "modelSku": product.get("modelSku"),
    }


def cmd_list(_: argparse.Namespace) -> None:
    rows = list_all_products_brief()
    if not rows:
        print("No products in Neon.")
        return
    print(f"{len(rows)} product(s):\n")
    for row in rows:
        sub = f" — {row['subtitle']}" if row.get("subtitle") else ""
        print(f"  {row['slug']}")
        print(f"    {row['displayName']}{sub}")


def cmd_show(args: argparse.Namespace) -> None:
    product = fetch_product_by_slug(args.slug)
    if not product:
        print(f"Not found: {args.slug}", file=sys.stderr)
        sys.exit(1)
    print(json.dumps(product, indent=2, ensure_ascii=False))


def cmd_delete(args: argparse.Namespace) -> None:
    slugs = args.slugs
    if not args.yes:
        print("Refusing to delete without --yes", file=sys.stderr)
        print("Example:", file=sys.stderr)
        print(f"  python manage_product.py delete {' '.join(slugs)} --yes", file=sys.stderr)
        sys.exit(1)

    for slug in slugs:
        if args.dry_run:
            product = fetch_product_by_slug(slug)
            if not product:
                print(f"  [dry-run] not found: {slug}")
                continue
            print(f"  [dry-run] would delete: {slug} ({product['displayName']})")
            continue

        name = delete_product_by_slug(slug)
        remove_catalog_entry(slug)
        draft = DRAFTS / f"{slug}.json"
        if args.remove_draft and draft.exists():
            draft.unlink()
            print(f"  removed draft: {draft.name}")
        print(f"Deleted: {slug} ({name})")

    if not args.dry_run:
        _refresh_catalog()
        print("catalog.json refreshed from Neon.")


def cmd_update(args: argparse.Namespace) -> None:
    product = fetch_product_by_slug(args.slug)
    if not product:
        print(f"Not found: {args.slug}", file=sys.stderr)
        sys.exit(1)

    fields: dict[str, Any] = {}
    if args.name:
        fields["displayName"] = args.name.strip()
    if args.subtitle is not None:
        fields["subtitle"] = args.subtitle.strip() or None
    if args.image_url is not None:
        fields["imageUrl"] = args.image_url.strip() or None
    if args.amazon_url is not None:
        url = apply_associate_tag(args.amazon_url.strip()) if args.amazon_url.strip() else None
        fields["amazonUrl"] = url
    if args.price is not None:
        fields["amazonPriceLabel"] = normalize_price_label(args.price) or args.price.strip() or None

    specs_changed = False
    specs = dict(product.get("specs") or {})

    if args.spec_json:
        patch = json.loads(args.spec_json)
        if not isinstance(patch, dict):
            raise ValueError("--spec-json must be a JSON object")
        specs = _deep_merge(specs, patch)
        specs_changed = True

    if args.spec:
        if len(args.spec) % 2 != 0:
            print("Error: --spec needs pairs: KEY VALUE [KEY VALUE ...]", file=sys.stderr)
            sys.exit(1)
        for i in range(0, len(args.spec), 2):
            key = args.spec[i]
            val = _parse_spec_value(args.spec[i + 1])
            _set_nested(specs, key, val)
        specs_changed = True

    if args.specs_file:
        patch = json.loads(Path(args.specs_file).read_text(encoding="utf-8-sig"))
        if not isinstance(patch, dict):
            raise ValueError("--specs-file must contain a JSON object")
        specs = _deep_merge(specs, patch)
        specs_changed = True

    if specs_changed:
        fields["specs"] = specs

    if not fields:
        print("Nothing to update — pass --name, --subtitle, --price, --amazon-url, --image-url, --spec, or --spec-json", file=sys.stderr)
        sys.exit(1)

    if args.dry_run:
        print(f"[dry-run] would update {args.slug}:")
        print(json.dumps(fields, indent=2, ensure_ascii=False))
        return

    update_product_by_slug(args.slug, fields)
    updated = fetch_product_by_slug(args.slug)
    if updated:
        merge_catalog_entry(_catalog_entry_from_product(updated))
    print(f"Updated: {args.slug}")
    for key, val in fields.items():
        if key == "specs":
            print("  specs: (merged — run 'show' for full JSON)")
        else:
            print(f"  {key}: {val}")


def cmd_apply_draft(args: argparse.Namespace) -> None:
    path = args.draft
    if not path.exists():
        print(f"Not found: {path}", file=sys.stderr)
        sys.exit(1)

    data = json.loads(path.read_text(encoding="utf-8-sig"))
    slug = data.get("slug")
    if not slug:
        print("Draft missing slug", file=sys.stderr)
        sys.exit(1)

    existing = fetch_product_by_slug(slug)
    if not existing:
        print(f"Product '{slug}' not in Neon — use push_product.py for new items.", file=sys.stderr)
        sys.exit(1)

    fields: dict[str, Any] = {}
    for key in ("displayName", "subtitle", "imageUrl", "amazonUrl", "amazonPriceLabel"):
        if key in data and data[key] is not None:
            val = data[key]
            if key == "amazonUrl" and val:
                val = apply_associate_tag(str(val).strip())
            if key == "amazonPriceLabel" and val:
                val = normalize_price_label(val) or str(val).strip()
            fields[key] = val
    if isinstance(data.get("specs"), dict):
        fields["specs"] = _deep_merge(dict(existing.get("specs") or {}), data["specs"])

    if args.dry_run:
        print(f"[dry-run] would apply draft to {slug}:")
        print(json.dumps(fields, indent=2, ensure_ascii=False))
        return

    update_product_by_slug(slug, fields)
    updated = fetch_product_by_slug(slug)
    if updated:
        merge_catalog_entry(_catalog_entry_from_product(updated))
    print(f"Applied draft → Neon: {slug}")


def main() -> None:
    load_dotenv(ROOT / ".env")
    load_dotenv()

    parser = argparse.ArgumentParser(description="List, delete, or update products in Neon")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without writing")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("list", help="List all products in Neon")

    show_p = sub.add_parser("show", help="Print full product JSON")
    show_p.add_argument("slug")

    del_p = sub.add_parser("delete", help="Delete one or more products")
    del_p.add_argument("slugs", nargs="+", metavar="SLUG")
    del_p.add_argument("--yes", action="store_true", help="Required to confirm delete")
    del_p.add_argument("--remove-draft", action="store_true", help="Also delete drafts/<slug>.json if present")

    upd_p = sub.add_parser("update", help="Patch top-level fields or specs on one product")
    upd_p.add_argument("slug")
    upd_p.add_argument("--name", help="displayName")
    upd_p.add_argument("--subtitle", help="subtitle (pass empty string to clear)")
    upd_p.add_argument("--price", help='amazonPriceLabel e.g. "$949.00"')
    upd_p.add_argument("--amazon-url", dest="amazon_url", help="amazonUrl (tag appended from .env)")
    upd_p.add_argument("--image-url", dest="image_url", help="imageUrl")
    upd_p.add_argument("--spec", nargs="*", metavar="KEY", help="Spec patch pairs: cpu.label 'Apple M4' weightKg 1.6")
    upd_p.add_argument("--spec-json", help='Merge JSON into specs, e.g. \'{"weightKg":1.18}\'')
    upd_p.add_argument("--specs-file", type=Path, help="Merge JSON file into specs")

    draft_p = sub.add_parser("apply-draft", help="Apply a reviewed draft JSON onto an existing DB row")
    draft_p.add_argument("draft", type=Path)

    args = parser.parse_args()

    try:
        if args.command == "list":
            cmd_list(args)
        elif args.command == "show":
            cmd_show(args)
        elif args.command == "delete":
            cmd_delete(args)
        elif args.command == "update":
            cmd_update(args)
        elif args.command == "apply-draft":
            cmd_apply_draft(args)
    except (ValueError, json.JSONDecodeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
