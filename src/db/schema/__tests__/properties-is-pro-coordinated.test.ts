import { describe, it, expect } from 'vitest';
import { properties } from '../properties';
import { getTableColumns } from 'drizzle-orm';

describe('Properties isProCoordinated field', () => {
  const columns = getTableColumns(properties);

  it('has isProCoordinated column defined', () => {
    expect(columns.isProCoordinated).toBeDefined();
  });

  it('has correct SQL column name', () => {
    expect(columns.isProCoordinated.name).toBe('is_pro_coordinated');
  });

  it('has default value of false', () => {
    expect(columns.isProCoordinated.hasDefault).toBe(true);
    expect(columns.isProCoordinated.default).toBe(false);
  });

  it('is not nullable (notNull constraint)', () => {
    expect(columns.isProCoordinated.notNull).toBe(true);
  });
});
