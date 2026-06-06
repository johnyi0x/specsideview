import type { Category } from "@/db/schema";
import { LocaleLink } from "@/components/locale-link";

/** Category metadata for hub grid (extend when you add TV, headphones, etc.) */
export const CATEGORY_PRESENTATION: Record<
  string,
  { description: string; icon: "laptop" | "tv" | "headphones" | "generic"; available: boolean }
> = {
  laptops: {
    description: "Ultrabooks, gaming rigs, and creator machines",
    icon: "laptop",
    available: true,
  },
  tvs: {
    description: "Coming soon",
    icon: "tv",
    available: false,
  },
  headphones: {
    description: "Coming soon",
    icon: "headphones",
    available: false,
  },
};

function CategoryIcon({ kind }: { kind: string }) {
  const common = "h-10 w-10";
  switch (kind) {
    case "laptop":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" aria-hidden>
          <rect x="8" y="14" width="32" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M6 36h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="20" y="18" width="8" height="4" rx="1" fill="currentColor" opacity="0.35" />
        </svg>
      );
    case "tv":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" aria-hidden>
          <rect x="10" y="12" width="28" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M20 36h8M24 32v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "headphones":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" aria-hidden>
          <path d="M14 26v8a4 4 0 004 4h2V22h-2a4 4 0 00-4 4zm20 0v8a4 4 0 01-4 4h-2V22h2a4 4 0 014 4z" stroke="currentColor" strokeWidth="2" />
          <path d="M18 22a6 6 0 0112 0" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" aria-hidden>
          <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
  }
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const extras = Object.entries(CATEGORY_PRESENTATION).filter(
    ([slug]) => !categories.some((c) => c.slug === slug),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => {
        const meta = CATEGORY_PRESENTATION[cat.slug] ?? {
          description: cat.name,
          icon: "generic" as const,
          available: true,
        };
        return (
          <LocaleLink
            key={cat.id}
            href={`/compare/category/${cat.slug}`}
            className="card-surface group flex gap-4 rounded-2xl p-5 transition hover:border-[var(--color-accent)]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--color-accent)_12%,var(--color-card))] text-[var(--color-accent)]">
              <CategoryIcon kind={meta.icon} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold group-hover:text-[var(--color-accent)]">{cat.name}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{meta.description}</p>
            </div>
          </LocaleLink>
        );
      })}
      {extras.map(([slug, meta]) => (
        <div
          key={slug}
          className="card-surface flex gap-4 rounded-2xl p-5 opacity-50"
          aria-disabled
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-card-border)] text-[var(--color-muted)]">
            <CategoryIcon kind={meta.icon} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold capitalize">{slug.replace(/-/g, " ")}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{meta.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
