'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  ShoppingCart,
  Wrench,
  GraduationCap,
  Handshake,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Commandes', href: '/admin/commandes', icon: ShoppingCart },
  { name: 'Produits', href: '/admin/produits', icon: Package },
  { name: 'Demandes commerciales', href: '/admin/demandes-commerciales', icon: MessageSquare },
  { name: 'Demandes techniques', href: '/admin/demandes-techniques', icon: Wrench },
  { name: 'Partenariats', href: '/admin/partenariats', icon: Handshake },
  { name: 'Parametres', href: '/admin/parametres', icon: Settings },
];

const adminOnlyNavigation = [
  { name: 'Utilisateurs', href: '/admin/utilisateurs', icon: Users },
];

function roleBadgeVariant(role: string): 'default' | 'success' | 'info' {
  switch (role) {
    case 'ADMIN':
      return 'success';
    case 'COMMERCIAL':
      return 'info';
    default:
      return 'default';
  }
}

function roleLabel(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'COMMERCIAL':
      return 'Commercial';
    case 'CONSEILLER':
      return 'Conseiller';
    default:
      return role;
  }
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allNavItems = user?.role === 'ADMIN'
    ? [...navigation, ...adminOnlyNavigation]
    : navigation;

  return (
    <div className="fixed inset-0 z-50 bg-white flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <Link href="/admin/dashboard" className="text-lg font-bold text-white">
            Sen Biopest
          </Link>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {allNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-gray-800 p-4">
          <p className="text-xs text-gray-500">Sen Biopest Admin</p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className="text-sm text-gray-700 font-medium">{user.firstName} {user.lastName}</span>
                <Badge variant={roleBadgeVariant(user.role)}>
                  {roleLabel(user.role)}
                </Badge>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Deconnexion</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50">
        {children}
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}
