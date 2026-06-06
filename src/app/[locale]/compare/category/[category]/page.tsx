import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ComparePicker } from "@/components/compare/compare-picker";
import { listProductsPaginated, listProductsInCategory, getProductBySlug } from "@/lib/data";
import { LocaleLink } from "@/components/locale-link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string; q?: string; a?: string; b?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  return {
    title: `${category.replace(/-/g, " ")} — pick items to compare`,
  };
}

export default async function CategoryComparePage({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const search = sp.q?.trim() ?? "";

  const bundle = await listProductsPaginated(category, page, PAGE_SIZE, search);
  if (!bundle) notFound();

  const allProducts = await listProductsInCategory(category);

  const [resolvedA, resolvedB] = await Promise.all([
    sp.a ? getProductBySlug(sp.a) : Promise.resolve(null),
    sp.b ? getProductBySlug(sp.b) : Promise.resolve(null),
  ]);

  const initialSlotLabels = {
    a: resolvedA ? { slug: resolvedA.product.slug, name: resolvedA.product.displayName } : undefined,
    b: resolvedB ? { slug: resolvedB.product.slug, name: resolvedB.product.displayName } : undefined,
  };

  const countLabel =
    bundle.search.length > 0
      ? `${bundle.total} match${bundle.total === 1 ? "" : "es"} for “${bundle.search}”`
      : `${bundle.total} item${bundle.total === 1 ? "" : "s"}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <div className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
        <LocaleLink href="/compare" className="hover:text-[var(--color-accent)]">
          Categories
        </LocaleLink>
        <span>/</span>
        <span className="text-[var(--color-foreground)]">{bundle.category.name}</span>
      </div>

      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{bundle.category.name}</h1>
      <p className="mt-3 text-[var(--color-muted)]">
        {countLabel} · page {bundle.page} of {bundle.totalPages}
      </p>

      <Suspense fallback={<p className="mt-10 text-sm text-[var(--color-muted)]">Loading picker…</p>}>
        <div className="mt-10">
          <ComparePicker
            categorySlug={category}
            categoryName={bundle.category.name}
            products={bundle.products}
            allProducts={allProducts}
            page={bundle.page}
            totalPages={bundle.totalPages}
            search={bundle.search}
            initialA={sp.a}
            initialB={sp.b}
            initialSlotLabels={initialSlotLabels}
          />
        </div>
      </Suspense>
    </div>
  );
}
