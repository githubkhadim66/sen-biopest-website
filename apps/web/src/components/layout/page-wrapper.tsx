'use client';

import { usePathname } from 'next/navigation';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');

  // Home has its own full-height hero behind the transparent header
  // Admin has its own layout
  if (isHome || isAdmin) {
    return <>{children}</>;
  }

  return <div className="pt-16 lg:pt-20">{children}</div>;
}
