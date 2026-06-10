import { LocaleLink } from "@/components/locale-link";

const AMAZON_POLICIES = "https://affiliate-program.amazon.com/help/operating/agreement";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-card-border)] bg-[var(--color-card)]/80 backdrop-blur-md">
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm leading-relaxed text-[var(--color-muted)]">
        <p className="font-medium text-[var(--color-foreground)]">Affiliate disclosure</p>
        <p className="mt-2">
          SpecSideView participates in the Amazon Services LLC Associates Program, an affiliate advertising program
          designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com
          and other Amazon sites.
        </p>
        <p className="mt-3 font-medium text-[var(--color-foreground)]">
          As an Amazon Associate I earn from qualifying purchases.
        </p>
        <p className="mt-3">
          When you follow product links on this site that point to Amazon, those links may be tagged with our
          affiliate code. Purchases made through these links may generate a commission at no additional cost to you.
          Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates. Product prices, images, and
          availability on Amazon are subject to change without notice; always verify details on Amazon before you
          purchase.
        </p>
        <p className="mt-3">
          This site provides independent editorial comparisons for informational purposes only; it does not replace
          manufacturer specifications or your own research. For the official Amazon Associates rules that govern how
          disclosures must be presented, see the{" "}
          <a
            href={AMAZON_POLICIES}
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            rel="noopener noreferrer"
          >
            Associates Program Operating Agreement
          </a>{" "}
          and related Program Policies on Amazon Associates Central. We keep this disclosure visible on every page so
          the relationship is clear no matter how you arrive here (including paid search campaigns).
        </p>
        <p className="mt-6 text-xs text-[var(--color-muted)]">
          © {new Date().getFullYear()} SpecSideView ·{" "}
          <LocaleLink href="/about" className="text-[var(--color-accent)] hover:underline">
            About
          </LocaleLink>
          {" · "}
          <LocaleLink href="/contact" className="text-[var(--color-accent)] hover:underline">
            Contact
          </LocaleLink>
          {" · "}
          <LocaleLink href="/privacy" className="text-[var(--color-accent)] hover:underline">
            Privacy
          </LocaleLink>
        </p>
      </div>
    </footer>
  );
}
