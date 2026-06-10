import type { Metadata } from "next";
import { LocaleLink } from "@/components/locale-link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SpecSideView handles data, cookies, analytics, and advertising on this site.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Privacy Policy</h1>
      <p className="mt-4 text-sm text-[var(--color-muted)]">Last updated: June 2026</p>
      <p className="mt-6 text-lg text-[var(--color-muted)]">
        SpecSideView (“we”, “us”) publishes electronics comparisons for informational purposes. This policy explains
        what information may be collected when you use this website and how third-party services we use may process
        data.
      </p>

      <h2 className="font-display mt-14 text-2xl font-semibold">Information we collect</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        We do not require an account to browse SpecSideView. We do not sell personal information. Like most websites,
        our hosting and analytics providers may automatically receive technical data such as your IP address, browser
        type, device type, referring URL, and pages viewed. This helps us operate the site and understand general
        traffic patterns.
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">Cookies and similar technologies</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        We and our partners may use cookies, local storage, and similar technologies to remember preferences (such as
        theme), measure site usage, and serve advertisements. You can control cookies through your browser settings;
        disabling cookies may affect some features.
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">Google AdSense</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        We use Google AdSense to display ads. Google and its partners may use cookies to serve ads based on your prior
        visits to this site or other sites. Google’s use of advertising cookies enables it and its partners to serve
        ads to you. You may opt out of personalized advertising by visiting{" "}
        <a
          href="https://www.google.com/settings/ads"
          className="text-[var(--color-accent)] hover:underline"
          rel="noopener noreferrer"
        >
          Google Ads Settings
        </a>{" "}
        or{" "}
        <a
          href="https://www.aboutads.info/choices/"
          className="text-[var(--color-accent)] hover:underline"
          rel="noopener noreferrer"
        >
          www.aboutads.info
        </a>
        .
      </p>
      <p className="mt-3 text-[var(--color-muted)]">
        For more on how Google uses data, see{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          className="text-[var(--color-accent)] hover:underline"
          rel="noopener noreferrer"
        >
          How Google uses data when you use our partners’ sites or apps
        </a>
        .
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">Analytics</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        We may use privacy-focused analytics (such as Vercel Analytics) to understand aggregate traffic and performance.
        These tools are intended to help us improve the site, not to build individual profiles for sale.
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">Amazon affiliate links</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        Product links to Amazon are affiliate links. When you click them, Amazon may receive standard referral
        information. Amazon’s privacy practices are governed by Amazon’s own policies, not this page. See our{" "}
        <LocaleLink href="/about" className="text-[var(--color-accent)] hover:underline">
          About
        </LocaleLink>{" "}
        page for affiliate disclosure details.
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">Children</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        SpecSideView is not directed at children under 13. We do not knowingly collect personal information from
        children.
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">Changes</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        We may update this policy as the site evolves (including during beta). The “Last updated” date at the top will
        change when we do.
      </p>

      <h2 className="font-display mt-12 text-2xl font-semibold">Contact</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        Questions about this policy or your data? Email{" "}
        <a href="mailto:btwiaintai@gmail.com" className="text-[var(--color-accent)] hover:underline">
          btwiaintai@gmail.com
        </a>{" "}
        or visit our{" "}
        <LocaleLink href="/contact" className="text-[var(--color-accent)] hover:underline">
          Contact
        </LocaleLink>{" "}
        page.
      </p>
    </article>
  );
}
