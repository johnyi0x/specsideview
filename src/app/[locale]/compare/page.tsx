import { listCategories, listComparisonPairsPaginated } from "@/lib/data";
import { CategoryGrid } from "@/components/compare/category-grid";
import { FeaturedComparisons } from "@/components/compare/featured-comparisons";
import type { Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compare",
  description: "Choose a category, pick two products, and compare specs side by side on SpecSideView.",
};

const FEATURED_PAGE_SIZE = 3;

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ featuredPage?: string }>;
};

export default async function CompareHubPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const featuredPage = Math.max(1, parseInt(sp.featuredPage ?? "1", 10) || 1);

  const cats = await listCategories();
  const featured = await listComparisonPairsPaginated("laptops", featuredPage, FEATURED_PAGE_SIZE);

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

      {featured && featured.pairs.length > 0 && (
        <FeaturedComparisons
          locale={locale}
          pairs={featured.pairs}
          page={featured.page}
          totalPages={featured.totalPages}
          total={featured.total}
        />
      )}
    </div>
  );
}
