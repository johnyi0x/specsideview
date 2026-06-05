import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "SpecSideView publishes in-depth electronics comparisons—curated specs, structured tables, and visual context—so you can decide with more than a bullet list or a generic AI summary.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">About SpecSideView</h1>
      <p className="mt-6 text-lg text-[var(--color-muted)]">
        Retail pages and quick AI answers can list specs, but they rarely line up two products on the same axes, keep
        numbers honest, or show you{" "}
        <span className="text-[var(--color-foreground)]">what the gap actually means</span> for how you will use the
        device. SpecSideView is built for that kind of comparison—extensive, structured, and worth bookmarking before
        you buy.
      </p>

      <h2 className="font-display mt-14 text-2xl font-semibold">What we do</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        We publish focused head-to-head comparisons—starting with laptops—using every format that helps: full spec
        coverage, side-by-side tables, benchmark scores with source context, and visual treatments (display scale,
        weight, capacity, compute) when a number is easier to grasp as a picture. The goal is not one gimmick chart; it
        is the most complete, clearest comparison we can put on a single permanent URL.
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">How data gets here</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        Every product record lives in our database and is inserted or updated manually after human review. We may use
        tools like SerpAPI locally to gather starting points from the public web, but nothing ships to the site until
        it has been normalized so tables and charts stay fair. That keeps mislabeled SKUs, mismatched configs, and
        marketing footnotes from polluting the comparison.
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">Stable comparison URLs</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        Each published comparison uses an immutable slug (for example{" "}
        <code className="text-[var(--color-accent)]">/compare/macbook-pro-16-m4-max-vs-galaxy-book4-ultra</code>
        ). You can point Google Ads or organic campaigns at that URL with confidence: when we add tables, refine copy,
        or extend the visual sections, the slug—and therefore your landing URL—stays the same.
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">Amazon affiliate relationship</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        SpecSideView is supported in part through Amazon Associates. That means some outbound product links are
        Special Links that may earn us a commission when you make a qualifying purchase, at no extra cost to you. The
        sitewide disclosure in the footer appears on every page—including this one—so the relationship is never hidden.
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">What we are not</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        We are not a live price tracker, not a retailer, and not an official voice of any brand. Always confirm final
        specs, warranty terms, and pricing on the seller you choose (often Amazon when you use our affiliate links).
      </p>

      <p className="mt-16">
        <Link href="/compare" className="text-[var(--color-accent)] hover:underline">
          Browse comparisons →
        </Link>
      </p>
    </article>
  );
}
