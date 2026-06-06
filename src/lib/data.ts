import { asc, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, products } from "@/db/schema";
import {
  comparisonPairsForPage,
  totalComparisonPairs,
  type ComparisonPairPreview,
} from "@/lib/compare-pairs";

function dbOrNull() {
  if (!process.env.DATABASE_URL) return null;
  return getDb();
}

export async function listCategories() {
  const db = dbOrNull();
  if (!db) return [];
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoryBySlug(slug: string) {
  const db = dbOrNull();
  if (!db) return null;
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getProductBySlug(slug: string) {
  const db = dbOrNull();
  if (!db) return null;
  const rows = await db
    .select({
      product: products,
      category: categories,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return row;
}

export async function getProductPair(slugA: string, slugB: string) {
  if (slugA === slugB) return null;
  const [a, b] = await Promise.all([getProductBySlug(slugA), getProductBySlug(slugB)]);
  if (!a || !b) return null;
  return { productA: a.product, productB: b.product, categoryA: a.category, categoryB: b.category };
}

export type ProductListItem = {
  slug: string;
  displayName: string;
  subtitle: string | null;
  imageUrl: string | null;
};

export async function listProductsPaginated(
  categorySlug: string,
  page: number,
  pageSize: number,
): Promise<{
  category: typeof categories.$inferSelect;
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} | null> {
  const db = dbOrNull();
  if (!db) return null;

  const cat = await getCategoryBySlug(categorySlug);
  if (!cat) return null;

  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * pageSize;

  const [totalRow] = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.categoryId, cat.id));

  const total = Number(totalRow?.value ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const rows = await db
    .select({
      slug: products.slug,
      displayName: products.displayName,
      subtitle: products.subtitle,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(eq(products.categoryId, cat.id))
    .orderBy(asc(products.displayName))
    .limit(pageSize)
    .offset(offset);

  return {
    category: cat,
    products: rows,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

/** Lightweight list for sitemap / registry sync */
export async function listAllProductSlugs() {
  const db = dbOrNull();
  if (!db) return [];
  const rows = await db
    .select({
      slug: products.slug,
      displayName: products.displayName,
      categorySlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id));
  return rows;
}

/** All comparison pairs in a category — paginated (for hub featured list). */
export async function listComparisonPairsPaginated(
  categorySlug: string,
  page: number,
  pageSize: number,
): Promise<{
  category: typeof categories.$inferSelect;
  pairs: ComparisonPairPreview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} | null> {
  const db = dbOrNull();
  if (!db) return null;

  const cat = await getCategoryBySlug(categorySlug);
  if (!cat) return null;

  const rows = await db
    .select({
      slug: products.slug,
      displayName: products.displayName,
    })
    .from(products)
    .where(eq(products.categoryId, cat.id))
    .orderBy(asc(products.displayName));

  const total = totalComparisonPairs(rows.length);
  if (total === 0) return null;

  const safePage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(safePage, totalPages);
  const pairs = comparisonPairsForPage(rows, clampedPage, pageSize);

  return {
    category: cat,
    pairs,
    total,
    page: clampedPage,
    pageSize,
    totalPages,
  };
}

/** @deprecated use listComparisonPairsPaginated */
export async function getFeaturedPair(categorySlug: string) {
  const bundle = await listComparisonPairsPaginated(categorySlug, 1, 1);
  if (!bundle || bundle.pairs.length === 0) return null;
  const pair = bundle.pairs[0];
  return {
    category: bundle.category,
    a: { slug: pair.slugA, displayName: pair.nameA },
    b: { slug: pair.slugB, displayName: pair.nameB },
  };
}
