import { notFound } from "next/navigation";
import { getComparisonBySlug, listComparisonSlugs } from "@/lib/data";
import { CompareView } from "@/components/compare/compare-view";
import { siteUrl } from "@/lib/site";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

/** New comparison rows appear without redeploy; slugs themselves never change once set. */
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await listComparisonSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getComparisonBySlug(slug).catch(() => null);
  if (!data) {
    return { title: "Comparison" };
  }
  const titleBase =
    data.comparison.metaTitle ?? `${data.productA.displayName} vs ${data.productB.displayName}`;
  const description =
    data.comparison.metaDescription ??
    `Visual spec comparison: ${data.productA.displayName} vs ${data.productB.displayName} on SpecSideView.`;
  return {
    title: titleBase,
    description,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title: titleBase,
      description,
      url: `${siteUrl()}/compare/${slug}`,
      type: "article",
    },
  };
}

export default async function CompareSlugPage({ params }: Props) {
  const { slug } = await params;
  const data = await getComparisonBySlug(slug).catch(() => null);
  if (!data) notFound();

  const { comparison, category, productA, productB } = data;
  const pageUrl = `${siteUrl()}/compare/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: comparison.metaTitle ?? `${productA.displayName} vs ${productB.displayName}`,
    description:
      comparison.metaDescription ??
      `Compare ${productA.displayName} and ${productB.displayName} with SpecSideView visuals.`,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "SpecSideView",
      url: siteUrl(),
    },
    about: [
      { "@type": "Product", name: productA.displayName, description: productA.subtitle ?? undefined },
      { "@type": "Product", name: productB.displayName, description: productB.subtitle ?? undefined },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CompareView
        payload={{
          slug,
          comparison: { metaTitle: comparison.metaTitle, metaDescription: comparison.metaDescription },
          category: { name: category.name, slug: category.slug },
          productA,
          productB,
        }}
      />
    </>
  );
}
