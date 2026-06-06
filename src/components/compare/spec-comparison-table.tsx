import type { Product } from "@/db/schema";
import type { LaptopSpecs } from "@/lib/spec-types";
import { buildSpecSections } from "@/lib/spec-table-rows";

type Props = {
  productA: Product;
  productB: Product;
  specsA: LaptopSpecs;
  specsB: LaptopSpecs;
};

export function SpecComparisonTable({ productA, productB, specsA, specsB }: Props) {
  const sections = buildSpecSections(specsA, specsB);
  if (sections.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Full spec comparison</h2>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Side-by-side details — connectivity, ports, input, and everything else beyond the charts above.
      </p>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="overflow-hidden rounded-2xl border border-[var(--color-card-border)]">
            <div className="border-b border-[var(--color-card-border)] bg-[color-mix(in_oklch,var(--color-card-border)_35%,var(--color-card))] px-4 py-3">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--color-foreground)]">
                {section.title}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-card-border)] text-xs uppercase tracking-wider text-[var(--color-muted)]">
                    <th className="w-[34%] px-4 py-3 font-medium">Spec</th>
                    <th className="w-[33%] px-4 py-3 font-medium text-[var(--chart-series-a)]">{productA.displayName}</th>
                    <th className="w-[33%] px-4 py-3 font-medium text-[var(--chart-series-b)]">{productB.displayName}</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((r, i) => (
                    <tr
                      key={r.label}
                      className={i % 2 === 0 ? "bg-[var(--color-card)]" : "bg-[color-mix(in_oklch,var(--color-card-border)_18%,var(--color-card))]"}
                    >
                      <td className="px-4 py-2.5 font-medium text-[var(--color-muted)]">{r.label}</td>
                      <td className="px-4 py-2.5 text-[var(--color-foreground)]">{r.a}</td>
                      <td className="px-4 py-2.5 text-[var(--color-foreground)]">{r.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
