import { localizedPath, type Locale } from "@/lib/i18n";

/**
 * Canonical compare URLs: /{locale}/compare/{slugA}-vs-{slugB}
 * (nanoreview / versus style — "vs" in URL for search intent)
 *
 * Slugs are sorted alphabetically so each pair has one URL. No DB row per pair:
 * the route parses the slug, loads two products, and renders.
 *
 * Rule: individual product slugs must NOT contain the literal "-vs-" substring.
 */

export const COMPARE_PAIR_DELIMITER = "-vs-";

export function canonicalPair(slugA: string, slugB: string): [string, string] {
  if (slugA === slugB) return [slugA, slugB];
  return slugA < slugB ? [slugA, slugB] : [slugB, slugA];
}

export function comparePairSlug(slugA: string, slugB: string): string {
  const [a, b] = canonicalPair(slugA, slugB);
  if (a === b) return "";
  return `${a}${COMPARE_PAIR_DELIMITER}${b}`;
}

export function comparePairPath(slugA: string, slugB: string, locale: Locale = "en"): string {
  const slug = comparePairSlug(slugA, slugB);
  if (!slug) return "";
  return localizedPath(`/compare/${slug}`, locale);
}

/** Split a pair slug into two product slugs, or null if not a pair URL. */
export function parseComparePairSlug(pairSlug: string): [string, string] | null {
  const idx = pairSlug.indexOf(COMPARE_PAIR_DELIMITER);
  if (idx <= 0) return null;
  const slugA = pairSlug.slice(0, idx);
  const slugB = pairSlug.slice(idx + COMPARE_PAIR_DELIMITER.length);
  if (!slugA || !slugB || slugB.includes(COMPARE_PAIR_DELIMITER)) return null;
  return [slugA, slugB];
}

export function isCanonicalPairSlug(pairSlug: string): boolean {
  const parsed = parseComparePairSlug(pairSlug);
  if (!parsed) return false;
  const [a, b] = parsed;
  return comparePairSlug(a, b) === pairSlug;
}

/** @deprecated use isCanonicalPairSlug — kept for two-segment legacy redirects */
export function isCanonicalPairOrder(slugA: string, slugB: string): boolean {
  const [a] = canonicalPair(slugA, slugB);
  return slugA === a;
}
