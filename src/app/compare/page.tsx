import Link from "next/link";
import { listCategories, listPublishedComparisons } from "@/lib/data";

export const metadata = {
  title: "Compare",
  description: "Pick a curated SpecSideView comparison or browse laptops by category.",
};

/** Always read Neon at request time — avoids empty static HTML when env vars are added after first deploy. */
export const dynamic = "force-dynamic";

export default async function CompareHubPage() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const [comparisons, cats] = await Promise.all([listPublishedComparisons(), listCategories()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Choose a comparison</h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Published pages use permanent URLs under <code className="text-[var(--color-accent)]">/compare/&lt;slug&gt;</code>{" "}
        so you can run paid search or backlinks without worrying about link rot when we refresh the visuals.
      </p>

      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold">Featured matchups</h2>
        {comparisons.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-[var(--color-card-border)] bg-[var(--color-card)]/60 p-8 text-sm leading-relaxed text-[var(--color-muted)]">
            {!hasDatabaseUrl ? (
              <>
                This deployment has no <code className="text-[var(--color-accent)]">DATABASE_URL</code>. In Vercel →
                Project → Settings → Environment Variables, add it for <strong className="text-[var(--color-foreground)]">Production</strong>
                , then redeploy (Deployments → ⋯ → Redeploy).
              </>
            ) : (
              <>
                Database is connected but no published comparisons were found. Run your seed in Neon, or set{" "}
                <code className="text-[var(--color-accent)]">published = true</code> on comparison rows. After schema or
                env changes on Vercel, redeploy once so pages stop serving an old static build.
              </>
            )}
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {comparisons.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/compare/${c.slug}`}
                  className="card-surface group block rounded-2xl p-6 transition hover:border-[var(--color-accent)]"
                >
                  <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{c.categoryName}</p>
                  <p className="mt-2 font-display text-lg font-semibold group-hover:text-[var(--color-accent)]">
                    {c.metaTitle ?? c.slug.replace(/-/g, " ")}
                  </p>
                  {c.metaDescription && <p className="mt-2 line-clamp-3 text-sm text-[var(--color-muted)]">{c.metaDescription}</p>}
                  <p className="mt-4 text-xs text-[var(--color-accent)]">Open comparison →</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16">
        <h2 className="font-display text-xl font-semibold">Browse by category</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Laptops ship first; add more categories in Neon when you expand beyond notebooks.
        </p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {cats.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/compare/browse/${cat.slug}`}
                className="inline-flex rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] px-5 py-2 text-sm font-medium hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
