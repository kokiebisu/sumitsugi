import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import type { ChecklistItem } from '../../furniture-checklist';
import {
  mapChecklistToConsentItems,
  buildConsentFormProps,
} from '../consent-generator';

// Mock @react-pdf/renderer to avoid actual PDF rendering
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) =>
    createElement('Document', null, children),
  Page: ({ children, ...props }: { children: React.ReactNode }) =>
    createElement('Page', props, children),
  View: ({ children, ...props }: { children: React.ReactNode }) =>
    createElement('View', props, children),
  Text: ({ children, ...props }: { children: React.ReactNode }) =>
    createElement('Text', props, children),
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T) => styles,
  },
  Font: { register: vi.fn() },
}));

// Mock renderPdf
vi.mock('../render', () => ({
  renderPdf: vi.fn().mockResolvedValue(Buffer.from('mock-pdf-buffer')),
}));

// Mock storage for R2 upload tests
vi.mock('../../storage', () => ({
  uploadImage: vi
    .fn()
    .mockResolvedValue('https://r2.example.com/uploads/test.pdf'),
  isStorageConfigured: vi.fn().mockReturnValue(true),
}));

const checklistItems: ChecklistItem[] = [
  {
    id: 'cl-1',
    furnitureType: 'bed',
    photos: ['/bed.jpg'],
    condition: 'excellent',
    notes: 'シングルベッド',
    disposition: 'keep',
  },
  {
    id: 'cl-2',
    furnitureType: 'sofa',
    photos: ['/sofa.jpg'],
    condition: 'good',
    disposition: 'keep',
  },
  {
    id: 'cl-3',
    furnitureType: 'desk',
    photos: ['/desk.jpg'],
    condition: 'fair',
    disposition: 'take_away',
  },
  {
    id: 'cl-4',
    furnitureType: 'fridge',
    photos: [],
    disposition: 'undecided',
  },
  {
    id: 'cl-5',
    furnitureType: 'storage',
    photos: [],
    condition: 'good',
    notes: '3段ラック',
    disposition: 'keep',
  },
];

describe('Consent form furniture list (agreedFurnitureIds)', () => {
  it('only includes items with disposition "keep"', () => {
    const items = mapChecklistToConsentItems(checklistItems);
    expect(items).toHaveLength(3);
    const names = items.map((i) => i.name);
    expect(names).toContain('ベッド');
    expect(names).toContain('ソファ');
    expect(names).toContain('収納');
    expect(names).not.toContain('デスク');
    expect(names).not.toContain('冷蔵庫');
  });

  it('classifies core vs additional furniture', () => {
    const items = mapChecklistToConsentItems(checklistItems);
    const bed = items.find((i) => i.name === 'ベッド');
    const storage = items.find((i) => i.name === '収納');
    expect(bed?.category).toBe('コアセット（基本セット）');
    expect(storage?.category).toBe('追加家具（個別オプション）');
  });

  it('maps all condition types to Japanese labels', () => {
    const items = mapChecklistToConsentItems(checklistItems);
    expect(items.find((i) => i.name === 'ベッド')?.condition).toBe('良好');
    expect(items.find((i) => i.name === 'ソファ')?.condition).toBe('普通');
    expect(items.find((i) => i.name === '収納')?.condition).toBe('普通');
  });

  it('passes through notes as remarks', () => {
    const items = mapChecklistToConsentItems(checklistItems);
    expect(items.find((i) => i.name === 'ベッド')?.remarks).toBe(
      'シングルベッド'
    );
    expect(items.find((i) => i.name === '収納')?.remarks).toBe('3段ラック');
  });

  it('handles items without condition or notes', () => {
    const items = mapChecklistToConsentItems([
      {
        id: 'cl-no-opts',
        furnitureType: 'table',
        photos: [],
        disposition: 'keep',
      },
    ]);
    expect(items[0].name).toBe('テーブル');
    expect(items[0].condition).toBeUndefined();
    expect(items[0].remarks).toBeUndefined();
  });

  it('returns empty array when no items have keep disposition', () => {
    const noKeepItems: ChecklistItem[] = [
      { id: 'x', furnitureType: 'bed', photos: [], disposition: 'take_away' },
      { id: 'y', furnitureType: 'sofa', photos: [], disposition: 'undecided' },
    ];
    expect(mapChecklistToConsentItems(noKeepItems)).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(mapChecklistToConsentItems([])).toHaveLength(0);
  });
});

describe('Consent form signature fields', () => {
  it('builds props with seller and buyer names for signatures', () => {
    const props = buildConsentFormProps({
      propertyAddress: '東京都新宿区',
      sellerName: '田中太郎',
      buyerName: '鈴木一郎',
      checklistItems: [],
    });
    expect(props.sellerName).toBe('田中太郎');
    expect(props.buyerName).toBe('鈴木一郎');
  });

  it('allows blank buyer name for unsigned forms', () => {
    const props = buildConsentFormProps({
      propertyAddress: '東京都新宿区',
      sellerName: '田中太郎',
      checklistItems: [],
    });
    expect(props.buyerName).toBeUndefined();
  });
});

describe('generateConsentPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a PDF buffer from checklist items', async () => {
    const { generateConsentPdf } = await import('../consent-generator');
    const buffer = await generateConsentPdf({
      propertyAddress: '東京都世田谷区1-2-3',
      sellerName: '田中太郎',
      buyerName: '山田花子',
      checklistItems: [
        {
          id: 'item-1',
          furnitureType: 'bed',
          photos: [],
          condition: 'excellent',
          disposition: 'keep',
        },
      ],
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('calls renderPdf with ConsentForm element', async () => {
    const { renderPdf } = await import('../render');
    const { generateConsentPdf } = await import('../consent-generator');
    await generateConsentPdf({
      propertyAddress: '東京都世田谷区1-2-3',
      sellerName: '田中太郎',
      checklistItems: [
        {
          id: 'item-1',
          furnitureType: 'sofa',
          photos: [],
          condition: 'good',
          disposition: 'keep',
        },
      ],
    });
    expect(renderPdf).toHaveBeenCalledTimes(1);
  });
});

describe('generateAndUploadConsentPdf (R2 integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates PDF and uploads to R2', async () => {
    const { uploadImage } = await import('../../storage');
    const { generateAndUploadConsentPdf } =
      await import('../consent-generator');
    const url = await generateAndUploadConsentPdf({
      propertyAddress: '東京都世田谷区1-2-3',
      sellerName: '田中太郎',
      buyerName: '山田花子',
      checklistItems: [
        {
          id: 'item-1',
          furnitureType: 'bed',
          photos: [],
          condition: 'excellent',
          disposition: 'keep',
        },
      ],
    });
    expect(uploadImage).toHaveBeenCalledTimes(1);
    expect(uploadImage).toHaveBeenCalledWith(
      expect.any(Buffer),
      'application/pdf'
    );
    expect(url).toBe('https://r2.example.com/uploads/test.pdf');
  });

  it('throws if storage is not configured', async () => {
    const { isStorageConfigured } = await import('../../storage');
    vi.mocked(isStorageConfigured).mockReturnValue(false);
    const { generateAndUploadConsentPdf } =
      await import('../consent-generator');
    await expect(
      generateAndUploadConsentPdf({
        propertyAddress: '東京都世田谷区',
        sellerName: '田中太郎',
        checklistItems: [],
      })
    ).rejects.toThrow('ストレージが設定されていません');
  });
});
