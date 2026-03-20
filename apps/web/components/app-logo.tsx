import { Link } from 'react-router';

import { cn } from '@kit/ui/utils';

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string;
  className?: string;
  label?: string;
}) {
  return (
    <Link
      aria-label={label ?? 'Breeze Man Books'}
      to={href ?? '/'}
      prefetch={'viewport'}
      className={cn('flex items-center gap-2', className)}
    >
      <span className="font-heading text-xl font-black uppercase tracking-tighter lg:text-2xl">
        BREEZE MAN
      </span>
      <span className="text-xs font-bold uppercase tracking-widest opacity-60">
        BOOKS
      </span>
    </Link>
  );
}
