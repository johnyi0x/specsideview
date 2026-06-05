import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--color-accent)]">404</p>
      <h1 className="font-display mt-4 text-3xl font-semibold">This view is not in orbit</h1>
      <p className="mt-4 text-[var(--color-muted)]">
        The comparison slug may be unpublished, mistyped, or still sitting in your Neon draft rows.
      </p>
      <Link
        href="/compare"
        className="mt-8 inline-flex rounded-full border border-[var(--color-card-border)] px-6 py-2 text-sm font-medium hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        Back to comparisons
      </Link>
    </div>
  );
}
