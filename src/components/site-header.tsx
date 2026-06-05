import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-card-border)]/80 bg-[var(--color-background)]/85 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
          Spec<span className="text-[var(--color-accent)]">Side</span>View
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/compare" className="text-[var(--color-muted)] hover:text-[var(--color-accent)]">
            Compare
          </Link>
          <Link href="/about" className="text-[var(--color-muted)] hover:text-[var(--color-accent)]">
            About
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
