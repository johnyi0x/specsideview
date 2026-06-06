#!/usr/bin/env python3
"""Quick check: Windows env vars, Claude API, Neon (optional)."""

from __future__ import annotations

import os
import sys

from dotenv import load_dotenv

ROOT = __import__("pathlib").Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
load_dotenv()


def ok(msg: str) -> None:
    print(f"  OK  {msg}")


def fail(msg: str) -> None:
    print(f"  FAIL  {msg}")


def warn(msg: str) -> None:
    print(f"  WARN  {msg}")


def main() -> None:
    print("SpecSideView ingest — setup check\n")

    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if api_key:
        ok(f"ANTHROPIC_API_KEY set ({api_key[:8]}…)")
    else:
        fail("ANTHROPIC_API_KEY missing (Windows env or .env)")

    tag = os.environ.get("AMAZON_ASSOCIATE_TAG", "").strip()
    if tag:
        ok(f"AMAZON_ASSOCIATE_TAG = {tag}")
    else:
        fail("AMAZON_ASSOCIATE_TAG missing — set to specsideview-20 in Windows env")

    serp = os.environ.get("SERPAPI_API_KEY", "").strip()
    if serp:
        ok(f"SERPAPI_API_KEY set ({serp[:8]}…) — SerpAPI fallback in draft_item.py")
    else:
        warn("SERPAPI_API_KEY not set — draft_item.py uses Claude only for Amazon fields")

    model = os.environ.get("ANTHROPIC_MODEL", "claude-opus-4-7")
    ok(f"ANTHROPIC_MODEL = {model} (default claude-opus-4-7 if unset)")

    db = os.environ.get("DATABASE_URL", "").strip()
    if db:
        host = db.split("@")[1].split("/")[0] if "@" in db else "(parse failed)"
        ok(f"DATABASE_URL set — host {host}")
    else:
        fail("DATABASE_URL missing (needed for sync_catalog + push only)")

    if api_key:
        print("\nClaude API test…")
        try:
            from anthropic import Anthropic

            client = Anthropic(api_key=api_key)
            r = client.messages.create(
                model=model,
                max_tokens=16,
                messages=[{"role": "user", "content": "Reply with exactly: ok"}],
            )
            text = "".join(b.text for b in r.content if b.type == "text")
            ok(f"Claude replied: {text.strip()[:40]}")
        except Exception as exc:
            fail(f"Claude API: {exc}")

    if db:
        print("\nNeon connection test…")
        try:
            from db import connection_url_candidates, _connect

            for i, url in enumerate(connection_url_candidates(), 1):
                masked = url.split("@")[1].split("?")[0] if "@" in url else url[:40]
                print(f"  try {i}: …@{masked}")
            with _connect() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT COUNT(*) FROM products")
                    n = cur.fetchone()[0]
            ok(f"Neon connected — {n} product(s) in database")
        except Exception as exc:
            fail(f"Neon: {exc}")
            print(
                "\n  Neon timeout from home PC is often firewall/VPN blocking port 5432.\n"
                "  Workarounds:\n"
                "    • Neon dashboard → Connect → Direct connection (not pooler) as DATABASE_URL\n"
                "    • Or add DATABASE_URL_UNPOOLED in Windows env\n"
                "    • Skip sync for now: python sync_catalog.py --offline\n"
                "    • Scripts 1 & 2 work without Neon; only --push needs DB\n"
                "    • Push from Vercel/Neon SQL console if local DB never connects\n",
                file=sys.stderr,
            )

    print("\nDone.")


if __name__ == "__main__":
    main()
