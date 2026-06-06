import Link from "next/link";
import { listCategories, getFeaturedPair } from "@/lib/data";
import { CategoryGrid } from "@/components/compare/category-grid";
import { comparePairPath } from "@/lib/compare-url";
import type { Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compare",
  description: "Choose a category, pick two products, and compare specs side by side on SpecSideView.",
};

type Props = { params: Promise<{ locale: Locale }> };

export default async function CompareHubPage({ params }: Props) {
  const { locale } = await params;
  const cats = await listCategories();
  const featured = await getFeaturedPair("laptops");
  const featuredHref =
    featured && featured.a.slug !== featured.b.slug
      ? comparePairPath(featured.a.slug, featured.b.slug, locale)
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Compare electronics</h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">Pick a category, then choose any two items to compare.</p>

      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold">Categories</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Choose a category to browse products.</p>
        <div className="mt-6">
          <CategoryGrid categories={cats} />
        </div>
      </section>

      {featuredHref && featured && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold">Featured comparison</h2>
          <Link
            href={featuredHref}
            className="card-surface mt-6 block rounded-2xl p-6 transition hover:border-[var(--color-accent)]"
          >
            <p className="font-display text-lg font-semibold text-[var(--color-accent)]">
              {featured.a.displayName} vs {featured.b.displayName}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Open comparison →</p>
          </Link>
        </section>
      )}

    </div>
  );
}
