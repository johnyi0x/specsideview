import { LocaleLink } from "@/components/locale-link";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="bg-mission-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[var(--color-accent)]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[var(--color-glow)]/25 blur-[100px]" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-24 pt-20 text-center md:pt-28">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-accent)]">
          SpecSideView
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          <span className="text-gradient">Compare electronics specs</span>
          <br />
          the way that actually helps you decide.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--color-muted)] md:text-xl">
          Head-to-head pages built for depth: curated spec sheets, structured tables, benchmark context, and visual
          comparisons side by side—so you can weigh tradeoffs without guessing or pasting SKUs into a chatbot.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <LocaleLink
            href="/compare"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-3 text-sm font-semibold text-[var(--color-background)] transition hover:brightness-110"
            style={{ boxShadow: "0 0 40px color-mix(in oklch, var(--color-accent) 45%, transparent)" }}
          >
            <span className="text-lg leading-none">+</span>
            Start a comparison
          </LocaleLink>
          <LocaleLink
            href="/about"
            className="text-sm font-medium text-[var(--color-muted)] underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
          >
            How it works
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
