import { describe, it, expect } from 'vitest';
import { inquiryFieldsSchema } from '../inquiry';

describe('inquiryFieldsSchema', () => {
  it('accepts empty object (all optional)', () => {
    expect(inquiryFieldsSchema.parse({})).toEqual({});
  });

  it('accepts valid duration', () => {
    const result = inquiryFieldsSchema.parse({ duration: '6ヶ月' });
    expect(result.duration).toBe('6ヶ月');
  });

  it('rejects duration exceeding 100 characters', () => {
    expect(() =>
      inquiryFieldsSchema.parse({ duration: 'a'.repeat(101) })
    ).toThrow();
  });

  it('accepts valid agreedFurnitureIds', () => {
    const result = inquiryFieldsSchema.parse({
      agreedFurnitureIds: ['item-1', 'item-2'],
    });
    expect(result.agreedFurnitureIds).toEqual(['item-1', 'item-2']);
  });

  it('accepts valid viewingDate as ISO datetime', () => {
    const result = inquiryFieldsSchema.parse({
      viewingDate: '2026-03-01T10:00:00Z',
    });
    expect(result.viewingDate).toBe('2026-03-01T10:00:00Z');
  });

  it('rejects invalid viewingDate format', () => {
    expect(() =>
      inquiryFieldsSchema.parse({ viewingDate: '2026-03-01' })
    ).toThrow();
  });
});
