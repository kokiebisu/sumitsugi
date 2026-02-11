import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('data.ts mock data environment switching', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.stubEnv('NODE_ENV', originalEnv ?? 'test');
    vi.resetModules();
  });

  describe('production environment', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.resetModules();
    });

    it('getPublicProperties returns empty array', async () => {
      const { getPublicProperties } = await import('../data');
      expect(getPublicProperties()).toEqual([]);
    });

    it('getPropertyById returns undefined', async () => {
      const { getPropertyById } = await import('../data');
      expect(getPropertyById('1368794573069214647')).toBeUndefined();
    });

    it('getPropertiesByArea returns empty object', async () => {
      const { getPropertiesByArea } = await import('../data');
      expect(getPropertiesByArea()).toEqual({});
    });

    it('getAllInquiries returns empty array', async () => {
      const { getAllInquiries } = await import('../data');
      expect(getAllInquiries()).toEqual([]);
    });

    it('getAllSellerListings returns empty array', async () => {
      const { getAllSellerListings } = await import('../data');
      expect(getAllSellerListings()).toEqual([]);
    });

    it('getInquiryById returns undefined', async () => {
      const { getInquiryById } = await import('../data');
      expect(getInquiryById('inq_001')).toBeUndefined();
    });

    it('getSellerListingById returns undefined', async () => {
      const { getSellerListingById } = await import('../data');
      expect(getSellerListingById('sl_001')).toBeUndefined();
    });
  });

  describe('development environment', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.resetModules();
    });

    it('getPublicProperties returns mock data', async () => {
      const { getPublicProperties } = await import('../data');
      const properties = getPublicProperties();
      expect(properties.length).toBeGreaterThan(0);
      expect(properties.every((p) => p.status === 'public')).toBe(true);
    });

    it('getPropertyById returns a property for a valid id', async () => {
      const { getPropertyById, getPublicProperties } = await import('../data');
      const properties = getPublicProperties();
      if (properties.length > 0) {
        const property = getPropertyById(properties[0].id);
        expect(property).toBeDefined();
        expect(property?.id).toBe(properties[0].id);
      }
    });

    it('getPropertiesByArea returns grouped mock data', async () => {
      const { getPropertiesByArea } = await import('../data');
      const byArea = getPropertiesByArea();
      const areas = Object.keys(byArea);
      expect(areas.length).toBeGreaterThan(0);
      for (const area of areas) {
        expect(byArea[area].length).toBeGreaterThan(0);
      }
    });

    it('getAllInquiries returns mock data', async () => {
      const { getAllInquiries } = await import('../data');
      expect(getAllInquiries().length).toBeGreaterThan(0);
    });

    it('getAllSellerListings returns mock data', async () => {
      const { getAllSellerListings } = await import('../data');
      expect(getAllSellerListings().length).toBeGreaterThan(0);
    });
  });
});
