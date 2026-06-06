# Laptop ingest (local only)

Semi-automatic pipeline for **laptops** — separate from the Next.js app. Uses **Claude** to draft normalized JSON you review before Neon insert.

## Architecture (important)

- **Database stores individual products only** — one row per laptop.
- **Compare pages are generated on the fly** at `/compare/{slug-a}-vs-{slug-b}` (versus/nanoreview style; slugs sorted alphabetically for one canonical URL per pair).
- You do **not** need `create_comparison.py` or rows in the `comparisons` table for new pairs. That table is legacy for old URLs only.
- **`catalog.json`** is a local registry synced from Neon. Claude reads it so new drafts avoid duplicate slugs/names — run `sync_catalog.py` after pulling prod data or on a new machine.

## Setup (Windows)

```powershell
cd C:\Users\oldca\specsideview\tools\laptop_ingest
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Set in `.env` or Windows user environment:

- `ANTHROPIC_API_KEY` — required
- `DATABASE_URL` — optional until `--push` / `sync_catalog.py` (same Neon string as Vercel)

## Workflow

### 0. Sync local catalog (recommended first)

```powershell
python sync_catalog.py
```

Writes `catalog.json` from Neon. Claude and `polish_laptop.py` use this to block duplicates even when you are offline from the DB.

### 1. Draft one laptop (Claude)

```powershell
python polish_laptop.py "MacBook Pro 16 M4 Max 2024"
python polish_laptop.py "Dell XPS 15 9530" --amazon "https://www.amazon.com/dp/B0XXXX"
```

Output: `drafts/<slug>.json` — **open and edit** (benchmarks, Amazon Special Link, price, image URL).

### 2. Push to Neon (after review)

```powershell
python push_product.py drafts\macbook-pro-16-m4-max.json --dry-run
python push_product.py drafts\macbook-pro-16-m4-max.json --push
```

Duplicate slugs are rejected (catalog + Neon). After push, `catalog.json` is updated automatically.

### 3. Live on site

- Hub: `https://specsideview.com/compare`
- Pick category → pick two items → **Compare**
- Or direct URL: `https://specsideview.com/compare/neo-laptop-alpha-vs-voyage-air-thirteen`

Every new product instantly combines with every other product — no extra DB work per pair.

### 4. Batch / weekly new models

Edit `watchlist.txt`, then:

```powershell
python discover_laptops.py --weekly --limit 3
```

Skips products already in `catalog.json`, Neon, or `drafts/`.

## Legacy: `create_comparison.py`

Optional — only needed if you still use old single-slug URLs (`/compare/neobook-alpha-16-vs-voyage-air-13`). New work should **not** use this script.

## Still manual (on purpose)

- Amazon **Associate-tagged** Special Links
- Verifying **price** before publish
- Final benchmark sanity check (Claude may estimate — read `sourcesNote` in each draft)

Never commit `.env` or API keys.
