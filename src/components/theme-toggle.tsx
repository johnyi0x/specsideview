"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span className="inline-flex h-9 w-[7.5rem] rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)]" />
    );
  }

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const label =
    theme === "system"
      ? `System (${resolvedTheme ?? "…"})`
      : theme === "light"
        ? "Light"
        : "Dark";

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 text-xs font-medium tracking-wide text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      aria-label={`Theme: ${label}. Click to cycle light, dark, and system.`}
    >
      <span className="tabular-nums opacity-80">Theme</span>
      <span className="text-[var(--color-accent)]">{label}</span>
    </button>
  );
}
