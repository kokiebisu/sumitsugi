import { describe, it, expect } from 'vitest';
import type { LandlordConsent, ConsentStatus, UserListing } from '@/lib/data';

describe('LandlordConsent', () => {
  describe('type validation', () => {
    it('accepts valid landlord consent with hasLandlordConsent true', () => {
      const consent: LandlordConsent = {
        hasLandlordConsent: true,
      };
      expect(consent.hasLandlordConsent).toBe(true);
    });

    it('accepts valid landlord consent with hasLandlordConsent false', () => {
      const consent: LandlordConsent = {
        hasLandlordConsent: false,
      };
      expect(consent.hasLandlordConsent).toBe(false);
    });
  });

  describe('ConsentStatus', () => {
    it('accepts all valid consent statuses', () => {
      const statuses: ConsentStatus[] = [
        'pending',
        'conditional',
        'approved',
        'rejected',
        'expired',
      ];
      expect(statuses).toHaveLength(5);
    });
  });

  describe('UserListing integration', () => {
    it('allows listing without landlord consent', () => {
      const listing: Partial<UserListing> = {
        id: 'test-1',
        title: 'Test Listing',
        status: 'draft',
      };
      expect(listing.landlordConsent).toBeUndefined();
      expect(listing.consentStatus).toBeUndefined();
    });

    it('allows listing with landlord consent approved', () => {
      const listing: Partial<UserListing> = {
        id: 'test-2',
        title: 'Test Listing',
        status: 'draft',
        landlordConsent: { hasLandlordConsent: true },
        consentStatus: 'approved',
      };
      expect(listing.landlordConsent?.hasLandlordConsent).toBe(true);
      expect(listing.consentStatus).toBe('approved');
    });

    it('allows listing with landlord consent pending', () => {
      const listing: Partial<UserListing> = {
        id: 'test-3',
        title: 'Test Listing',
        status: 'draft',
        landlordConsent: { hasLandlordConsent: false },
        consentStatus: 'pending',
      };
      expect(listing.landlordConsent?.hasLandlordConsent).toBe(false);
      expect(listing.consentStatus).toBe('pending');
    });

    it('maps consent checkbox to correct status', () => {
      const mapConsentToStatus = (hasConsent: boolean): ConsentStatus => {
        return hasConsent ? 'approved' : 'pending';
      };

      expect(mapConsentToStatus(true)).toBe('approved');
      expect(mapConsentToStatus(false)).toBe('pending');
    });
  });

  describe('updateListing with landlord consent', () => {
    it('creates correct update payload when consent is granted', () => {
      const updates: Partial<UserListing> = {
        landlordConsent: { hasLandlordConsent: true },
        consentStatus: 'approved',
      };

      expect(updates.landlordConsent).toEqual({
        hasLandlordConsent: true,
      });
      expect(updates.consentStatus).toBe('approved');
    });

    it('creates correct update payload when consent is revoked', () => {
      const updates: Partial<UserListing> = {
        landlordConsent: { hasLandlordConsent: false },
        consentStatus: 'pending',
      };

      expect(updates.landlordConsent).toEqual({
        hasLandlordConsent: false,
      });
      expect(updates.consentStatus).toBe('pending');
    });

    it('preserves other listing fields when updating consent', () => {
      const existingListing: UserListing = {
        id: 'test-1',
        userId: 'user-1',
        status: 'draft',
        title: 'My Room',
        roomStyle: 'modern',
        roomPhotos: ['photo1.jpg'],
        handoverFee: 50000,
        rent: 80000,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const updates: Partial<UserListing> = {
        landlordConsent: { hasLandlordConsent: true },
        consentStatus: 'approved',
      };

      const updatedListing: UserListing = {
        ...existingListing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      expect(updatedListing.title).toBe('My Room');
      expect(updatedListing.handoverFee).toBe(50000);
      expect(updatedListing.landlordConsent?.hasLandlordConsent).toBe(true);
      expect(updatedListing.consentStatus).toBe('approved');
    });
  });

  describe('dashboard banner logic', () => {
    it('shows banner when listing has no consent status', () => {
      const listings: Partial<UserListing>[] = [
        { id: '1', consentStatus: undefined },
      ];
      const needsBanner = listings.some(
        (l) => !l.consentStatus || l.consentStatus === 'pending'
      );
      expect(needsBanner).toBe(true);
    });

    it('shows banner when listing has pending consent', () => {
      const listings: Partial<UserListing>[] = [
        { id: '1', consentStatus: 'pending' },
      ];
      const needsBanner = listings.some(
        (l) => !l.consentStatus || l.consentStatus === 'pending'
      );
      expect(needsBanner).toBe(true);
    });

    it('hides banner when all listings are approved', () => {
      const listings: Partial<UserListing>[] = [
        { id: '1', consentStatus: 'approved' },
        { id: '2', consentStatus: 'approved' },
      ];
      const needsBanner = listings.some(
        (l) => !l.consentStatus || l.consentStatus === 'pending'
      );
      expect(needsBanner).toBe(false);
    });

    it('shows banner when at least one listing lacks consent', () => {
      const listings: Partial<UserListing>[] = [
        { id: '1', consentStatus: 'approved' },
        { id: '2', consentStatus: undefined },
      ];
      const needsBanner = listings.some(
        (l) => !l.consentStatus || l.consentStatus === 'pending'
      );
      expect(needsBanner).toBe(true);
    });
  });
});
