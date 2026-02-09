import { describe, it, expect } from 'vitest';
import {
  consentStatusSchema,
  moveOutReasonSchema,
  furnitureCategorySchema,
  furnitureItemSchema,
  landlordConsentSchema,
  furniturePinSchema,
  tasteCategorySchema,
  listingFormSchema,
  type TasteCategoryInput,
  type ListingFormInput,
} from '../property';

describe('consentStatusSchema', () => {
  it('accepts all valid statuses', () => {
    const statuses = [
      'pending',
      'approved',
      'conditional',
      'rejected',
      'expired',
    ];
    for (const status of statuses) {
      expect(consentStatusSchema.parse(status)).toBe(status);
    }
  });

  it('rejects invalid status', () => {
    expect(() => consentStatusSchema.parse('unknown')).toThrow();
  });
});

describe('moveOutReasonSchema', () => {
  it('accepts all 8 valid reasons', () => {
    const reasons = [
      'job_transfer',
      'job_change',
      'marriage',
      'family',
      'upgrade',
      'downsize',
      'end_of_contract',
      'other',
    ];
    for (const reason of reasons) {
      expect(moveOutReasonSchema.parse(reason)).toBe(reason);
    }
  });

  it('rejects invalid reason', () => {
    expect(() => moveOutReasonSchema.parse('vacation')).toThrow();
  });
});

describe('furnitureCategorySchema', () => {
  it('accepts all 9 valid categories', () => {
    const categories = [
      'sofa',
      'dining_table',
      'bed_frame',
      'desk',
      'storage',
      'chair',
      'lighting',
      'rug',
      'other',
    ];
    for (const cat of categories) {
      expect(furnitureCategorySchema.parse(cat)).toBe(cat);
    }
  });

  it('rejects invalid category', () => {
    expect(() => furnitureCategorySchema.parse('table')).toThrow();
  });
});

describe('furniturePinSchema', () => {
  it('accepts valid pin', () => {
    const pin = { photoIndex: 0, x: 50.5, y: 25.0 };
    expect(furniturePinSchema.parse(pin)).toEqual(pin);
  });

  it('rejects x > 100', () => {
    expect(() =>
      furniturePinSchema.parse({ photoIndex: 0, x: 101, y: 50 })
    ).toThrow();
  });

  it('rejects negative y', () => {
    expect(() =>
      furniturePinSchema.parse({ photoIndex: 0, x: 50, y: -1 })
    ).toThrow();
  });
});

describe('furnitureItemSchema', () => {
  const validItem = {
    id: 'item-1',
    name: 'ソファ',
    category: 'core' as const,
    furnitureCategory: 'sofa' as const,
  };

  it('accepts minimal valid item', () => {
    expect(furnitureItemSchema.parse(validItem)).toEqual(validItem);
  });

  it('accepts item with all optional fields', () => {
    const fullItem = {
      ...validItem,
      description: 'IKEA製の3人掛けソファ',
      photoUrl: 'https://example.com/photo.jpg',
      price: 30000,
      brand: 'IKEA',
      newPrice: 50000,
      yearsUsed: 2,
      pin: { photoIndex: 0, x: 30, y: 60 },
    };
    expect(furnitureItemSchema.parse(fullItem)).toEqual(fullItem);
  });

  it('rejects empty id', () => {
    expect(() => furnitureItemSchema.parse({ ...validItem, id: '' })).toThrow();
  });

  it('rejects invalid category value', () => {
    expect(() =>
      furnitureItemSchema.parse({ ...validItem, category: 'premium' })
    ).toThrow();
  });

  it('rejects invalid furnitureCategory', () => {
    expect(() =>
      furnitureItemSchema.parse({ ...validItem, furnitureCategory: 'couch' })
    ).toThrow();
  });

  it('rejects negative price', () => {
    expect(() =>
      furnitureItemSchema.parse({ ...validItem, price: -100 })
    ).toThrow();
  });

  it('rejects invalid photoUrl', () => {
    expect(() =>
      furnitureItemSchema.parse({ ...validItem, photoUrl: 'not-a-url' })
    ).toThrow();
  });
});

describe('landlordConsentSchema', () => {
  it('accepts minimal consent (status only)', () => {
    const consent = { status: 'pending' as const };
    expect(landlordConsentSchema.parse(consent)).toEqual(consent);
  });

  it('accepts full consent with all fields', () => {
    const consent = {
      status: 'conditional' as const,
      approvedItems: ['sofa', 'desk'],
      rejectedItems: ['lighting'],
      conditions: '退去時に清掃必要',
      restorationTerms: '原状回復不要',
      approvedAt: '2026-01-15T10:00:00Z',
      approvedBy: '山田太郎',
    };
    expect(landlordConsentSchema.parse(consent)).toEqual(consent);
  });

  it('rejects missing status', () => {
    expect(() => landlordConsentSchema.parse({})).toThrow();
  });

  it('rejects invalid status', () => {
    expect(() => landlordConsentSchema.parse({ status: 'maybe' })).toThrow();
  });
});

describe('tasteCategorySchema', () => {
  it('accepts valid taste categories', () => {
    const validCategories: TasteCategoryInput[] = [
      'minimal',
      'natural',
      'modern',
      'japanese',
      'industrial',
      'vintage',
    ];
    for (const cat of validCategories) {
      expect(tasteCategorySchema.parse(cat)).toBe(cat);
    }
  });

  it('rejects invalid taste category', () => {
    expect(() => tasteCategorySchema.parse('gothic')).toThrow();
  });
});

describe('listingFormSchema', () => {
  const validInput: ListingFormInput = {
    title: 'テスト物件',
    images: ['https://example.com/photo.jpg'],
    area: '渋谷区',
    status: 'draft',
  };

  it('accepts valid minimal input (required fields only)', () => {
    const result = listingFormSchema.parse(validInput);
    expect(result.title).toBe('テスト物件');
    expect(result.images).toHaveLength(1);
    expect(result.area).toBe('渋谷区');
    expect(result.status).toBe('draft');
  });

  it('accepts valid input with optional fields', () => {
    const input = {
      ...validInput,
      status: 'public' as const,
      tasteCategory: 'minimal' as const,
      moveOutReason: 'job_transfer' as const,
      managementCompanyName: '管理会社テスト',
      summary: 'テストサマリー',
      story: 'テストストーリー',
    };
    const result = listingFormSchema.parse(input);
    expect(result.tasteCategory).toBe('minimal');
    expect(result.moveOutReason).toBe('job_transfer');
    expect(result.managementCompanyName).toBe('管理会社テスト');
  });

  it('rejects missing title', () => {
    const { title: _, ...noTitle } = validInput;
    expect(() => listingFormSchema.parse(noTitle)).toThrow();
  });

  it('rejects empty title', () => {
    expect(() =>
      listingFormSchema.parse({ ...validInput, title: '' })
    ).toThrow();
  });

  it('rejects empty images array', () => {
    expect(() =>
      listingFormSchema.parse({ ...validInput, images: [] })
    ).toThrow();
  });

  it('rejects missing area', () => {
    const { area: _, ...noArea } = validInput;
    expect(() => listingFormSchema.parse(noArea)).toThrow();
  });

  it('rejects invalid status', () => {
    expect(() =>
      listingFormSchema.parse({ ...validInput, status: 'archived' })
    ).toThrow();
  });

  it('defaults status to draft when not provided', () => {
    const { status: _, ...noStatus } = validInput;
    const result = listingFormSchema.parse(noStatus);
    expect(result.status).toBe('draft');
  });

  it('rejects invalid tasteCategory', () => {
    expect(() =>
      listingFormSchema.parse({ ...validInput, tasteCategory: 'gothic' })
    ).toThrow();
  });
});
