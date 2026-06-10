import type { Metadata } from "next";
import { LocaleLink } from "@/components/locale-link";

const CONTACT_EMAIL = "btwiaintai@gmail.com";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact SpecSideView — beta feedback, corrections, and inquiries.",
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-accent)]">Beta</p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Contact</h1>
      <p className="mt-6 text-lg text-[var(--color-muted)]">
        SpecSideView is in <span className="text-[var(--color-foreground)]">beta</span>. We are actively adding
        products, refining comparisons, and improving the experience. Some specs, prices, or images may be outdated or
        incorrect while we scale the catalog.
      </p>

      <h2 className="font-display mt-14 text-2xl font-semibold">Get in touch</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        For inquiries, requests, feedback, or to report wrong information on a product page, email us at:
      </p>
      <p className="mt-6">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-display text-xl font-semibold text-[var(--color-accent)] hover:underline md:text-2xl"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        Please include the product name or comparison URL when asking for a correction so we can fix it faster.
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">What we can help with</h2>
      <ul className="mt-4 list-inside list-disc space-y-2 text-[var(--color-muted)]">
        <li>Incorrect specs, prices, or Amazon links on a laptop page</li>
        <li>Suggestions for models to add to the database</li>
        <li>Site bugs or confusing comparison UI</li>
        <li>General questions about how SpecSideView works</li>
      </ul>

      <h2 className="font-display mt-12 text-2xl font-semibold">Privacy</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        We do not share your email for marketing. See our{" "}
        <LocaleLink href="/privacy" className="text-[var(--color-accent)] hover:underline">
          Privacy Policy
        </LocaleLink>{" "}
        for how the site handles data and advertising.
      </p>

      <p className="mt-16">
        <LocaleLink href="/compare" className="text-[var(--color-accent)] hover:underline">
          Back to compare →
        </LocaleLink>
      </p>
    </article>
  );
}
