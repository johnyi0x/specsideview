"use client";

import type { Product, Category } from "@/db/schema";
import { BenchmarkBars } from "@/components/compare/benchmark-bars";
import { RamStorageMeters } from "@/components/compare/ram-storage-meters";
import { ScreenSilhouettes } from "@/components/compare/screen-silhouettes";
import { WeightCompare } from "@/components/compare/weight-compare";
import { ComparePairGrid } from "@/components/compare/compare-pair-grid";
import { SpecComparisonTable } from "@/components/compare/spec-comparison-table";
import { parseLaptopSpecs } from "@/lib/spec-types";
import { LocaleLink } from "@/components/locale-link";
import { motion } from "framer-motion";

export type ComparePayload = {
  pairPath: string;
  category: Pick<Category, "name" | "slug">;
  productA: Product;
  productB: Product;
};

function ProductOverviewCard({ product, side }: { product: Product; side: "left" | "right" }) {
  const seriesColor = side === "left" ? "var(--chart-series-a)" : "var(--chart-series-b)";
  return (
    <div className="card-surface flex h-full min-w-0 flex-col rounded-xl p-3 sm:rounded-2xl sm:p-6 md:p-8">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:gap-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[8rem] shrink-0 overflow-hidden rounded-lg bg-[color-mix(in_oklch,var(--color-card-border)_55%,transparent)] sm:mx-0 sm:h-28 sm:w-32 sm:max-w-none sm:rounded-xl md:h-32 md:w-36">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 text-center sm:text-left">
          <p
            className="hidden text-[10px] font-medium uppercase tracking-[0.2em] sm:block sm:text-xs sm:tracking-[0.25em]"
            style={{ color: seriesColor }}
          >
            {side === "left" ? "Left" : "Right"}
          </p>
          <h2 className="font-display text-sm font-semibold leading-snug sm:mt-2 sm:text-xl md:text-2xl">
            {product.displayName}
          </h2>
          {product.subtitle && (
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-[var(--color-muted)] sm:mt-2 sm:text-sm">
              {product.subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 sm:mt-6">
        <AmazonBlock product={product} compact />
      </div>
    </div>
  );
}

function CalloutsCard({ title, list }: { title: string; list: string[] }) {
  return (
    <div className="card-surface h-full min-w-0 rounded-xl p-3 sm:rounded-2xl sm:p-6">
      <h3 className="font-display text-[10px] font-semibold uppercase leading-snug tracking-wide text-[var(--color-muted)] sm:text-sm sm:tracking-wider">
        <span className="line-clamp-2">{title}</span>
        <span className="text-[var(--color-muted)]"> · callouts</span>
      </h3>
      {list.length === 0 ? (
        <p className="mt-2 text-[10px] text-[var(--color-muted)] sm:mt-3 sm:text-sm">No highlights yet.</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-[10px] leading-snug text-[var(--color-foreground)] sm:mt-4 sm:space-y-2 sm:text-sm">
          {list.map((h, j) => (
            <li key={j} className="flex gap-1.5 sm:gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)] sm:mt-1.5 sm:h-1.5 sm:w-1.5" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AmazonBlock({ product, compact = false }: { product: Product; compact?: boolean }) {
  const url = product.amazonUrl?.trim();
  const price = product.amazonPriceLabel?.trim();
  const hasLink = Boolean(url);
  const hasPrice = Boolean(price);

  if (!hasLink && !hasPrice) {
    return (
      <p className="text-xs leading-relaxed text-[var(--color-muted)]">
        No Amazon data yet for <span className="text-[var(--color-foreground)]">{product.displayName}</span>. In Neon,
        set <code className="text-[var(--color-accent)]">amazon_price_label</code> (text you verified) and{" "}
        <code className="text-[var(--color-accent)]">amazon_url</code> (your tagged Special Link).
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {hasPrice && (
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)] sm:text-[10px] sm:tracking-[0.2em]">
            Price on Amazon
          </p>
          <p
            className={`font-display mt-0.5 font-semibold tracking-tight text-[var(--color-foreground)] ${compact ? "text-sm leading-snug sm:text-2xl" : "mt-1 text-2xl"}`}
          >
            {price}
          </p>
          {!compact && (
            <p className="mt-1 text-[10px] leading-snug text-[var(--color-muted)]">
              Amazon updates pricing and availability frequently — confirm the live listing before you purchase.
            </p>
          )}
        </div>
      )}

      {hasLink ? (
        <a
          href={url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className={`inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] font-semibold text-[var(--color-background)] transition hover:brightness-110 ${compact ? "mt-2 px-3 py-2 text-[11px] sm:px-5 sm:py-2.5 sm:text-sm" : "px-5 py-2.5 text-sm sm:w-auto"}`}
        >
          Amazon
        </a>
      ) : (
        <p className="text-xs text-[var(--color-muted)]">
          Price is shown for reference; add <code className="text-[var(--color-accent)]">amazon_url</code> to enable the
          affiliate button.
        </p>
      )}

      {hasLink && !compact && (
        <p className="text-[10px] leading-snug text-[var(--color-muted)]">
          <span className="font-medium text-[var(--color-foreground)]">#CommissionsEarned</span> — paid link. As an
          Amazon Associate we earn from qualifying purchases. See footer for full disclosure.
        </p>
      )}
      {hasLink && compact && (
        <p className="mt-1 text-[8px] leading-tight text-[var(--color-muted)] sm:hidden">
          <span className="text-[var(--color-foreground)]">#CommissionsEarned</span>
        </p>
      )}
    </div>
  );
}

export function CompareView({ payload }: { payload: ComparePayload }) {
  const { productA, productB, category, pairPath } = payload;
  const specsA = parseLaptopSpecs((productA.specs ?? {}) as Record<string, unknown>);
  const specsB = parseLaptopSpecs((productB.specs ?? {}) as Record<string, unknown>);

  const highlightsA = specsA.highlights ?? [];
  const highlightsB = specsB.highlights ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
        <LocaleLink href="/compare" className="hover:text-[var(--color-accent)]">
          Categories
        </LocaleLink>
        <span>/</span>
        <LocaleLink href={`/compare/category/${category.slug}`} className="hover:text-[var(--color-accent)]">
          {category.name}
        </LocaleLink>
        <span>/</span>
        <span className="font-mono text-[10px] text-[var(--color-accent)]">{pairPath.replace("/compare/", "")}</span>
      </div>

      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">Head-to-head</p>
        <h1 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          {productA.displayName}{" "}
          <span className="text-[var(--color-muted)]">vs</span> {productB.displayName}
        </h1>
        <p className="mt-4 text-base text-[var(--color-muted)]">
          Curated specs, benchmarks, and side-by-side context—tables and visuals together so you can see how these two
          models differ where it matters.
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-12"
      >
        <ComparePairGrid
          first={<ProductOverviewCard product={productA} side="left" />}
          second={<ProductOverviewCard product={productB} side="right" />}
        />
      </motion.div>

      {(highlightsA.length > 0 || highlightsB.length > 0) && (
        <section className="mt-12">
          <ComparePairGrid
            first={<CalloutsCard title={productA.displayName} list={highlightsA} />}
            second={<CalloutsCard title={productB.displayName} list={highlightsB} />}
          />
        </section>
      )}

      <div className="mt-14 space-y-10">
        <BenchmarkBars productA={productA} productB={productB} specsA={specsA} specsB={specsB} />
        <ScreenSilhouettes productA={productA} productB={productB} specsA={specsA} specsB={specsB} />
        <div className="grid gap-10 lg:grid-cols-2">
          <WeightCompare productA={productA} productB={productB} specsA={specsA} specsB={specsB} />
          <RamStorageMeters productA={productA} productB={productB} specsA={specsA} specsB={specsB} />
        </div>
      </div>

      <SpecComparisonTable productA={productA} productB={productB} specsA={specsA} specsB={specsB} />
    </div>
  );
}
