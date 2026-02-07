import { describe, it, expect, beforeEach } from 'vitest';
import {
  createAgreementFromViewing,
  getAgreement,
  getAgreementByViewing,
  acceptAgreement,
  signAgreement,
  resetAgreementState,
} from '../handover-agreement';
import {
  createViewing,
  scheduleViewing,
  completeViewing,
  submitBuyerChecklist,
  approveChecklist,
  resetViewingState,
} from '../viewing-flow';
import {
  updateChecklistItem,
  confirmChecklist,
  getChecklist,
  resetChecklistState,
} from '../furniture-checklist';
import { resetMessagingState } from '../messaging';
import type { FurnitureItem } from '../data';

const FURNITURE_ITEMS: FurnitureItem[] = [
  {
    type: 'bed',
    photos: ['/bed.jpg'],
    condition: 'excellent',
    notes: 'シングルベッド',
  },
  { type: 'desk', photos: ['/desk.jpg'], condition: 'good' },
  { type: 'sofa', photos: ['/sofa.jpg'], condition: 'fair', notes: '3人掛け' },
];

function createAgreedViewing() {
  const viewing = createViewing(
    'listing-1',
    'seller-1',
    'buyer-1',
    FURNITURE_ITEMS
  );
  scheduleViewing(viewing.id, '2026-02-15T10:00:00');
  completeViewing(viewing.id);

  // Buyer decides: keep bed, take_away desk, keep sofa
  const checklist = getChecklist(viewing.checklistId)!;
  updateChecklistItem(checklist.id, checklist.items[0].id, 'keep');
  updateChecklistItem(checklist.id, checklist.items[1].id, 'take_away');
  updateChecklistItem(checklist.id, checklist.items[2].id, 'keep');
  confirmChecklist(checklist.id);

  submitBuyerChecklist(viewing.id);
  approveChecklist(viewing.id);
  return viewing;
}

describe('handover-agreement', () => {
  beforeEach(() => {
    resetAgreementState();
    resetViewingState();
    resetChecklistState();
    resetMessagingState();
  });

  describe('createAgreementFromViewing', () => {
    it('creates an agreement from an agreed viewing', () => {
      const viewing = createAgreedViewing();
      const agreement = createAgreementFromViewing(viewing.id, {
        sellerName: '田中太郎',
        sellerEmail: 'tanaka@example.com',
        buyerName: '山田花子',
        buyerEmail: 'yamada@example.com',
        propertyTitle: '世田谷の家具付き物件',
        propertyAddress: '世田谷区1-2-3',
        handoverFee: 50000,
      });

      expect(agreement.id).toBeTruthy();
      expect(agreement.viewingId).toBe(viewing.id);
      expect(agreement.status).toBe('draft');
      expect(agreement.sellerName).toBe('田中太郎');
      expect(agreement.buyerName).toBe('山田花子');
      expect(agreement.handoverFee).toBe(50000);
      expect(agreement.items).toHaveLength(2); // only 'keep' items (bed, sofa)
      expect(agreement.items.map((i) => i.furnitureType)).toEqual([
        'bed',
        'sofa',
      ]);
    });

    it('rejects creating agreement for non-agreed viewing', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        FURNITURE_ITEMS
      );
      expect(() =>
        createAgreementFromViewing(viewing.id, {
          sellerName: '田中',
          sellerEmail: 'a@b.com',
          buyerName: '山田',
          buyerEmail: 'c@d.com',
          propertyTitle: 'テスト',
          handoverFee: 10000,
        })
      ).toThrow('合意済みの内見のみ');
    });

    it('returns existing agreement if already created for viewing', () => {
      const viewing = createAgreedViewing();
      const params = {
        sellerName: '田中',
        sellerEmail: 'a@b.com',
        buyerName: '山田',
        buyerEmail: 'c@d.com',
        propertyTitle: 'テスト',
        handoverFee: 10000,
      };
      const a1 = createAgreementFromViewing(viewing.id, params);
      const a2 = createAgreementFromViewing(viewing.id, params);
      expect(a1.id).toBe(a2.id);
    });
  });

  describe('getAgreement', () => {
    it('returns agreement by ID', () => {
      const viewing = createAgreedViewing();
      const agreement = createAgreementFromViewing(viewing.id, {
        sellerName: '田中',
        sellerEmail: 'a@b.com',
        buyerName: '山田',
        buyerEmail: 'c@d.com',
        propertyTitle: 'テスト',
        handoverFee: 10000,
      });

      expect(getAgreement(agreement.id)).toBeDefined();
      expect(getAgreement(agreement.id)!.id).toBe(agreement.id);
    });

    it('returns undefined for unknown ID', () => {
      expect(getAgreement('nonexistent')).toBeUndefined();
    });
  });

  describe('getAgreementByViewing', () => {
    it('returns agreement for a viewing', () => {
      const viewing = createAgreedViewing();
      const agreement = createAgreementFromViewing(viewing.id, {
        sellerName: '田中',
        sellerEmail: 'a@b.com',
        buyerName: '山田',
        buyerEmail: 'c@d.com',
        propertyTitle: 'テスト',
        handoverFee: 10000,
      });

      expect(getAgreementByViewing(viewing.id)).toBeDefined();
      expect(getAgreementByViewing(viewing.id)!.id).toBe(agreement.id);
    });
  });

  describe('acceptAgreement', () => {
    it('transitions from draft to pending_acceptance', () => {
      const viewing = createAgreedViewing();
      const agreement = createAgreementFromViewing(viewing.id, {
        sellerName: '田中',
        sellerEmail: 'a@b.com',
        buyerName: '山田',
        buyerEmail: 'c@d.com',
        propertyTitle: 'テスト',
        handoverFee: 10000,
      });

      const accepted = acceptAgreement(agreement.id);
      expect(accepted.status).toBe('pending_acceptance');
      expect(accepted.acceptedAt).toBeTruthy();
    });

    it('rejects accepting non-draft agreement', () => {
      const viewing = createAgreedViewing();
      const agreement = createAgreementFromViewing(viewing.id, {
        sellerName: '田中',
        sellerEmail: 'a@b.com',
        buyerName: '山田',
        buyerEmail: 'c@d.com',
        propertyTitle: 'テスト',
        handoverFee: 10000,
      });
      acceptAgreement(agreement.id);
      expect(() => acceptAgreement(agreement.id)).toThrow(
        'ドラフト状態の合意のみ'
      );
    });
  });

  describe('signAgreement', () => {
    it('transitions from pending_acceptance to signed', () => {
      const viewing = createAgreedViewing();
      const agreement = createAgreementFromViewing(viewing.id, {
        sellerName: '田中',
        sellerEmail: 'a@b.com',
        buyerName: '山田',
        buyerEmail: 'c@d.com',
        propertyTitle: 'テスト',
        handoverFee: 10000,
      });
      acceptAgreement(agreement.id);

      const signed = signAgreement(agreement.id, {
        name: '山田花子',
        ipAddress: '192.168.1.1',
      });

      expect(signed.status).toBe('signed');
      expect(signed.signedAt).toBeTruthy();
      expect(signed.buyerSignature).toBeDefined();
      expect(signed.buyerSignature!.name).toBe('山田花子');
      expect(signed.buyerSignature!.ipAddress).toBe('192.168.1.1');
    });

    it('rejects signing non-accepted agreement', () => {
      const viewing = createAgreedViewing();
      const agreement = createAgreementFromViewing(viewing.id, {
        sellerName: '田中',
        sellerEmail: 'a@b.com',
        buyerName: '山田',
        buyerEmail: 'c@d.com',
        propertyTitle: 'テスト',
        handoverFee: 10000,
      });

      expect(() => signAgreement(agreement.id, { name: '山田花子' })).toThrow(
        '受諾済みの合意のみ'
      );
    });

    it('rejects signing already signed agreement', () => {
      const viewing = createAgreedViewing();
      const agreement = createAgreementFromViewing(viewing.id, {
        sellerName: '田中',
        sellerEmail: 'a@b.com',
        buyerName: '山田',
        buyerEmail: 'c@d.com',
        propertyTitle: 'テスト',
        handoverFee: 10000,
      });
      acceptAgreement(agreement.id);
      signAgreement(agreement.id, { name: '山田花子' });

      expect(() => signAgreement(agreement.id, { name: '山田花子' })).toThrow(
        '受諾済みの合意のみ'
      );
    });
  });

  describe('agreement items from checklist', () => {
    it('includes only keep items with correct metadata', () => {
      const viewing = createAgreedViewing();
      const agreement = createAgreementFromViewing(viewing.id, {
        sellerName: '田中',
        sellerEmail: 'a@b.com',
        buyerName: '山田',
        buyerEmail: 'c@d.com',
        propertyTitle: 'テスト',
        handoverFee: 30000,
      });

      // bed (keep, excellent, シングルベッド) and sofa (keep, fair, 3人掛け)
      expect(agreement.items).toHaveLength(2);

      const bed = agreement.items.find((i) => i.furnitureType === 'bed')!;
      expect(bed.condition).toBe('excellent');
      expect(bed.notes).toBe('シングルベッド');
      expect(bed.photos).toEqual(['/bed.jpg']);

      const sofa = agreement.items.find((i) => i.furnitureType === 'sofa')!;
      expect(sofa.condition).toBe('fair');
      expect(sofa.notes).toBe('3人掛け');
    });
  });
});
