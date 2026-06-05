# Laptop ingest (local only)

Semi-automatic pipeline for **laptops** — separate from the Next.js app. Uses **Claude** to draft normalized JSON you review before Neon insert.

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
- `DATABASE_URL` — optional until `--push` (same Neon string as Vercel)

## Workflow

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

Duplicate slugs are rejected.

### 3. Publish a comparison page

```powershell
python create_comparison.py macbook-pro-16 dell-xps-15 --push --title "MacBook Pro 16 vs Dell XPS 15"
```

Live URL: `https://specsideview.com/compare/<comparison-slug>` (immutable — do not change slug after ads).

### 4. Batch / weekly new models

Edit `watchlist.txt`, then:

```powershell
python discover_laptops.py --weekly --limit 3
```

Or a one-off list file:

```powershell
python discover_laptops.py my-candidates.txt
```

Skips products already in Neon or `drafts/`.

## Product direction (roadmap)

SpecSideView is moving toward a **versus-style** flow (pick category → pick item → pick opponent) and **nanoreview-style** depth (spec tables + size graphics). This tool only feeds the database; the site UI will evolve toward that structure over time.

## Still manual (on purpose)

- Amazon **Associate-tagged** Special Links
- Verifying **price** before publish
- Final benchmark sanity check (Claude may estimate — read `sourcesNote` in each draft)

Never commit `.env` or API keys.
