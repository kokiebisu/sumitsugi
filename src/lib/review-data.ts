import type { Viewing, Review, ReviewWithReviewer } from './review-types';
import { calculateRatingAggregate } from './review-types';

// Mock viewings
export const viewings: Viewing[] = [
  {
    id: 'viewing-1',
    propertyId: '1368794573069214647',
    hostId: 'user-takuma',
    visitorId: 'user-sato',
    scheduledAt: '2026-01-20T14:00:00Z',
    status: 'completed',
    hostConfirmedAt: '2026-01-20T15:30:00Z',
    visitorConfirmedAt: '2026-01-20T15:45:00Z',
    completedAt: '2026-01-20T15:45:00Z',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-20T15:45:00Z',
  },
  {
    id: 'viewing-2',
    propertyId: '1368794573069214647',
    hostId: 'user-takuma',
    visitorId: 'user-tanaka',
    scheduledAt: '2026-01-25T11:00:00Z',
    status: 'completed',
    hostConfirmedAt: '2026-01-25T12:30:00Z',
    visitorConfirmedAt: '2026-01-25T12:40:00Z',
    completedAt: '2026-01-25T12:40:00Z',
    createdAt: '2026-01-22T09:00:00Z',
    updatedAt: '2026-01-25T12:40:00Z',
  },
  {
    id: 'viewing-3',
    propertyId: '2',
    hostId: 'user-kenta',
    visitorId: 'user-suzuki',
    scheduledAt: '2026-02-05T10:00:00Z',
    status: 'scheduled',
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-01T08:00:00Z',
  },
];

// Mock reviews (mutual: both host and visitor reviewed each other)
export const reviews: Review[] = [
  // Viewing 1: both reviewed
  {
    id: 'review-1a',
    viewingId: 'viewing-1',
    propertyId: '1368794573069214647',
    reviewerId: 'user-takuma',
    revieweeId: 'user-sato',
    type: 'host_to_visitor',
    rating: 5,
    comment:
      '丁寧に部屋を見てくれました。質問も適切で、安心して引き継げそうです。',
    isVisible: true,
    createdAt: '2026-01-21T10:00:00Z',
    updatedAt: '2026-01-21T12:00:00Z',
  },
  {
    id: 'review-1b',
    viewingId: 'viewing-1',
    propertyId: '1368794573069214647',
    reviewerId: 'user-sato',
    revieweeId: 'user-takuma',
    type: 'visitor_to_host',
    rating: 5,
    comment:
      '植物の手入れのコツまで丁寧に教えていただきました。素敵なお部屋です。',
    isVisible: true,
    createdAt: '2026-01-21T11:00:00Z',
    updatedAt: '2026-01-21T12:00:00Z',
  },
  // Viewing 2: both reviewed
  {
    id: 'review-2a',
    viewingId: 'viewing-2',
    propertyId: '1368794573069214647',
    reviewerId: 'user-takuma',
    revieweeId: 'user-tanaka',
    type: 'host_to_visitor',
    rating: 4,
    comment: '時間通りに来てくれて、礼儀正しい方でした。',
    isVisible: true,
    createdAt: '2026-01-26T09:00:00Z',
    updatedAt: '2026-01-26T11:00:00Z',
  },
  {
    id: 'review-2b',
    viewingId: 'viewing-2',
    propertyId: '1368794573069214647',
    reviewerId: 'user-tanaka',
    revieweeId: 'user-takuma',
    type: 'visitor_to_host',
    rating: 4,
    comment: '家具の状態も良く、引き継ぎ費用に見合う内容だと思いました。',
    isVisible: true,
    createdAt: '2026-01-26T10:00:00Z',
    updatedAt: '2026-01-26T11:00:00Z',
  },
];

/** Get reviews for a specific property (visible only) */
export function getPropertyReviews(propertyId: string): ReviewWithReviewer[] {
  const reviewerNames: Record<string, { name: string; avatar?: string }> = {
    'user-sato': { name: '内見者' },
    'user-tanaka': { name: '内見者' },
    'user-takuma': { name: '前の住人' },
    'user-kenta': { name: '前の住人' },
    'user-suzuki': { name: '内見者' },
  };

  return reviews
    .filter(
      (r) =>
        r.propertyId === propertyId &&
        r.isVisible &&
        r.type === 'visitor_to_host'
    )
    .map((r) => ({
      ...r,
      reviewerName: reviewerNames[r.reviewerId]?.name ?? '内見者',
      reviewerAvatar: reviewerNames[r.reviewerId]?.avatar,
    }));
}

/** Get rating aggregate for a property */
export function getPropertyRating(propertyId: string) {
  const propertyReviews = reviews.filter(
    (r) =>
      r.propertyId === propertyId && r.isVisible && r.type === 'visitor_to_host'
  );
  return calculateRatingAggregate(propertyReviews);
}

/** Get reviews received by a user */
export function getUserReviews(userId: string): ReviewWithReviewer[] {
  const reviewerNames: Record<string, { name: string; avatar?: string }> = {
    'user-sato': { name: '内見者' },
    'user-tanaka': { name: '内見者' },
    'user-takuma': { name: '前の住人' },
    'user-kenta': { name: '前の住人' },
    'user-suzuki': { name: '内見者' },
  };

  return reviews
    .filter((r) => r.revieweeId === userId && r.isVisible)
    .map((r) => ({
      ...r,
      reviewerName: reviewerNames[r.reviewerId]?.name ?? '匿名',
      reviewerAvatar: reviewerNames[r.reviewerId]?.avatar,
    }));
}
