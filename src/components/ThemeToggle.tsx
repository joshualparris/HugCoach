"use client";

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:text-foreground"
      aria-label="Toggle dark mode"
    >
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
