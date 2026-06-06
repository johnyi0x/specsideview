"use client";

import { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/language-selector";
import { LocaleLink } from "@/components/locale-link";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-card-border)]/80 bg-[var(--color-background)]/85 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <LocaleLink
          href="/"
          className="shrink-0 font-display text-lg font-semibold tracking-tight text-[var(--color-foreground)]"
          onClick={() => setMenuOpen(false)}
        >
          Spec<span className="text-[var(--color-accent)]">Side</span>View
        </LocaleLink>

        {/* Desktop */}
        <nav className="hidden items-center gap-3 text-sm font-medium md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <LocaleLink key={link.href} href={link.href} className="text-[var(--color-muted)] hover:text-[var(--color-accent)]">
              {link.label}
            </LocaleLink>
          ))}
          <LanguageSelector />
          <ThemeToggle />
        </nav>

        {/* Mobile: menu button only (theme lives inside panel) */}
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-card-border)] text-[var(--color-foreground)] md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-14 z-40 bg-[var(--color-background)]/60 backdrop-blur-sm md:hidden"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="mobile-nav"
            className="absolute left-0 right-0 top-full z-50 border-b border-[var(--color-card-border)] bg-[var(--color-card)] px-4 py-4 shadow-lg md:hidden"
            aria-label="Mobile"
          >
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <LocaleLink
                    href={link.href}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-[var(--color-foreground)] hover:bg-[color-mix(in_oklch,var(--color-accent)_10%,transparent)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-card-border)] pt-4">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
