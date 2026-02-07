import { describe, it, expect, beforeEach } from 'vitest';
import {
  createViewing,
  getViewing,
  getViewingsByListing,
  scheduleViewing,
  completeViewing,
  submitBuyerChecklist,
  approveChecklist,
  getViewingStatus,
  resetViewingState,
} from '../viewing-flow';
import { resetMessagingState } from '../messaging';
import { resetChecklistState } from '../furniture-checklist';
import type { FurnitureItem } from '../data';

describe('viewing flow', () => {
  beforeEach(() => {
    resetViewingState();
    resetMessagingState();
    resetChecklistState();
  });

  const sampleFurniture: FurnitureItem[] = [
    { type: 'bed', photos: ['/bed.jpg'], condition: 'excellent' },
    { type: 'sofa', photos: ['/sofa.jpg'], condition: 'good' },
  ];

  describe('createViewing', () => {
    it('creates a viewing request for a listing', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      expect(viewing.id).toBeTruthy();
      expect(viewing.listingId).toBe('listing-1');
      expect(viewing.sellerId).toBe('seller-1');
      expect(viewing.buyerId).toBe('buyer-1');
      expect(viewing.status).toBe('requested');
      expect(viewing.threadId).toBeTruthy();
      expect(viewing.checklistId).toBeTruthy();
    });

    it('creates messaging thread and checklist automatically', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      expect(viewing.threadId).toBeTruthy();
      expect(viewing.checklistId).toBeTruthy();
    });

    it('returns existing viewing for same listing+buyer combo', () => {
      const v1 = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      const v2 = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      expect(v1.id).toBe(v2.id);
    });
  });

  describe('getViewing', () => {
    it('retrieves a viewing by id', () => {
      const created = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      const fetched = getViewing(created.id);
      expect(fetched).toBeDefined();
      expect(fetched!.id).toBe(created.id);
    });

    it('returns undefined for nonexistent viewing', () => {
      expect(getViewing('nonexistent')).toBeUndefined();
    });
  });

  describe('getViewingsByListing', () => {
    it('returns all viewings for a listing', () => {
      createViewing('listing-1', 'seller-1', 'buyer-1', sampleFurniture);
      createViewing('listing-1', 'seller-1', 'buyer-2', sampleFurniture);
      createViewing('listing-2', 'seller-2', 'buyer-3', sampleFurniture);

      const viewings = getViewingsByListing('listing-1');
      expect(viewings).toHaveLength(2);
    });
  });

  describe('scheduleViewing', () => {
    it('updates viewing status to scheduled with date', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      const scheduled = scheduleViewing(viewing.id, '2026-02-20T14:00:00');
      expect(scheduled.status).toBe('scheduled');
      expect(scheduled.scheduledDate).toBe('2026-02-20T14:00:00');
    });

    it('throws for nonexistent viewing', () => {
      expect(() => scheduleViewing('bad-id', '2026-02-20T14:00:00')).toThrow(
        '内見が見つかりません'
      );
    });
  });

  describe('completeViewing', () => {
    it('marks viewing as completed', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      scheduleViewing(viewing.id, '2026-02-20T14:00:00');
      const completed = completeViewing(viewing.id);
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeTruthy();
    });

    it('throws if viewing is not scheduled', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      expect(() => completeViewing(viewing.id)).toThrow(
        '内見がスケジュール済みではありません'
      );
    });
  });

  describe('submitBuyerChecklist', () => {
    it('marks viewing as checklist_submitted', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      scheduleViewing(viewing.id, '2026-02-20T14:00:00');
      completeViewing(viewing.id);

      const submitted = submitBuyerChecklist(viewing.id);
      expect(submitted.status).toBe('checklist_submitted');
    });

    it('throws if viewing is not completed', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      expect(() => submitBuyerChecklist(viewing.id)).toThrow(
        '内見が完了していません'
      );
    });
  });

  describe('approveChecklist', () => {
    it('marks viewing as agreed and returns agreed furniture ids', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      scheduleViewing(viewing.id, '2026-02-20T14:00:00');
      completeViewing(viewing.id);
      submitBuyerChecklist(viewing.id);

      const approved = approveChecklist(viewing.id);
      expect(approved.status).toBe('agreed');
      expect(approved.agreedAt).toBeTruthy();
    });

    it('throws if checklist not submitted', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      scheduleViewing(viewing.id, '2026-02-20T14:00:00');
      completeViewing(viewing.id);

      expect(() => approveChecklist(viewing.id)).toThrow(
        'チェックリストが提出されていません'
      );
    });
  });

  describe('getViewingStatus', () => {
    it('returns human-readable status info', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );
      const status = getViewingStatus(viewing.id);
      expect(status.label).toBe('リクエスト中');
      expect(status.step).toBe(1);
      expect(status.totalSteps).toBe(5);
    });

    it('progresses through steps correctly', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        sampleFurniture
      );

      scheduleViewing(viewing.id, '2026-02-20T14:00:00');
      expect(getViewingStatus(viewing.id).step).toBe(2);

      completeViewing(viewing.id);
      expect(getViewingStatus(viewing.id).step).toBe(3);

      submitBuyerChecklist(viewing.id);
      expect(getViewingStatus(viewing.id).step).toBe(4);

      approveChecklist(viewing.id);
      expect(getViewingStatus(viewing.id).step).toBe(5);
    });
  });
});
