-- SpecSideView demo seed (Neon / Postgres)
-- Run after: npm run db:push (adds amazon_price_label column if new)
-- Replace amazon_url with your tagged Amazon Associates Special Links before production.
--
-- Note: Use dollar-quoting ($json$...$json$) for JSON so inch marks and escapes stay valid.

INSERT INTO categories (slug, name, sort_order)
VALUES ('laptops', 'Laptops', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, display_name, subtitle, image_url, amazon_url, amazon_price_label, specs)
SELECT c.id,
  'neo-laptop-alpha',
  'NeoBook Alpha 16',
  'Creator workstation · demo row',
  NULL,
  'https://www.amazon.com/',
  '$2,499 (demo — verify on Amazon & replace URL with your Special Link)',
  $json$
{
  "cpu": {
    "label": "Zenith HX9 (fictional)",
    "geekbenchSingle": 3220,
    "geekbenchMulti": 28500
  },
  "gpu": { "label": "Photon 408M (fictional)", "benchmarkScore": 19200 },
  "ai": { "label": "Geekbench ML (est.)", "benchmarkScore": 14200 },
  "ramGb": 64,
  "storageGb": 2000,
  "display": {
    "label": "16\" 16:10 panel",
    "diagonalIn": 16.0,
    "widthMm": 345.5,
    "heightMm": 216.0,
    "resolution": "3840x2400",
    "refreshHz": 120,
    "peakNits": 600
  },
  "weightKg": 2.05,
  "batteryWh": 99,
  "highlights": [
    "Vapor chamber demo entry",
    "Two TB PCIe gen5 (fictional)",
    "Calibrated display preset for photo work"
  ]
}
$json$::jsonb
FROM categories c
WHERE c.slug = 'laptops'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, display_name, subtitle, image_url, amazon_url, amazon_price_label, specs)
SELECT c.id,
  'voyage-air-thirteen',
  'Voyage Air 13',
  'Ultraportable · demo row',
  NULL,
  'https://www.amazon.com/',
  '$1,299 (demo — verify on Amazon & replace URL with your Special Link)',
  $json$
{
  "cpu": {
    "label": "V-core U9 (fictional)",
    "geekbenchSingle": 2680,
    "geekbenchMulti": 14200
  },
  "gpu": { "label": "Iris-style iGPU (fictional)", "benchmarkScore": 6200 },
  "ai": { "label": "Geekbench ML (est.)", "benchmarkScore": 4800 },
  "ramGb": 16,
  "storageGb": 512,
  "display": {
    "label": "13.4\" OLED",
    "diagonalIn": 13.4,
    "widthMm": 295.0,
    "heightMm": 184.4,
    "resolution": "2880x1800",
    "refreshHz": 60,
    "peakNits": 500
  },
  "weightKg": 1.12,
  "batteryWh": 57,
  "highlights": [
    "Under 1.2 kg for travel",
    "Fanless-class tuning (fictional)",
    "All-day meetings focus"
  ]
}
$json$::jsonb
FROM categories c
WHERE c.slug = 'laptops'
ON CONFLICT (slug) DO NOTHING;

-- Backfill demo Amazon fields per column (keeps a value you already set)
UPDATE products SET
  amazon_url = COALESCE(NULLIF(btrim(amazon_url), ''), 'https://www.amazon.com/'),
  amazon_price_label = COALESCE(
    NULLIF(btrim(amazon_price_label), ''),
    '$2,499 (demo — verify on Amazon & replace URL with your Special Link)'
  )
WHERE slug = 'neo-laptop-alpha';

UPDATE products SET
  amazon_url = COALESCE(NULLIF(btrim(amazon_url), ''), 'https://www.amazon.com/'),
  amazon_price_label = COALESCE(
    NULLIF(btrim(amazon_price_label), ''),
    '$1,299 (demo — verify on Amazon & replace URL with your Special Link)'
  )
WHERE slug = 'voyage-air-thirteen';

INSERT INTO comparisons (slug, category_id, product_a_id, product_b_id, meta_title, meta_description, published)
SELECT
  'neobook-alpha-16-vs-voyage-air-13',
  c.id,
  (SELECT id FROM products WHERE slug = 'neo-laptop-alpha' LIMIT 1),
  (SELECT id FROM products WHERE slug = 'voyage-air-thirteen' LIMIT 1),
  'NeoBook Alpha 16 vs Voyage Air 13 — visual spec duel',
  'Fictional demo laptops illustrating SpecSideView charts. Replace with your real SKUs and Amazon Special Links.',
  true
FROM categories c
WHERE c.slug = 'laptops'
ON CONFLICT (slug) DO NOTHING;
