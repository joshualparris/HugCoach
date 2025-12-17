import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { getOrCreateUser, levelTitle } from '@/lib/gamification';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/topics', label: 'Topics' },
  { href: '/review', label: 'Review' },
  { href: '/rituals', label: 'Rituals' },
  { href: '/summary', label: 'Summary' },
  { href: '/store', label: 'Store' }
];

export default async function SiteHeader() {
  const user = await getOrCreateUser();
  const label = levelTitle(user.level);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-foreground">HugCoach</span>
          <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
            MVP
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <nav className="flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            Level {user.level} {label}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
