'use client';

import { StarRating } from '@/components/ui/star-rating';
import { getUserReviews } from '@/lib/review-data';
import { calculateRatingAggregate } from '@/lib/review-types';
import type { ReviewWithReviewer } from '@/lib/review-types';

interface ProfileReviewsProps {
  userId: string;
}

export function ProfileReviews({ userId }: ProfileReviewsProps) {
  const reviews = getUserReviews(userId);
  const aggregate = calculateRatingAggregate(reviews);

  if (reviews.length === 0) {
    return (
      <div className="mb-6 rounded-xl border border-border bg-background shadow-sm">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold text-foreground">受けたレビュー</h3>
        </div>
        <div className="p-6 text-center text-sm text-muted-foreground">
          まだレビューはありません
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-background shadow-sm">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">受けたレビュー</h3>
          <div className="flex items-center gap-2">
            <StarRating value={aggregate.averageRating} size={16} showValue />
            <span className="text-sm text-muted-foreground">
              ({aggregate.reviewCount}件)
            </span>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

function ReviewItem({ review }: { review: ReviewWithReviewer }) {
  const typeLabel =
    review.type === 'visitor_to_host' ? '内見者から' : '前の住人から';

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
            {review.reviewerName.charAt(0)}
          </div>
          <div>
            <span className="text-sm font-medium text-foreground">
              {review.reviewerName}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              {typeLabel}
            </span>
          </div>
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
  );
}
