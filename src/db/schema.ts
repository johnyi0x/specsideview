import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/** Top-level product families (laptops first; add TV, headphones, etc. later). */
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/**
 * Curated product record. `specs` is a flexible JSON document you normalize by hand
 * (benchmarks, display geometry in mm, weight, etc.) so charts stay truthful.
 */
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url"),
  /** Full Amazon Special Link including your Associate tag — insert manually after review. */
  amazonUrl: text("amazon_url"),
  /**
   * Price string you verified on Amazon (e.g. "$1,899" or "$1,899 · checked 12 May 2026").
   * Amazon requires current pricing on-site to be accurate when shown; update when stale.
   */
  amazonPriceLabel: text("amazon_price_label"),
  specs: jsonb("specs")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Published head-to-head pages. `slug` is the permanent public key used in URLs.
 * Do not change slugs after you start running ads — update content, not the slug.
 */
export const comparisons = pgTable("comparisons", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  productAId: uuid("product_a_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  productBId: uuid("product_b_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Comparison = typeof comparisons.$inferSelect;
