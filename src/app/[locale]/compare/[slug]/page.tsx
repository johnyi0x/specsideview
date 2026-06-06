import { notFound, permanentRedirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { getProductPair } from "@/lib/data";
import { CompareView } from "@/components/compare/compare-view";
import { comparePairPath, isCanonicalPairSlug, parseComparePairSlug } from "@/lib/compare-url";
import type { Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Props = { params: Promise<{ locale: Locale; slug: string }> };

async function legacyComparisonRedirect(slug: string, locale: Locale): Promise<string | null> {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  const sql = neon(url);
  const rows = await sql`
    SELECT pa.slug AS slug_a, pb.slug AS slug_b
    FROM comparisons c
    JOIN products pa ON pa.id = c.product_a_id
    JOIN products pb ON pb.id = c.product_b_id
    WHERE c.slug = ${slug} AND c.published = true
    LIMIT 1
  `;

  const row = rows[0] as { slug_a: string; slug_b: string } | undefined;
  if (!row) return null;
  return comparePairPath(row.slug_a, row.slug_b, locale);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  const legacy = await legacyComparisonRedirect(slug, locale);
  if (legacy) {
    return { alternates: { canonical: legacy } };
  }

  const parsed = parseComparePairSlug(slug);
  if (!parsed) return { title: "Comparison" };

  const [slugA, slugB] = parsed;
  const pair = await getProductPair(slugA, slugB).catch(() => null);
  if (!pair) return { title: "Comparison" };

  const title = `${pair.productA.displayName} vs ${pair.productB.displayName}`;
  const description = `Compare ${pair.productA.displayName} and ${pair.productB.displayName} — specs, benchmarks, and visuals on SpecSideView.`;
  const path = comparePairPath(slugA, slugB, locale);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: `${siteUrl()}${path}`, type: "article" },
  };
}

export default async function ComparePairPage({ params }: Props) {
  const { slug, locale } = await params;

  const legacy = await legacyComparisonRedirect(slug, locale);
  if (legacy) permanentRedirect(legacy);

  const parsed = parseComparePairSlug(slug);
  if (!parsed) notFound();

  const [slugA, slugB] = parsed;
  if (slugA === slugB) notFound();

  if (!isCanonicalPairSlug(slug)) {
    permanentRedirect(comparePairPath(slugA, slugB, locale));
  }

  const pair = await getProductPair(slugA, slugB).catch(() => null);
  if (!pair) notFound();

  const { productA, productB, categoryA } = pair;
  const path = comparePairPath(slugA, slugB, locale);
  const pageUrl = `${siteUrl()}${path}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${productA.displayName} vs ${productB.displayName}`,
    description: `Compare ${productA.displayName} and ${productB.displayName}.`,
    url: pageUrl,
    isPartOf: { "@type": "WebSite", name: "SpecSideView", url: siteUrl() },
    about: [
      { "@type": "Product", name: productA.displayName },
      { "@type": "Product", name: productB.displayName },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CompareView
        payload={{
          pairPath: path,
          category: { name: categoryA.name, slug: categoryA.slug },
          productA,
          productB,
        }}
      />
    </>
  );
}
