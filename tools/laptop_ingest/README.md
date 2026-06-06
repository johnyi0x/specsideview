# Laptop ingest — 3-script workflow

Semi-automatic pipeline for **laptops**. Separate from the Next.js app.

## Architecture (scalable + SEO-safe)

| Layer | What it stores |
|-------|----------------|
| **Neon `products`** | One row per laptop — the only thing you add |
| **Neon `categories`** | `laptops` (more later) |
| **`comparisons` table** | Legacy — ignore for new work |
| **Compare pages** | Built at runtime: `/en/compare/{a}-vs-{b}` |
| **Local files** | Duplicate guard + recommendation history |

**SEO:** 1,000 laptops ≈ 499,500 possible compare URLs, **zero** extra DB rows per pair.

### Local files (in this folder)

| File | Purpose |
|------|---------|
| `catalog.json` | Mirror of Neon products (slug, ASIN, SKU) — synced via `sync_catalog.py` |
| `recommendation_log.json` | Every item Script 1 ever suggested — **never re-recommended** |
| `pending_recommendations.json` | Latest batch from Script 1 — pick from here for Script 2 |
| `drafts/*.json` | Reviewed-by-you drafts before push |

---

## Setup (Windows)

```powershell
cd C:\Users\oldca\specsideview\tools\laptop_ingest
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...   # Neon **pooled** connection string
AMAZON_ASSOCIATE_TAG=specsideview-20
```

### Amazon affiliate tag

- Put **`specsideview-20` in `.env`** as `AMAZON_ASSOCIATE_TAG` — Script 2 auto-appends `?tag=specsideview-20` to draft URLs.
- **Each product’s full Special Link** is stored in Neon `amazon_url` after you review (can include the tag already).
- The **website does not need** the tag in Vercel env — it just links to whatever `amazon_url` is in the DB.

### Fix Neon connection errors

If `sync_catalog.py` fails:

1. Neon dashboard → **Connect** → copy **Pooled connection** string (not unpooled).
2. Paste into `tools/laptop_ingest/.env`.
3. Or skip DB for now: `python sync_catalog.py --offline`  
   Scripts 1 & 2 still work using local `catalog.json` + `recommendation_log.json`.

---

## The 3 scripts

### Script 1 — Recommend (`recommend_items.py`)

Suggests a **few new laptops** Claude thinks you should add. Excludes:

- Everything in `catalog.json` (DB)
- Everything in `recommendation_log.json` (past suggestions)
- Everything in `drafts/`

```powershell
python recommend_items.py
python recommend_items.py --limit 5
python recommend_items.py --from-watchlist
```

**Output:** `pending_recommendations.json` + log entry (won’t suggest again).

---

### Script 2 — Draft (`draft_item.py`)

Claude fills **full spec JSON** for **one** item you choose.

```powershell
python draft_item.py --name "MacBook Air 15 M4 2025"
python draft_item.py --asin B0XXXXXXXXX
python draft_item.py --amazon "https://www.amazon.com/dp/B0XXXXXXXXX"
python draft_item.py --sku "MC123LL/A" --name "MacBook Pro 14 M4"
```

**Output:** `drafts/<slug>.json` — **open and edit** (price, Amazon link, benchmarks, ports, etc.).

---

### Script 3 — Push (`push_product.py`)

After manual review:

```powershell
python push_product.py drafts\macbook-air-15-m4.json --dry-run
python push_product.py drafts\macbook-air-15-m4.json --push
```

**Output:** One row in Neon. Live on site immediately. No redeploy.

---

## After push — on the website

- Picker: `https://specsideview.com/en/compare/category/laptops`
- Compare: pick any two → charts + **full spec table** (connectivity, ports, keyboard, battery, …)
- Direct URL: `/en/compare/slug-a-vs-slug-b`

---

## Optional helpers

```powershell
python sync_catalog.py          # refresh catalog.json from Neon
python sync_catalog.py --offline
```

Legacy (don’t use for new work): `polish_laptop.py`, `discover_laptops.py`, `create_comparison.py`

Never commit `.env` or API keys.
