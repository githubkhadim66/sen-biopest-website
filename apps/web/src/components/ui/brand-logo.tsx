import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Emblem only (circle + leaf + face), transparent background: fine on light and dark backgrounds. */
export function BrandEmblem({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/emblem.png"
      alt=""
      width={size}
      height={Math.round(size * 1.024)}
      priority
      className={cn('shrink-0', className)}
    />
  );
}

/**
 * Emblem + "Sen Biopest" in the rounded display font. The name is live text so it can be
 * white on dark backgrounds, where the green lettering of the image logo would lack contrast.
 */
export function BrandLogo({
  tone = 'light',
  size = 40,
  className,
}: {
  /** light = on a light background (green name), dark = on a dark background (white name) */
  tone?: 'light' | 'dark';
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandEmblem size={size} />
      <span
        className={cn(
          'font-display font-extrabold tracking-tight text-xl whitespace-nowrap transition-colors',
          tone === 'dark' ? 'text-white' : 'text-primary-600',
        )}
      >
        Sen Biopest
      </span>
    </span>
  );
}
