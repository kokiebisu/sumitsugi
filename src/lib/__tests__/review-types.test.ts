import { describe, it, expect } from 'vitest';
import {
  calculateRatingAggregate,
  areBothReviewsSubmitted,
  isValidRating,
  type Review,
  type Viewing,
  type ViewingStatus,
  type ReviewType,
} from '../review-types';

function createReview(overrides: Partial<Review> = {}): Review {
  return {
    id: 'review-1',
    viewingId: 'viewing-1',
    propertyId: 'property-1',
    reviewerId: 'user-1',
    revieweeId: 'user-2',
    type: 'visitor_to_host',
    rating: 4,
    isVisible: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('review-types', () => {
  describe('ViewingStatus', () => {
    it('should support all viewing status values', () => {
      const statuses: ViewingStatus[] = [
        'scheduled',
        'host_confirmed',
        'visitor_confirmed',
        'completed',
        'cancelled',
      ];
      expect(statuses).toHaveLength(5);
    });
  });

  describe('ReviewType', () => {
    it('should support both review directions', () => {
      const types: ReviewType[] = ['host_to_visitor', 'visitor_to_host'];
      expect(types).toHaveLength(2);
    });
  });

  describe('Viewing interface', () => {
    it('should create a valid viewing object', () => {
      const viewing: Viewing = {
        id: 'viewing-1',
        propertyId: 'property-1',
        hostId: 'user-host',
        visitorId: 'user-visitor',
        scheduledAt: '2026-02-15T10:00:00Z',
        status: 'scheduled',
        createdAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
      };
      expect(viewing.status).toBe('scheduled');
      expect(viewing.hostConfirmedAt).toBeUndefined();
    });
  });

  describe('calculateRatingAggregate', () => {
    it('should return zero for empty reviews', () => {
      const result = calculateRatingAggregate([]);
      expect(result).toEqual({ averageRating: 0, reviewCount: 0 });
    });

    it('should calculate average from visible reviews only', () => {
      const reviews: Review[] = [
        createReview({ id: 'r1', rating: 5, isVisible: true }),
        createReview({ id: 'r2', rating: 3, isVisible: true }),
        createReview({ id: 'r3', rating: 1, isVisible: false }),
      ];
      const result = calculateRatingAggregate(reviews);
      expect(result.averageRating).toBe(4);
      expect(result.reviewCount).toBe(2);
    });

    it('should round to one decimal place', () => {
      const reviews: Review[] = [
        createReview({ id: 'r1', rating: 4, isVisible: true }),
        createReview({ id: 'r2', rating: 5, isVisible: true }),
        createReview({ id: 'r3', rating: 4, isVisible: true }),
      ];
      const result = calculateRatingAggregate(reviews);
      expect(result.averageRating).toBe(4.3);
      expect(result.reviewCount).toBe(3);
    });

    it('should return zero when all reviews are hidden', () => {
      const reviews: Review[] = [
        createReview({ id: 'r1', rating: 5, isVisible: false }),
        createReview({ id: 'r2', rating: 3, isVisible: false }),
      ];
      const result = calculateRatingAggregate(reviews);
      expect(result).toEqual({ averageRating: 0, reviewCount: 0 });
    });

    it('should handle single review', () => {
      const reviews: Review[] = [
        createReview({ id: 'r1', rating: 3, isVisible: true }),
      ];
      const result = calculateRatingAggregate(reviews);
      expect(result).toEqual({ averageRating: 3, reviewCount: 1 });
    });
  });

  describe('areBothReviewsSubmitted', () => {
    it('should return false when no reviews exist', () => {
      expect(areBothReviewsSubmitted([], 'viewing-1')).toBe(false);
    });

    it('should return false with only host review', () => {
      const reviews: Review[] = [
        createReview({ type: 'host_to_visitor', viewingId: 'viewing-1' }),
      ];
      expect(areBothReviewsSubmitted(reviews, 'viewing-1')).toBe(false);
    });

    it('should return false with only visitor review', () => {
      const reviews: Review[] = [
        createReview({ type: 'visitor_to_host', viewingId: 'viewing-1' }),
      ];
      expect(areBothReviewsSubmitted(reviews, 'viewing-1')).toBe(false);
    });

    it('should return true when both reviews exist', () => {
      const reviews: Review[] = [
        createReview({
          id: 'r1',
          type: 'host_to_visitor',
          viewingId: 'viewing-1',
        }),
        createReview({
          id: 'r2',
          type: 'visitor_to_host',
          viewingId: 'viewing-1',
        }),
      ];
      expect(areBothReviewsSubmitted(reviews, 'viewing-1')).toBe(true);
    });

    it('should only consider reviews for the specified viewing', () => {
      const reviews: Review[] = [
        createReview({
          id: 'r1',
          type: 'host_to_visitor',
          viewingId: 'viewing-1',
        }),
        createReview({
          id: 'r2',
          type: 'visitor_to_host',
          viewingId: 'viewing-2',
        }),
      ];
      expect(areBothReviewsSubmitted(reviews, 'viewing-1')).toBe(false);
    });
  });

  describe('isValidRating', () => {
    it('should accept valid ratings 1-5', () => {
      expect(isValidRating(1)).toBe(true);
      expect(isValidRating(2)).toBe(true);
      expect(isValidRating(3)).toBe(true);
      expect(isValidRating(4)).toBe(true);
      expect(isValidRating(5)).toBe(true);
    });

    it('should reject zero', () => {
      expect(isValidRating(0)).toBe(false);
    });

    it('should reject negative numbers', () => {
      expect(isValidRating(-1)).toBe(false);
    });

    it('should reject numbers above 5', () => {
      expect(isValidRating(6)).toBe(false);
    });

    it('should reject decimal numbers', () => {
      expect(isValidRating(3.5)).toBe(false);
      expect(isValidRating(4.2)).toBe(false);
    });
  });
});
