'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  /** Current rating value (0-5, supports half stars for display) */
  value: number;
  /** Called when a star is clicked (omit for read-only mode) */
  onChange?: (value: number) => void;
  /** Size of each star in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Show the numeric value next to stars */
  showValue?: boolean;
  /** Number of reviews to display (e.g., "(3件)") */
  reviewCount?: number;
}

export function StarRating({
  value,
  onChange,
  size = 20,
  className,
  showValue = false,
  reviewCount,
}: StarRatingProps) {
  const isInteractive = !!onChange;
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {stars.map((star) => {
        const isFull = value >= star;
        const isHalf = !isFull && value >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => onChange?.(star)}
            className={cn(
              'relative p-0 border-0 bg-transparent',
              isInteractive
                ? 'cursor-pointer hover:scale-110 transition-transform'
                : 'cursor-default'
            )}
            aria-label={`${star}星`}
          >
            {/* Background (empty) star */}
            <Star
              size={size}
              className="text-muted-foreground/30"
              strokeWidth={1.5}
            />
            {/* Filled star overlay */}
            {(isFull || isHalf) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: isHalf ? '50%' : '100%' }}
              >
                <Star
                  size={size}
                  className="fill-amber-400 text-amber-400"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </button>
        );
      })}
      {showValue && value > 0 && (
        <span className="ml-1 text-sm font-medium text-foreground">
          {value.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className="ml-0.5 text-sm text-muted-foreground">
          ({reviewCount}件)
        </span>
      )}
    </div>
  );
}
