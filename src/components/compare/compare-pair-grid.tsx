import type { ReactNode } from "react";
import { CompareVsDivider } from "@/components/compare/compare-vs-divider";

/** Two peer cards with a small “vs” between them (stacked on mobile, centered gutter on lg+). */
export function ComparePairGrid({ first, second, className = "" }: { first: ReactNode; second: ReactNode; className?: string }) {
  return (
    <div
      className={`grid grid-cols-1 items-center lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-2 ${className}`}
    >
      {first}
      <CompareVsDivider />
      {second}
    </div>
  );
}
