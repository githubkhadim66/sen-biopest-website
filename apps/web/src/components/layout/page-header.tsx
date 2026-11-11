import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  /** Trail after "Accueil"; the last item is the current page */
  breadcrumb: Crumb[];
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons or a search field shown under the text */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Header shared by every inside page: breadcrumb, title, one-paragraph intro, centred so the
 * page reads balanced on wide screens (a left-aligned block leaves the right half empty).
 * Deliberately compact so the page's real content (catalogue, form, list) starts
 * in the first screen instead of below a tall banner.
 */
export function PageHeader({ breadcrumb, title, description, actions, className }: PageHeaderProps) {
  return (
    <section className={cn('border-b border-gray-100 bg-gradient-to-b from-primary-50/70 to-white', className)}>
      <div className="container-wide pt-6 pb-8 sm:pt-8 sm:pb-10 text-center">
        <nav aria-label="Fil d'Ariane" className="mb-3">
          <ol className="flex flex-wrap items-center justify-center gap-1 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-primary-700 transition-colors">
                Accueil
              </Link>
            </li>
            {breadcrumb.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                {crumb.href && i < breadcrumb.length - 1 ? (
                  <Link href={crumb.href} className="hover:text-primary-700 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-700" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl leading-tight sm:text-[1.75rem] lg:text-[2rem] font-extrabold text-gray-900 tracking-tight">
            {title}
          </h1>
          {description && <p className="mt-3 text-base text-gray-600 leading-relaxed">{description}</p>}
          {actions && <div className="mt-5 flex flex-wrap justify-center gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
