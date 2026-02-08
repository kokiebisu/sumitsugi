// Review/Rating system types for tsumugi
// Based on mutual review system: both host and visitor review each other after viewing

/** Review type - who wrote the review */
export type ReviewType = 'host_to_visitor' | 'visitor_to_host';

/** Viewing status lifecycle */
export type ViewingStatus =
  | 'scheduled'
  | 'host_confirmed'
  | 'visitor_confirmed'
  | 'completed'
  | 'cancelled';

/** A viewing (内見) between host and visitor */
export interface Viewing {
  id: string;
  propertyId: string;
  hostId: string; // 前の住人 (seller)
  visitorId: string; // 次の住人候補 (buyer)
  scheduledAt: string; // ISO date
  status: ViewingStatus;
  hostConfirmedAt?: string;
  visitorConfirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** A review left after a viewing */
export interface Review {
  id: string;
  viewingId: string;
  propertyId: string;
  reviewerId: string; // who wrote the review
  revieweeId: string; // who is being reviewed
  type: ReviewType;
  rating: number; // 1-5
  comment?: string;
  isVisible: boolean; // becomes true when both parties submit
  createdAt: string;
  updatedAt: string;
}

/** Review with reviewer info for display */
export interface ReviewWithReviewer extends Review {
  reviewerName: string;
  reviewerAvatar?: string;
}

/** Aggregate rating for a property or user */
export interface RatingAggregate {
  averageRating: number;
  reviewCount: number;
}

/** Calculate average rating from reviews */
export function calculateRatingAggregate(reviews: Review[]): RatingAggregate {
  const visibleReviews = reviews.filter((r) => r.isVisible);
  if (visibleReviews.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }
  const sum = visibleReviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    averageRating: Math.round((sum / visibleReviews.length) * 10) / 10,
    reviewCount: visibleReviews.length,
  };
}

/** Check if both parties have submitted reviews for a viewing */
export function areBothReviewsSubmitted(
  reviews: Review[],
  viewingId: string
): boolean {
  const viewingReviews = reviews.filter((r) => r.viewingId === viewingId);
  const hasHostReview = viewingReviews.some(
    (r) => r.type === 'host_to_visitor'
  );
  const hasVisitorReview = viewingReviews.some(
    (r) => r.type === 'visitor_to_host'
  );
  return hasHostReview && hasVisitorReview;
}

/** Validate rating value (1-5 integer) */
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}
