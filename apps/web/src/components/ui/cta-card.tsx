import { cn } from '@/lib/utils';

/**
 * End-of-page call to action, shown as a rounded card inside the page width rather than a
 * full-bleed coloured band: same visibility, much less visual weight.
 */
export function CtaCard({
  title,
  description,
  children,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons */
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('pb-12 lg:pb-16', className)}>
      <div className="container-wide">
        <div className="rounded-2xl bg-primary-700 text-white px-6 py-8 sm:px-10 sm:py-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{title}</h2>
          {description && <p className="text-primary-100 max-w-xl mx-auto mb-6">{description}</p>}
          <div className="flex flex-wrap justify-center gap-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
