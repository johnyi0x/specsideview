"use client";

import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { ProductListItem } from "@/lib/data";
import { comparePairPath } from "@/lib/compare-url";
import { defaultLocale, localizedPath, type Locale } from "@/lib/i18n";
import { ProductImage } from "@/components/product-image";

type Props = {
  categorySlug: string;
  categoryName: string;
  products: ProductListItem[];
  allProducts: ProductListItem[];
  page: number;
  totalPages: number;
  search?: string;
  initialA?: string;
  initialB?: string;
  initialSlotLabels?: {
    a?: { slug: string; name: string };
    b?: { slug: string; name: string };
  };
};

function matchesQuery(product: ProductListItem, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    product.displayName.toLowerCase().includes(needle) ||
    product.slug.toLowerCase().includes(needle) ||
    (product.subtitle?.toLowerCase().includes(needle) ?? false)
  );
}

export function ComparePicker({
  categorySlug,
  categoryName,
  products,
  allProducts,
  page,
  totalPages,
  search = "",
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
  const [query, setQuery] = useState(search);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  const catalog = useMemo(() => {
    const bySlug = new Map<string, ProductListItem>();
    for (const p of allProducts) bySlug.set(p.slug, p);
    for (const p of products) bySlug.set(p.slug, p);
    return Array.from(bySlug.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [allProducts, products]);

  const nameBySlug = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of catalog) m.set(p.slug, p.displayName);
    if (initialSlotLabels?.a) m.set(initialSlotLabels.a.slug, initialSlotLabels.a.name);
    if (initialSlotLabels?.b) m.set(initialSlotLabels.b.slug, initialSlotLabels.b.name);
    return m;
  }, [catalog, initialSlotLabels]);

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

  const buildUrl = (patch: Record<string, string | undefined>) => {
    const qs = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(patch)) {
      if (val) qs.set(key, val);
      else qs.delete(key);
    }
    if (slotA) qs.set("a", slotA);
    else qs.delete("a");
    if (slotB) qs.set("b", slotB);
    else qs.delete("b");
    return `${localizedPath(`/compare/category/${categorySlug}`, locale)}?${qs.toString()}`;
  };

  const goPage = (p: number) => {
    router.push(buildUrl({ page: String(p) }));
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(buildUrl({ q: trimmed || undefined, page: "1" }));
  };

  const clearSearch = () => {
    setQuery("");
    router.push(buildUrl({ q: undefined, page: "1" }));
  };

  return (
    <div className="space-y-10">
      <div className="card-surface space-y-3 rounded-2xl p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">
          Build a comparison · {categoryName}
        </p>
        <SlotSearch
          label="1"
          slug={slotA}
          displayName={slotA ? nameBySlug.get(slotA) : undefined}
          placeholder="Search first laptop…"
          options={catalog}
          excludeSlug={slotB}
          onSelect={setSlotA}
          onClear={() => setSlotA("")}
        />
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[var(--color-muted)] opacity-60">vs</p>
        <SlotSearch
          label="2"
          slug={slotB}
          displayName={slotB ? nameBySlug.get(slotB) : undefined}
          placeholder="Search second laptop…"
          options={catalog}
          excludeSlug={slotA}
          onSelect={setSlotB}
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
          <p className="text-center text-xs text-[var(--color-muted)]">
            Search both slots or pick from the list below.
          </p>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">All {categoryName.toLowerCase()}</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Tap a row or <span className="text-[var(--color-accent)]">+ vs</span> to fill the next open slot.
            </p>
          </div>
        </div>

        <form onSubmit={submitSearch} className="mt-4 flex gap-2">
          <label htmlFor="product-search" className="sr-only">
            Filter {categoryName.toLowerCase()} list
          </label>
          <input
            id="product-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter list…`}
            className="min-w-0 flex-1 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)]"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl border border-[var(--color-card-border)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--color-accent)]"
          >
            Filter
          </button>
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="shrink-0 rounded-xl px-3 py-2.5 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
            >
              Clear
            </button>
          )}
        </form>

        <ul className="mt-6 divide-y divide-[var(--color-card-border)] rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)]">
          {products.length === 0 ? (
            <li className="p-8 text-center text-sm text-[var(--color-muted)]">
              {search ? `No results for “${search}”.` : "No products in this category yet."}
            </li>
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
                      {p.imageUrl ? <ProductImage src={p.imageUrl} alt={p.displayName} /> : null}
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

function SlotSearch({
  label,
  slug,
  displayName,
  placeholder,
  options,
  excludeSlug,
  onSelect,
  onClear,
}: {
  label: string;
  slug: string;
  displayName?: string;
  placeholder: string;
  options: ProductListItem[];
  excludeSlug: string;
  onSelect: (slug: string) => void;
  onClear: () => void;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(
    () => options.filter((p) => p.slug !== excludeSlug && matchesQuery(p, text)).slice(0, 8),
    [options, excludeSlug, text],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [text, open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (product: ProductListItem) => {
    onSelect(product.slug);
    setText("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(filtered[activeIndex]!);
    }
  };

  const showDropdown = open && (text.length > 0 || filtered.length > 0);

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-background)] px-3 py-2.5 sm:px-4">
        <span className="text-xs font-semibold text-[var(--color-muted)]">{label}</span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          value={open ? text : slug ? (displayName ?? slug) : text}
          placeholder={placeholder}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            if (slug && !text) setText(displayName ?? "");
          }}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-muted)]"
        />
        {slug && (
          <button
            type="button"
            onClick={() => {
              onClear();
              setText("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="text-[var(--color-muted)] hover:text-[var(--color-accent)]"
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-[var(--color-muted)]">No matches — try another name.</li>
          ) : (
            filtered.map((p, i) => (
              <li key={p.slug} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(p)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${
                    i === activeIndex
                      ? "bg-[color-mix(in_oklch,var(--color-accent)_10%,transparent)]"
                      : "hover:bg-[color-mix(in_oklch,var(--color-accent)_6%,transparent)]"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[color-mix(in_oklch,var(--color-card-border)_55%,transparent)]">
                    {p.imageUrl ? <ProductImage src={p.imageUrl} alt={p.displayName} className="p-0.5" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.displayName}</p>
                    {p.subtitle && <p className="truncate text-xs text-[var(--color-muted)]">{p.subtitle}</p>}
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
