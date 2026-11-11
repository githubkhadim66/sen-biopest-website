import { cn } from '@/lib/utils';

/**
 * Product photo that fills its frame whatever its shape: the whole photo stays visible
 * (object-contain) and the empty sides are filled by a blurred, zoomed copy of the same
 * photo, so a portrait bottle shot no longer floats in a pale box.
 * The parent must be `relative` with a fixed height.
 */
export function ProductPhoto({
  src,
  alt,
  className,
  lazy = true,
  zoomOnHover = true,
}: {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  zoomOnHover?: boolean;
}) {
  return (
    <span className={cn('absolute inset-0 block overflow-hidden bg-gray-100', className)}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl opacity-70"
      />
      <img
        src={src}
        alt={alt}
        loading={lazy ? 'lazy' : undefined}
        className={cn(
          'relative h-full w-full object-contain drop-shadow-lg transition-transform duration-500',
          zoomOnHover && 'group-hover:scale-105',
        )}
      />
    </span>
  );
}
