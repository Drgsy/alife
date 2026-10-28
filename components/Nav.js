'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TABS } from '../lib/tabs';

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="tabs" aria-label="Systemy">
      {TABS.map((t) => (
        <Link key={t.slug} href={`/${t.slug}`} aria-current={pathname === `/${t.slug}` ? 'page' : undefined}>
          {t.title}
        </Link>
      ))}
    </nav>
  );
}
