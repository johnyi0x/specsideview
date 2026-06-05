import type { ReactNode } from "react";
import { CompareVsDivider } from "@/components/compare/compare-vs-divider";

/** Two peer cards side-by-side at every breakpoint (narrow columns on phone, same layout as desktop). */
export function ComparePairGrid({ first, second, className = "" }: { first: ReactNode; second: ReactNode; className?: string }) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-1 sm:gap-x-2 ${className}`}
    >
      {first}
      <CompareVsDivider />
      {second}
    </div>
  );
}
