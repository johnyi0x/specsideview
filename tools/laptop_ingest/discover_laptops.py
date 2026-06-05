#!/usr/bin/env python3
"""
Batch-discover laptop drafts — skips slugs already in Neon.

  python discover_laptops.py candidates.txt
  python discover_laptops.py --weekly

`candidates.txt` = one laptop name per line (# comments allowed).
`watchlist.txt` in this folder is used for --weekly (edit over time).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv

from claude_polish import polish_laptop
from db import list_existing_slugs
from product_schema import slugify, validate_draft

ROOT = Path(__file__).resolve().parent
DRAFTS = ROOT / "drafts"
WATCHLIST = ROOT / "watchlist.txt"


def load_lines(path: Path) -> list[str]:
    lines: list[str] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        lines.append(line)
    return lines


def main() -> None:
    load_dotenv(ROOT / ".env")
    load_dotenv()

    parser = argparse.ArgumentParser()
    parser.add_argument("candidates", nargs="?", type=Path, help="Text file of laptop names")
    parser.add_argument("--weekly", action="store_true", help=f"Use {WATCHLIST.name} as candidate list")
    parser.add_argument("--limit", type=int, default=5, help="Max new drafts per run (default 5)")
    args = parser.parse_args()

    if args.weekly:
        if not WATCHLIST.exists():
            WATCHLIST.write_text(
                "# One laptop per line — popular / new models to track\n"
                "# MacBook Pro 16 M4 Max\n"
                "# Dell XPS 13 9345\n",
                encoding="utf-8",
            )
            print(f"Created sample {WATCHLIST} — edit it, then re-run.")
            return
        names = load_lines(WATCHLIST)
    elif args.candidates:
        names = load_lines(args.candidates)
    else:
        parser.error("Provide candidates.txt or --weekly")

    existing = list_existing_slugs()
    drafted = 0

    for name in names:
        if drafted >= args.limit:
            break
        guess_slug = slugify(name)
        if guess_slug in existing:
            print(f"Skip (in DB): {name}")
            continue
        draft_path = DRAFTS / f"{guess_slug}.json"
        if draft_path.exists():
            print(f"Skip (draft exists): {name}")
            continue

        print(f"Polishing: {name}")
        try:
            data = polish_laptop(name)
        except Exception as exc:
            print(f"  Failed: {exc}", file=sys.stderr)
            continue

        errors = validate_draft(data)
        if errors:
            print(f"  Warnings: {', '.join(errors)}", file=sys.stderr)

        slug = data["slug"]
        out = DRAFTS / f"{slug}.json"
        out.parent.mkdir(parents=True, exist_ok=True)
        import json

        out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"  Wrote {out}")
        drafted += 1

    print(f"Done. {drafted} new draft(s). Review in drafts/, then push_product.py --push")


if __name__ == "__main__":
    main()
