'use client';

import { StarRating } from '@/components/ui/star-rating';
import type { ReviewWithReviewer, RatingAggregate } from '@/lib/review-types';

interface ReviewListProps {
  reviews: ReviewWithReviewer[];
  aggregate: RatingAggregate;
}

export function ReviewList({ reviews, aggregate }: ReviewListProps) {
  if (reviews.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-foreground">レビュー</h2>
        <StarRating
          value={aggregate.averageRating}
          size={18}
          showValue
          reviewCount={aggregate.reviewCount}
        />
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-border pb-6 last:border-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {review.reviewerName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {review.reviewerName}
                </span>
              </div>
              <time className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                })}
              </time>
            </div>
            <div className="mb-2">
              <StarRating value={review.rating} size={14} />
            </div>
            {review.comment && (
              <p className="text-sm text-foreground leading-relaxed">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
