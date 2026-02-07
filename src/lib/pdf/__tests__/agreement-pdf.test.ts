import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildAgreementPdfProps, generateAgreementPdf } from '../agreement-pdf';
import {
  createAgreementFromViewing,
  acceptAgreement,
  signAgreement,
  resetAgreementState,
} from '../../handover-agreement';
import {
  createViewing,
  scheduleViewing,
  completeViewing,
  submitBuyerChecklist,
  approveChecklist,
  resetViewingState,
} from '../../viewing-flow';
import {
  updateChecklistItem,
  confirmChecklist,
  getChecklist,
  resetChecklistState,
} from '../../furniture-checklist';
import { resetMessagingState } from '../../messaging';
import type { FurnitureItem } from '../../data';

// Mock renderPdf to avoid actual PDF rendering in tests
vi.mock('../render', () => ({
  renderPdf: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
}));

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

function createSignedAgreement() {
  const viewing = createViewing(
    'listing-1',
    'seller-1',
    'buyer-1',
    FURNITURE_ITEMS
  );
  scheduleViewing(viewing.id, '2026-02-15T10:00:00');
  completeViewing(viewing.id);

  const checklist = getChecklist(viewing.checklistId)!;
  updateChecklistItem(checklist.id, checklist.items[0].id, 'keep'); // bed
  updateChecklistItem(checklist.id, checklist.items[1].id, 'take_away'); // desk
  updateChecklistItem(checklist.id, checklist.items[2].id, 'keep'); // sofa
  confirmChecklist(checklist.id);

  submitBuyerChecklist(viewing.id);
  approveChecklist(viewing.id);

  const agreement = createAgreementFromViewing(viewing.id, {
    sellerName: '田中太郎',
    sellerEmail: 'tanaka@example.com',
    buyerName: '山田花子',
    buyerEmail: 'yamada@example.com',
    propertyTitle: '世田谷の家具付き物件',
    propertyAddress: '世田谷区1-2-3',
    handoverFee: 50000,
  });
  acceptAgreement(agreement.id);
  signAgreement(agreement.id, { name: '山田花子', ipAddress: '192.168.1.1' });
  return agreement;
}

describe('agreement-pdf', () => {
  beforeEach(() => {
    resetAgreementState();
    resetViewingState();
    resetChecklistState();
    resetMessagingState();
    vi.clearAllMocks();
  });

  describe('buildAgreementPdfProps', () => {
    it('builds consent form props from a signed agreement', () => {
      const agreement = createSignedAgreement();
      const props = buildAgreementPdfProps(agreement.id);

      expect(props.propertyAddress).toBe('世田谷区1-2-3');
      expect(props.sellerName).toBe('田中太郎');
      expect(props.buyerName).toBe('山田花子');
      expect(props.furnitureItems).toHaveLength(2);
      expect(props.createdDate).toBeTruthy();
    });

    it('includes correct furniture item details', () => {
      const agreement = createSignedAgreement();
      const props = buildAgreementPdfProps(agreement.id);

      const bedItem = props.furnitureItems.find((i) => i.name === 'ベッド');
      expect(bedItem).toBeDefined();
      expect(bedItem!.condition).toBeTruthy(); // has a condition label

      const sofaItem = props.furnitureItems.find((i) => i.name === 'ソファ');
      expect(sofaItem).toBeDefined();
      expect(sofaItem!.remarks).toBe('3人掛け');
    });

    it('throws for non-existent agreement', () => {
      expect(() => buildAgreementPdfProps('nonexistent')).toThrow(
        '合意書が見つかりません'
      );
    });

    it('throws for non-signed agreement', () => {
      const viewing = createViewing(
        'listing-1',
        'seller-1',
        'buyer-1',
        FURNITURE_ITEMS
      );
      scheduleViewing(viewing.id, '2026-02-15T10:00:00');
      completeViewing(viewing.id);

      const checklist = getChecklist(viewing.checklistId)!;
      updateChecklistItem(checklist.id, checklist.items[0].id, 'keep');
      updateChecklistItem(checklist.id, checklist.items[1].id, 'take_away');
      updateChecklistItem(checklist.id, checklist.items[2].id, 'keep');
      confirmChecklist(checklist.id);

      submitBuyerChecklist(viewing.id);
      approveChecklist(viewing.id);

      const agreement = createAgreementFromViewing(viewing.id, {
        sellerName: '田中',
        sellerEmail: 'a@b.com',
        buyerName: '山田',
        buyerEmail: 'c@d.com',
        propertyTitle: 'テスト',
        handoverFee: 10000,
      });

      expect(() => buildAgreementPdfProps(agreement.id)).toThrow(
        '署名済みの合意書のみ'
      );
    });
  });

  describe('generateAgreementPdf', () => {
    it('returns a PDF buffer', async () => {
      const agreement = createSignedAgreement();
      const buffer = await generateAgreementPdf(agreement.id);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('calls renderPdf with ConsentForm component', async () => {
      const { renderPdf } = await import('../render');
      const agreement = createSignedAgreement();
      await generateAgreementPdf(agreement.id);

      expect(renderPdf).toHaveBeenCalledTimes(1);
    });
  });
});
