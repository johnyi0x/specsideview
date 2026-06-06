"use client";

import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { ProductListItem } from "@/lib/data";
import { comparePairPath } from "@/lib/compare-url";
import { defaultLocale, localizedPath, type Locale } from "@/lib/i18n";
import { ProductImage } from "@/components/product-image";

type Props = {
  categorySlug: string;
  categoryName: string;
  products: ProductListItem[];
  page: number;
  totalPages: number;
  initialA?: string;
  initialB?: string;
  initialSlotLabels?: {
    a?: { slug: string; name: string };
    b?: { slug: string; name: string };
  };
};

export function ComparePicker({
  categorySlug,
  categoryName,
  products,
  page,
  totalPages,
  initialA,
  initialB,
  initialSlotLabels,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (typeof params?.locale === "string" ? params.locale : defaultLocale) as Locale;
  const [slotA, setSlotA] = useState(initialA ?? "");
  const [slotB, setSlotB] = useState(initialB ?? "");

  const nameBySlug = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of products) m.set(p.slug, p.displayName);
    if (initialSlotLabels?.a) m.set(initialSlotLabels.a.slug, initialSlotLabels.a.name);
    if (initialSlotLabels?.b) m.set(initialSlotLabels.b.slug, initialSlotLabels.b.name);
    return m;
  }, [products, initialSlotLabels]);

  const addToSlot = useCallback(
    (slug: string) => {
      if (!slotA) {
        setSlotA(slug);
        return;
      }
      if (!slotB && slug !== slotA) {
        setSlotB(slug);
        return;
      }
      if (slug === slotA) return;
      if (slug === slotB) return;
      setSlotB(slug);
    },
    [slotA, slotB],
  );

  const compareHref = slotA && slotB && slotA !== slotB ? comparePairPath(slotA, slotB, locale) : null;

  const goPage = (p: number) => {
    const qs = new URLSearchParams(searchParams.toString());
    qs.set("page", String(p));
    if (slotA) qs.set("a", slotA);
    if (slotB) qs.set("b", slotB);
    router.push(`${localizedPath(`/compare/category/${categorySlug}`, locale)}?${qs.toString()}`);
  };

  return (
    <div className="space-y-10">
      <div className="card-surface space-y-3 rounded-2xl p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">
          Build a comparison · {categoryName}
        </p>
        <CompareSlot
          label="1"
          slug={slotA}
          name={slotA ? nameBySlug.get(slotA) : undefined}
          placeholder="Choose first laptop below"
          onClear={() => setSlotA("")}
        />
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[var(--color-muted)] opacity-60">vs</p>
        <CompareSlot
          label="2"
          slug={slotB}
          name={slotB ? nameBySlug.get(slotB) : undefined}
          placeholder="Choose second laptop"
          onClear={() => setSlotB("")}
        />
        {compareHref ? (
          <Link
            href={compareHref}
            className="mt-2 flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] py-3 text-sm font-semibold text-[var(--color-background)] transition hover:brightness-110"
          >
            Compare
          </Link>
        ) : (
          <p className="text-center text-xs text-[var(--color-muted)]">Pick two different items to enable Compare.</p>
        )}
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">All {categoryName.toLowerCase()}</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Tap a row or <span className="text-[var(--color-accent)]">+ vs</span> to fill the next open slot.
        </p>
        <ul className="mt-6 divide-y divide-[var(--color-card-border)] rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)]">
          {products.length === 0 ? (
            <li className="p-8 text-center text-sm text-[var(--color-muted)]">No products in this category yet.</li>
          ) : (
            products.map((p) => {
              const selected = p.slug === slotA || p.slug === slotB;
              return (
                <li key={p.slug}>
                  <button
                    type="button"
                    disabled={selected}
                    onClick={() => addToSlot(p.slug)}
                    className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-[color-mix(in_oklch,var(--color-accent)_6%,transparent)] disabled:cursor-default disabled:opacity-60 sm:gap-4 sm:p-4"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[color-mix(in_oklch,var(--color-card-border)_55%,transparent)] sm:h-16 sm:w-16">
                      {p.imageUrl ? (
                        <ProductImage src={p.imageUrl} alt={p.displayName} />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[var(--color-foreground)]">{p.displayName}</p>
                      {p.subtitle && (
                        <p className="truncate text-xs text-[var(--color-muted)] sm:text-sm">{p.subtitle}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--color-card-border)] px-3 py-1.5 text-xs font-medium">
                      {selected ? "Selected" : "+ vs"}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goPage(page - 1)}
              className="rounded-lg border border-[var(--color-card-border)] px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-2 text-sm text-[var(--color-muted)]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goPage(page + 1)}
              className="rounded-lg border border-[var(--color-card-border)] px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

function CompareSlot({
  label,
  slug,
  name,
  placeholder,
  onClear,
}: {
  label: string;
  slug: string;
  name?: string;
  placeholder: string;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-background)] px-3 py-2.5 sm:px-4">
      <span className="text-xs font-semibold text-[var(--color-muted)]">{label}</span>
      <div className="min-w-0 flex-1 text-sm">
        {slug ? (
          <span className="text-[var(--color-foreground)]">{name ?? slug}</span>
        ) : (
          <span className="text-[var(--color-muted)]">{placeholder}</span>
        )}
      </div>
      {slug && (
        <button type="button" onClick={onClear} className="text-[var(--color-muted)] hover:text-[var(--color-accent)]" aria-label="Clear">
          ×
        </button>
      )}
    </div>
  );
}
