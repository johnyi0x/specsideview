import Link from "next/link";
import { comparePairPath } from "@/lib/compare-url";
import type { ComparisonPairPreview } from "@/lib/compare-pairs";
import { localizedPath, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  pairs: ComparisonPairPreview[];
  page: number;
  totalPages: number;
  total: number;
};

export function FeaturedComparisons({ locale, pairs, page, totalPages, total }: Props) {
  const hubPath = localizedPath("/compare", locale);
  const prevHref = page > 1 ? `${hubPath}?featuredPage=${page - 1}` : null;
  const nextHref = page < totalPages ? `${hubPath}?featuredPage=${page + 1}` : null;

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Featured comparisons</h2>
        {totalPages > 1 && (
          <p className="text-xs text-[var(--color-muted)]">
            {total} comparison{total === 1 ? "" : "s"} · page {page} of {totalPages}
          </p>
        )}
      </div>

      <ul className="mt-6 space-y-3">
        {pairs.map((pair) => {
          const href = comparePairPath(pair.slugA, pair.slugB, locale);
          return (
            <li key={href}>
              <Link
                href={href}
                className="card-surface block rounded-2xl p-5 transition hover:border-[var(--color-accent)] sm:p-6"
              >
                <p className="font-display text-base font-semibold text-[var(--color-accent)] sm:text-lg">
                  {pair.nameA} vs {pair.nameB}
                </p>
                <p className="mt-1.5 text-sm text-[var(--color-muted)]">Open comparison →</p>
              </Link>
            </li>
          );
        })}
      </ul>

      {totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-2" aria-label="Featured comparisons pagination">
          {prevHref ? (
            <Link
              href={prevHref}
              className="rounded-lg border border-[var(--color-card-border)] px-3 py-1.5 text-sm transition hover:border-[var(--color-accent)]"
            >
              Prev
            </Link>
          ) : (
            <span className="rounded-lg border border-[var(--color-card-border)] px-3 py-1.5 text-sm opacity-40">
              Prev
            </span>
          )}
          <span className="px-2 text-sm text-[var(--color-muted)]">
            {page} / {totalPages}
          </span>
          {nextHref ? (
            <Link
              href={nextHref}
              className="rounded-lg border border-[var(--color-card-border)] px-3 py-1.5 text-sm transition hover:border-[var(--color-accent)]"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-lg border border-[var(--color-card-border)] px-3 py-1.5 text-sm opacity-40">
              Next
            </span>
          )}
        </nav>
      )}
    </section>
  );
}
