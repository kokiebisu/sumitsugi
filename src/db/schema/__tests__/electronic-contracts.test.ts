import { describe, it, expect } from 'vitest';
import { electronicContracts } from '../electronic-contracts';
import { getTableColumns } from 'drizzle-orm';

describe('Electronic Contracts Database Schema', () => {
  describe('electronicContracts table', () => {
    it('should be defined', () => {
      expect(electronicContracts).toBeDefined();
    });

    it('should have required columns', () => {
      const columns = getTableColumns(electronicContracts);

      // Primary key
      expect(columns.id).toBeDefined();

      // Foreign keys
      expect(columns.propertyId).toBeDefined();
      expect(columns.inquiryId).toBeDefined();
      expect(columns.sellerId).toBeDefined();
      expect(columns.buyerId).toBeDefined();

      // Contract type and status
      expect(columns.contractType).toBeDefined();
      expect(columns.status).toBeDefined();

      // Property snapshot
      expect(columns.propertyTitle).toBeDefined();
      expect(columns.propertyAddress).toBeDefined();

      // Party info
      expect(columns.sellerName).toBeDefined();
      expect(columns.sellerEmail).toBeDefined();
      expect(columns.buyerName).toBeDefined();
      expect(columns.buyerEmail).toBeDefined();

      // Financial
      expect(columns.handoverFee).toBeDefined();

      // Items and signatures
      expect(columns.items).toBeDefined();
      expect(columns.sellerSignature).toBeDefined();
      expect(columns.buyerSignature).toBeDefined();

      // Audit trail
      expect(columns.auditTrail).toBeDefined();

      // PDF storage
      expect(columns.pdfUrl).toBeDefined();

      // Expiration
      expect(columns.expiresAt).toBeDefined();

      // Timestamps
      expect(columns.createdAt).toBeDefined();
      expect(columns.signedAt).toBeDefined();
      expect(columns.completedAt).toBeDefined();
      expect(columns.updatedAt).toBeDefined();
    });

    it('should have correct table name', () => {
      // Verify the pgTable name
      const tableName =
        electronicContracts[Symbol.for('drizzle:Name') as unknown as string];
      expect(tableName).toBe('electronic_contracts');
    });
  });
});
