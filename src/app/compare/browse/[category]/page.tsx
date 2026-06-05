import Link from "next/link";
import { notFound } from "next/navigation";
import { listCategories, listProductsForCategory } from "@/lib/data";

type Props = { params: Promise<{ category: string }> };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const cats = await listCategories();
    return cats.map((c) => ({ category: c.slug }));
  } catch {
    return [];
  }
}

export default async function BrowseCategoryPage({ params }: Props) {
  const { category } = await params;

  let bundle: Awaited<ReturnType<typeof listProductsForCategory>> = null;
  try {
    bundle = await listProductsForCategory(category);
  } catch {
    notFound();
  }

  if (!bundle) notFound();

  const { category: cat, products } = bundle;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">Category</p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{cat.name}</h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Products listed here are the building blocks for published comparison pages. Pair them in the database behind a
        permanent <code className="text-[var(--color-accent)]">/compare/&lt;slug&gt;</code> URL when you are ready to
        send traffic.
      </p>

      {products.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--color-muted)]">No products in this category yet.</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.slug} className="card-surface rounded-2xl p-5">
              <div className="aspect-[16/10] overflow-hidden rounded-xl bg-[color-mix(in_oklch,var(--color-card-border)_50%,transparent)]">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <p className="mt-4 font-display text-lg font-semibold">{p.displayName}</p>
              {p.subtitle && <p className="mt-1 text-sm text-[var(--color-muted)]">{p.subtitle}</p>}
              <p className="mt-3 text-xs text-[var(--color-muted)]">Slug · {p.slug}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-12">
        <Link href="/compare" className="text-[var(--color-accent)] hover:underline">
          ← Back to comparisons
        </Link>
      </p>
    </div>
  );
}
