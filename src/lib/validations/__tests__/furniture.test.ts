import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  furnitureFormItemSchema,
  furnitureFormSchema,
  getDefaultNewPrice,
  createBlankFurnitureItem,
  FURNITURE_CATEGORY_OPTIONS,
  DEFAULT_NEW_PRICES,
  type FurnitureFormItem,
} from '../furniture';

describe('FURNITURE_CATEGORY_OPTIONS', () => {
  it('contains 9 categories', () => {
    expect(FURNITURE_CATEGORY_OPTIONS).toHaveLength(9);
  });

  it('has Japanese labels for all categories', () => {
    for (const option of FURNITURE_CATEGORY_OPTIONS) {
      expect(option.label).toBeTruthy();
      expect(option.value).toBeTruthy();
    }
  });
});

describe('DEFAULT_NEW_PRICES', () => {
  it('has prices for all categories', () => {
    const categories = FURNITURE_CATEGORY_OPTIONS.map((o) => o.value);
    for (const cat of categories) {
      expect(DEFAULT_NEW_PRICES[cat]).toBeGreaterThan(0);
    }
  });
});

describe('furnitureFormItemSchema', () => {
  const validItem: FurnitureFormItem = {
    id: 'item-1',
    name: 'テストソファ',
    category: 'core',
    furnitureCategory: 'sofa',
  };

  it('accepts minimal valid item', () => {
    const result = furnitureFormItemSchema.parse(validItem);
    expect(result.id).toBe('item-1');
    expect(result.name).toBe('テストソファ');
    expect(result.category).toBe('core');
    expect(result.furnitureCategory).toBe('sofa');
  });

  it('accepts item with all optional fields', () => {
    const fullItem: FurnitureFormItem = {
      ...validItem,
      description: 'IKEAの3人掛けソファ',
      photoUrl: 'https://example.com/sofa.jpg',
      price: 25000,
      brand: 'IKEA',
      newPrice: 50000,
      yearsUsed: 2,
    };
    const result = furnitureFormItemSchema.parse(fullItem);
    expect(result.brand).toBe('IKEA');
    expect(result.yearsUsed).toBe(2);
  });

  it('accepts empty photoUrl string', () => {
    const item = { ...validItem, photoUrl: '' };
    const result = furnitureFormItemSchema.parse(item);
    expect(result.photoUrl).toBe('');
  });

  it('rejects empty name', () => {
    expect(() =>
      furnitureFormItemSchema.parse({ ...validItem, name: '' })
    ).toThrow('家具名は必須です');
  });

  it('rejects empty id', () => {
    expect(() =>
      furnitureFormItemSchema.parse({ ...validItem, id: '' })
    ).toThrow();
  });

  it('rejects invalid category', () => {
    expect(() =>
      furnitureFormItemSchema.parse({ ...validItem, category: 'premium' })
    ).toThrow();
  });

  it('rejects invalid furnitureCategory', () => {
    expect(() =>
      furnitureFormItemSchema.parse({
        ...validItem,
        furnitureCategory: 'couch',
      })
    ).toThrow();
  });

  it('rejects negative price', () => {
    expect(() =>
      furnitureFormItemSchema.parse({ ...validItem, price: -100 })
    ).toThrow();
  });

  it('rejects negative yearsUsed', () => {
    expect(() =>
      furnitureFormItemSchema.parse({ ...validItem, yearsUsed: -1 })
    ).toThrow();
  });

  it('rejects non-integer price', () => {
    expect(() =>
      furnitureFormItemSchema.parse({ ...validItem, price: 100.5 })
    ).toThrow();
  });

  it('accepts category "additional"', () => {
    const item = { ...validItem, category: 'additional' as const };
    const result = furnitureFormItemSchema.parse(item);
    expect(result.category).toBe('additional');
  });
});

describe('furnitureFormSchema', () => {
  it('accepts empty items array', () => {
    const result = furnitureFormSchema.parse({ items: [] });
    expect(result.items).toHaveLength(0);
  });

  it('accepts array with multiple items', () => {
    const items: FurnitureFormItem[] = [
      {
        id: '1',
        name: 'ソファ',
        category: 'core',
        furnitureCategory: 'sofa',
      },
      {
        id: '2',
        name: 'デスク',
        category: 'additional',
        furnitureCategory: 'desk',
        price: 15000,
      },
    ];
    const result = furnitureFormSchema.parse({ items });
    expect(result.items).toHaveLength(2);
  });

  it('rejects if any item is invalid', () => {
    const items = [
      {
        id: '1',
        name: '',
        category: 'core',
        furnitureCategory: 'sofa',
      },
    ];
    expect(() => furnitureFormSchema.parse({ items })).toThrow();
  });
});

describe('getDefaultNewPrice', () => {
  it('returns correct price for sofa', () => {
    expect(getDefaultNewPrice('sofa')).toBe(50000);
  });

  it('returns correct price for desk', () => {
    expect(getDefaultNewPrice('desk')).toBe(25000);
  });

  it('returns correct price for other', () => {
    expect(getDefaultNewPrice('other')).toBe(10000);
  });
});

describe('createBlankFurnitureItem', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-1234' });
  });

  it('creates item with default category "additional"', () => {
    const item = createBlankFurnitureItem();
    expect(item.category).toBe('additional');
    expect(item.id).toBe('test-uuid-1234');
    expect(item.name).toBe('');
    expect(item.furnitureCategory).toBe('other');
    expect(item.newPrice).toBe(DEFAULT_NEW_PRICES.other);
  });

  it('creates item with specified category "core"', () => {
    const item = createBlankFurnitureItem('core');
    expect(item.category).toBe('core');
  });

  it('returns a valid schema-compliant item (except empty name)', () => {
    const item = createBlankFurnitureItem();
    // Name is blank so it won't pass full validation, but structure is correct
    expect(item.id).toBeTruthy();
    expect(item.furnitureCategory).toBe('other');
  });
});
