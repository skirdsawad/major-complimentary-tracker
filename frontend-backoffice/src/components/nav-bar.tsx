'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/giveaway-items', label: 'Giveaway Items' },
  { href: '/cinema-branches', label: 'Cinema Branches' },
  { href: '/stock-management', label: 'Stock Management' },
];

export function NavBar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto flex h-14 items-center px-4 gap-6">
        <Link href="/" className="font-semibold text-primary">
          Backoffice
        </Link>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm transition-colors',
              isActive(item.href)
                ? 'text-foreground underline decoration-yellow-400 decoration-2 underline-offset-4'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
