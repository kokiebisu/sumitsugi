import { describe, it, expect, beforeEach } from 'vitest';
import {
  createChecklist,
  getChecklist,
  updateChecklistItem,
  getChecklistSummary,
  getAgreedFurnitureIds,
  confirmChecklist,
  resetChecklistState,
} from '../furniture-checklist';
import type { FurnitureItem } from '../data';

describe('furniture checklist', () => {
  beforeEach(() => {
    resetChecklistState();
  });

  const sampleFurniture: FurnitureItem[] = [
    { type: 'bed', photos: ['/bed.jpg'], condition: 'excellent' },
    { type: 'sofa', photos: ['/sofa.jpg'], condition: 'good' },
    { type: 'desk', photos: [], condition: 'fair', notes: '少し傷あり' },
  ];

  describe('createChecklist', () => {
    it('creates a checklist from furniture items for a listing', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      expect(checklist.id).toBeTruthy();
      expect(checklist.listingId).toBe('listing-1');
      expect(checklist.threadId).toBe('thread-1');
      expect(checklist.status).toBe('draft');
      expect(checklist.items).toHaveLength(3);
    });

    it('initializes all items with undecided disposition', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      for (const item of checklist.items) {
        expect(item.disposition).toBe('undecided');
      }
    });

    it('preserves furniture type, photos, and condition in checklist items', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      expect(checklist.items[0].furnitureType).toBe('bed');
      expect(checklist.items[0].photos).toEqual(['/bed.jpg']);
      expect(checklist.items[0].condition).toBe('excellent');
      expect(checklist.items[2].notes).toBe('少し傷あり');
    });

    it('returns existing checklist if same listing+thread combo exists', () => {
      const c1 = createChecklist('listing-1', 'thread-1', sampleFurniture);
      const c2 = createChecklist('listing-1', 'thread-1', sampleFurniture);
      expect(c1.id).toBe(c2.id);
    });
  });

  describe('getChecklist', () => {
    it('retrieves a checklist by id', () => {
      const created = createChecklist('listing-1', 'thread-1', sampleFurniture);
      const fetched = getChecklist(created.id);
      expect(fetched).toBeDefined();
      expect(fetched!.id).toBe(created.id);
    });

    it('returns undefined for nonexistent checklist', () => {
      expect(getChecklist('nonexistent')).toBeUndefined();
    });
  });

  describe('updateChecklistItem', () => {
    it('updates item disposition to keep', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      const itemId = checklist.items[0].id;
      const updated = updateChecklistItem(checklist.id, itemId, 'keep');
      const item = updated.items.find((i) => i.id === itemId);
      expect(item!.disposition).toBe('keep');
    });

    it('updates item disposition to take_away', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      const itemId = checklist.items[1].id;
      const updated = updateChecklistItem(checklist.id, itemId, 'take_away');
      const item = updated.items.find((i) => i.id === itemId);
      expect(item!.disposition).toBe('take_away');
    });

    it('throws for nonexistent checklist', () => {
      expect(() => updateChecklistItem('bad-id', 'item-1', 'keep')).toThrow(
        'チェックリストが見つかりません'
      );
    });

    it('throws for nonexistent item', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      expect(() =>
        updateChecklistItem(checklist.id, 'bad-item', 'keep')
      ).toThrow('チェックリストアイテムが見つかりません');
    });

    it('does not mutate the original checklist', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      const itemId = checklist.items[0].id;
      const updated = updateChecklistItem(checklist.id, itemId, 'keep');
      expect(updated).not.toBe(checklist);
      expect(updated.items).not.toBe(checklist.items);
    });

    it('rejects updates on confirmed checklists', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      const itemId = checklist.items[0].id;
      updateChecklistItem(checklist.id, itemId, 'keep');
      updateChecklistItem(checklist.id, checklist.items[1].id, 'take_away');
      updateChecklistItem(checklist.id, checklist.items[2].id, 'keep');
      confirmChecklist(checklist.id);

      expect(() =>
        updateChecklistItem(checklist.id, itemId, 'take_away')
      ).toThrow('確定済みのチェックリストは変更できません');
    });
  });

  describe('getChecklistSummary', () => {
    it('returns correct counts for each disposition', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      updateChecklistItem(checklist.id, checklist.items[0].id, 'keep');
      updateChecklistItem(checklist.id, checklist.items[1].id, 'take_away');

      const summary = getChecklistSummary(checklist.id);
      expect(summary.keep).toBe(1);
      expect(summary.takeAway).toBe(1);
      expect(summary.undecided).toBe(1);
      expect(summary.total).toBe(3);
    });

    it('throws for nonexistent checklist', () => {
      expect(() => getChecklistSummary('bad-id')).toThrow(
        'チェックリストが見つかりません'
      );
    });
  });

  describe('getAgreedFurnitureIds', () => {
    it('returns furniture types marked as keep', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      updateChecklistItem(checklist.id, checklist.items[0].id, 'keep');
      updateChecklistItem(checklist.id, checklist.items[1].id, 'take_away');
      updateChecklistItem(checklist.id, checklist.items[2].id, 'keep');

      const agreed = getAgreedFurnitureIds(checklist.id);
      expect(agreed).toEqual(['bed', 'desk']);
    });
  });

  describe('confirmChecklist', () => {
    it('confirms a checklist when all items are decided', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      updateChecklistItem(checklist.id, checklist.items[0].id, 'keep');
      updateChecklistItem(checklist.id, checklist.items[1].id, 'take_away');
      updateChecklistItem(checklist.id, checklist.items[2].id, 'keep');

      const confirmed = confirmChecklist(checklist.id);
      expect(confirmed.status).toBe('confirmed');
      expect(confirmed.confirmedAt).toBeTruthy();
    });

    it('rejects confirmation when items are still undecided', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      updateChecklistItem(checklist.id, checklist.items[0].id, 'keep');

      expect(() => confirmChecklist(checklist.id)).toThrow(
        '未決定のアイテムがあります'
      );
    });

    it('rejects confirming an already confirmed checklist', () => {
      const checklist = createChecklist(
        'listing-1',
        'thread-1',
        sampleFurniture
      );
      updateChecklistItem(checklist.id, checklist.items[0].id, 'keep');
      updateChecklistItem(checklist.id, checklist.items[1].id, 'keep');
      updateChecklistItem(checklist.id, checklist.items[2].id, 'take_away');
      confirmChecklist(checklist.id);

      expect(() => confirmChecklist(checklist.id)).toThrow(
        'このチェックリストは既に確定済みです'
      );
    });
  });
});
