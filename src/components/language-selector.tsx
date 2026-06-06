"use client";

import { useParams } from "next/navigation";
import { defaultLocale, type Locale } from "@/lib/i18n";

/** Placeholder until more locales ship — shows current language with globe icon. */
export function LanguageSelector() {
  const params = useParams();
  const locale = (typeof params?.locale === "string" ? params.locale : defaultLocale) as Locale;
  const label = locale.toUpperCase();

  return (
    <button
      type="button"
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] px-2.5 text-xs font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:px-3"
      aria-label={`Language: ${label}. More languages coming soon.`}
      title="English only for now — more languages coming soon"
    >
      <GlobeIcon />
      <span className="tabular-nums">{label}</span>
    </button>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
