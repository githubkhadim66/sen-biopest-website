'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Leaf, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';

const navigation = [
  { label: 'Accueil', href: '/' },
  { label: 'Produits', href: '/produits' },
  { label: 'Services', href: '/services', children: [
    { label: 'Formations', href: '/formations' },
    { label: 'Accompagnement technique', href: '/accompagnement-technique' },
    { label: 'Partenariats', href: '/partenariats' },
  ]},
  { label: 'À propos', href: '/a-propos' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isHome = pathname === '/';
  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm',
      )}
    >
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Leaf className={cn(
              'w-7 h-7 transition-colors',
              isTransparent ? 'text-primary-400' : 'text-primary-600',
            )} />
            <span className={cn(
              'transition-colors',
              isTransparent ? 'text-white' : 'text-primary-700',
            )}>
              Sen Biopest
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.children && setDropdownOpen(item.label)}
                  onMouseLeave={() => setDropdownOpen(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isTransparent
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                      isActive && !isTransparent && 'text-primary-600',
                    )}
                  >
                    {item.label}
                    {item.children && <ChevronDown className="w-4 h-4" />}
                    {isActive && !isTransparent && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-600 rounded-full" />
                    )}
                  </Link>

                  {item.children && dropdownOpen === item.label && (
                    <div className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 mt-1 animate-in fade-in slide-in-from-top-2 duration-150">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/panier" className="relative p-2 rounded-lg transition-colors hover:bg-gray-100">
              <ShoppingCart className={cn(
                'w-5 h-5 transition-colors',
                isTransparent ? 'text-white' : 'text-gray-600',
              )} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <Link href="/produits">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  isTransparent && 'border-white/30 text-white hover:bg-white/10',
                )}
              >
                Nos produits
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="sm">Demander un devis</Button>
            </Link>
          </div>

          {/* Mobile cart + toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <Link href="/panier" className="relative p-2 rounded-lg transition-colors">
              <ShoppingCart className={cn(
                'w-5 h-5 transition-colors',
                isTransparent ? 'text-white' : 'text-gray-600',
              )} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <button
              className={cn(
                'p-2 rounded-lg transition-colors',
                isTransparent ? 'text-white' : 'text-gray-600',
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="py-4 space-y-1">
              {navigation.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    {item.label}
                  </Link>
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block pl-8 pr-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="pt-3 px-3 space-y-2">
                <Link href="/produits">
                  <Button variant="outline" className="w-full">Nos produits</Button>
                </Link>
                <Link href="/contact">
                  <Button className="w-full">Demander un devis</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
