import { canonicalPair } from "@/lib/compare-url";

export type ComparisonPairPreview = {
  slugA: string;
  slugB: string;
  nameA: string;
  nameB: string;
};

type ProductRef = { slug: string; displayName: string };

/** Total unordered pairs for n products. */
export function totalComparisonPairs(count: number): number {
  if (count < 2) return 0;
  return (count * (count - 1)) / 2;
}

/** Map linear pair index → product pair (canonical slug order). */
export function comparisonPairAtIndex(products: ProductRef[], index: number): ComparisonPairPreview | null {
  if (index < 0) return null;

  let k = index;
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      if (k === 0) {
        const [slugA, slugB] = canonicalPair(products[i].slug, products[j].slug);
        const nameA = slugA === products[i].slug ? products[i].displayName : products[j].displayName;
        const nameB = slugB === products[j].slug ? products[j].displayName : products[i].displayName;
        return { slugA, slugB, nameA, nameB };
      }
      k--;
    }
  }
  return null;
}

export function comparisonPairsForPage(
  products: ProductRef[],
  page: number,
  pageSize: number,
): ComparisonPairPreview[] {
  const start = (Math.max(1, page) - 1) * pageSize;
  const pairs: ComparisonPairPreview[] = [];
  for (let i = 0; i < pageSize; i++) {
    const pair = comparisonPairAtIndex(products, start + i);
    if (!pair) break;
    pairs.push(pair);
  }
  return pairs;
}
