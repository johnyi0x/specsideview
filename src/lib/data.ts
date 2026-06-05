import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, comparisons, products } from "@/db/schema";

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

export async function listPublishedComparisons() {
  const db = dbOrNull();
  if (!db) return [];
  return db
    .select({
      slug: comparisons.slug,
      metaTitle: comparisons.metaTitle,
      metaDescription: comparisons.metaDescription,
      categorySlug: categories.slug,
      categoryName: categories.name,
    })
    .from(comparisons)
    .innerJoin(categories, eq(comparisons.categoryId, categories.id))
    .where(eq(comparisons.published, true))
    .orderBy(desc(comparisons.createdAt));
}

export async function getComparisonBySlug(slug: string) {
  const db = dbOrNull();
  if (!db) return null;
  const rows = await db
    .select({
      comparison: comparisons,
      category: categories,
    })
    .from(comparisons)
    .innerJoin(categories, eq(comparisons.categoryId, categories.id))
    .where(and(eq(comparisons.slug, slug), eq(comparisons.published, true)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const [aRows, bRows] = await Promise.all([
    db.select().from(products).where(eq(products.id, row.comparison.productAId)).limit(1),
    db.select().from(products).where(eq(products.id, row.comparison.productBId)).limit(1),
  ]);

  const productA = aRows[0];
  const productB = bRows[0];
  if (!productA || !productB) return null;

  return {
    comparison: row.comparison,
    category: row.category,
    productA,
    productB,
  };
}

export async function listComparisonSlugs() {
  const db = dbOrNull();
  if (!db) return [];
  const rows = await db
    .select({ slug: comparisons.slug })
    .from(comparisons)
    .where(eq(comparisons.published, true));
  return rows.map((r) => r.slug);
}

export async function listProductsForCategory(categorySlug: string) {
  const db = dbOrNull();
  if (!db) return null;
  const cat = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .limit(1);
  const c = cat[0];
  if (!c) return null;

  const rows = await db
    .select({
      slug: products.slug,
      displayName: products.displayName,
      subtitle: products.subtitle,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(eq(products.categoryId, c.id))
    .orderBy(asc(products.displayName));
  return { category: c, products: rows };
}
