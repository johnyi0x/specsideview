# SpecSideView

Next.js 15 (App Router) + Neon Postgres + Drizzle ORM. Uses **Tailwind CSS v3** (PostCSS) instead of v4 so Windows builds avoid the LightningCSS native binary (`lightningcss.win32-x64-msvc.node`) install issues. Visual-first electronics comparisons with stable `/compare/<slug>` URLs for SEO and ad landing pages.

## Local development (Windows)

**PowerShell:** if `npm` fails with *running scripts is disabled*, use `npm.cmd install` or run  
`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` once, then open a new terminal.

1. Copy `.env.example` to `.env.local` and set:
   - `DATABASE_URL` — Neon connection string
   - `NEXT_PUBLIC_SITE_URL` — e.g. `http://localhost:3000` locally, `https://specsideview.com` in production
2. `npm install`
3. `npm run db:push` — applies the Drizzle schema to Neon
4. **Seed Neon:** open `drizzle/seed.sql`, copy the full SQL script, paste into Neon’s SQL editor, and execute. (Neon does not read file paths—pasting `drizzle/seed.sql` as a line of SQL causes a syntax error.) Same script works in `psql`. Safe to re-run thanks to `ON CONFLICT DO NOTHING`.
5. `npm run dev` — open http://localhost:3000

SerpAPI tooling lives in `tools/serp_research/` and is **not** part of the Next.js bundle.

## Deploy (Vercel + GitHub)

Push the repo to GitHub, import into Vercel, add the same environment variables in the Vercel dashboard (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`), then deploy. Point your IONOS domain to Vercel per their DNS guide.

## Stable URLs vs “subdomains”

Each paid comparison is keyed by an **immutable `slug` column** in Postgres. The public route is always `https://<your-domain>/compare/<slug>`. You can aim Google Ads at those full URLs; they stay valid when you redesign charts or copy. If you later want a marketing subdomain on IONOS, add a DNS record and optional rewrites—but the canonical, durable identifier is still the slug in the database.

## Amazon Associates

The global footer includes the **“As an Amazon Associate I earn from qualifying purchases.”** sentence plus link-level `#CommissionsEarned` labels beside outbound Amazon CTAs. Review the current [Associates Program Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement) whenever Amazon updates their policies.
