"use client";

import type { Comparison, Product, Category } from "@/db/schema";
import { BenchmarkBars } from "@/components/compare/benchmark-bars";
import { RamStorageMeters } from "@/components/compare/ram-storage-meters";
import { ScreenSilhouettes } from "@/components/compare/screen-silhouettes";
import { WeightCompare } from "@/components/compare/weight-compare";
import { ComparePairGrid } from "@/components/compare/compare-pair-grid";
import { parseLaptopSpecs } from "@/lib/spec-types";
import Link from "next/link";
import { motion } from "framer-motion";

export type ComparePayload = {
  slug: string;
  comparison: Pick<Comparison, "metaTitle" | "metaDescription">;
  category: Pick<Category, "name" | "slug">;
  productA: Product;
  productB: Product;
};

function ProductOverviewCard({ product, side }: { product: Product; side: "left" | "right" }) {
  return (
    <div className="card-surface flex h-full flex-col rounded-2xl p-6 md:p-8">
      <div className="flex gap-5">
        <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl bg-[color-mix(in_oklch,var(--color-card-border)_55%,transparent)] md:h-32 md:w-44">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-accent)]">
            {side === "left" ? "Left column" : "Right column"}
          </p>
          <h2 className="font-display mt-2 text-xl font-semibold leading-tight md:text-2xl">{product.displayName}</h2>
          {product.subtitle && <p className="mt-2 text-sm text-[var(--color-muted)]">{product.subtitle}</p>}
        </div>
      </div>
      <div className="mt-6">
        <AmazonBlock product={product} />
      </div>
    </div>
  );
}

function CalloutsCard({ title, list }: { title: string; list: string[] }) {
  return (
    <div className="card-surface h-full rounded-2xl p-6">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">
        {title} · callouts
      </h3>
      {list.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-muted)]">No curated highlights for this product yet.</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm text-[var(--color-foreground)]">
          {list.map((h, j) => (
            <li key={j} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AmazonBlock({ product }: { product: Product }) {
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Price on Amazon
          </p>
          <p className="font-display mt-1 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {price}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-[var(--color-muted)]">
            Amazon updates pricing and availability frequently — confirm the live listing before you purchase.
          </p>
        </div>
      )}

      {hasLink ? (
        <a
          href={url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-background)] transition hover:brightness-110 sm:w-auto"
        >
          Go to Amazon
        </a>
      ) : (
        <p className="text-xs text-[var(--color-muted)]">
          Price is shown for reference; add <code className="text-[var(--color-accent)]">amazon_url</code> to enable the
          affiliate button.
        </p>
      )}

      {hasLink && (
        <p className="text-[10px] leading-snug text-[var(--color-muted)]">
          <span className="font-medium text-[var(--color-foreground)]">#CommissionsEarned</span> — paid link. As an
          Amazon Associate we earn from qualifying purchases. See footer for full disclosure.
        </p>
      )}
    </div>
  );
}

export function CompareView({ payload }: { payload: ComparePayload }) {
  const { productA, productB, category, comparison, slug } = payload;
  const specsA = parseLaptopSpecs((productA.specs ?? {}) as Record<string, unknown>);
  const specsB = parseLaptopSpecs((productB.specs ?? {}) as Record<string, unknown>);

  const highlightsA = specsA.highlights ?? [];
  const highlightsB = specsB.highlights ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
        <Link href="/compare" className="hover:text-[var(--color-accent)]">
          Comparisons
        </Link>
        <span>/</span>
        <span className="uppercase tracking-wider">{category.name}</span>
        <span>/</span>
        <span className="font-mono text-[10px] text-[var(--color-accent)]">{slug}</span>
      </div>

      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">Head-to-head</p>
        <h1 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          {productA.displayName}{" "}
          <span className="text-[var(--color-muted)]">vs</span> {productB.displayName}
        </h1>
        {comparison.metaTitle && <p className="mt-2 text-sm text-[var(--color-muted)]">{comparison.metaTitle}</p>}
        <p className="mt-4 text-base text-[var(--color-muted)]">
          {comparison.metaDescription ??
            "Curated specs, benchmarks, and side-by-side context—tables and visuals together so you can see how these two models differ where it matters."}
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
    </div>
  );
}
