# SerpAPI research (local only)

This folder is **intentionally outside** the Next.js app. Run it on your Windows machine when you want to pull rough
product facts from the public web before you normalize numbers and insert rows into Neon by hand.

## Setup

```powershell
cd tools\serp_research
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and add `SERPAPI_API_KEY` from your SerpAPI dashboard (Windows user env vars work too).

## Usage

```powershell
python fetch_product.py "Apple MacBook Pro 16 M4 Max"
```

The script prints JSON to stdout—copy the pieces you trust into your SQL editor or admin workflow, adjust anything that
would break charts, then insert into `products` / `comparisons` in Neon.

**Never** commit `.env` or live API keys.

When you unlock the Product Advertising API after sales thresholds, replace this flow with PA-API pulls that still
feed the same manual QA step.
