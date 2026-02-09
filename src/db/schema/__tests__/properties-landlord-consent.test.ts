import { describe, it, expect } from 'vitest';
import { properties } from '../properties';
import { getTableColumns } from 'drizzle-orm';

describe('Properties landlordConsent field', () => {
  const columns = getTableColumns(properties);

  it('has landlordConsent column defined', () => {
    expect(columns.landlordConsent).toBeDefined();
  });

  it('has all consent-related columns', () => {
    expect(columns.landlordConsent).toBeDefined();
    expect(columns.userId).toBeDefined();
    expect(columns.status).toBeDefined();
  });

  it('landlordConsent column has correct SQL name', () => {
    expect(columns.landlordConsent.name).toBe('landlord_consent');
  });
});
