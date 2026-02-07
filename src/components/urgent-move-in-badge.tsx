import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UrgentMoveInBadgeProps {
  className?: string;
  variant?: 'overlay' | 'inline';
}

export function UrgentMoveInBadge({
  className,
  variant = 'overlay',
}: UrgentMoveInBadgeProps) {
  if (variant === 'overlay') {
    return (
      <div
        className={cn(
          'absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-coral px-2.5 py-1 text-xs font-semibold text-white shadow-md',
          className
        )}
      >
        <Zap className="h-3 w-3" />
        即入居可能
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-coral',
        className
      )}
    >
      <Zap className="h-3 w-3" />
      即入居可能
    </span>
  );
}
