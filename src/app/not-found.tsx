import Link from "next/link";
import { localizedPath, defaultLocale } from "@/lib/i18n";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--color-accent)]">404</p>
      <h1 className="font-display mt-4 text-3xl font-semibold">This view is not in orbit</h1>
      <p className="mt-4 text-[var(--color-muted)]">
        That product or comparison pair may not exist yet, or the URL might be mistyped.
      </p>
      <Link
        href={localizedPath("/compare", defaultLocale)}
        className="mt-8 inline-flex rounded-full border border-[var(--color-card-border)] px-6 py-2 text-sm font-medium hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        Back to categories
      </Link>
    </div>
  );
}
