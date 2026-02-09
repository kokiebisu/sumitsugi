import {
  pgTable,
  varchar,
  integer,
  timestamp,
  jsonb,
  text,
  index,
} from 'drizzle-orm/pg-core';
import { properties } from './properties';
import { users } from './users';
import { inquiries } from './inquiries';

// Signature data stored per signatory
export interface SignatureData {
  name: string;
  signedAt: string;
  ipAddress?: string;
}

// Audit trail entry
export interface AuditEntry {
  action: string;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, unknown>;
}

// Agreement item (furniture/appliance being handed over)
export interface ContractItem {
  id: string;
  name: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  photos: string[];
  notes?: string;
}

// Electronic contracts table - stores handover agreements
export const electronicContracts = pgTable(
  'electronic_contracts',
  {
    id: text('id').primaryKey(),

    // References
    propertyId: text('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    inquiryId: text('inquiry_id').references(() => inquiries.id, {
      onDelete: 'set null',
    }),

    // Parties
    sellerId: text('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    buyerId: text('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Contract type: 'handover_agreement' | 'goods_consent'
    contractType: varchar('contract_type', { length: 50 })
      .notNull()
      .default('handover_agreement'),

    // Status lifecycle:
    // draft → pending_seller_signature → pending_buyer_signature → signed → completed
    status: varchar('status', { length: 50 }).notNull().default('draft'),

    // Property snapshot
    propertyTitle: varchar('property_title', { length: 500 }).notNull(),
    propertyAddress: text('property_address'),

    // Party names
    sellerName: varchar('seller_name', { length: 255 }).notNull(),
    sellerEmail: varchar('seller_email', { length: 255 }).notNull(),
    buyerName: varchar('buyer_name', { length: 255 }).notNull(),
    buyerEmail: varchar('buyer_email', { length: 255 }).notNull(),

    // Financial
    handoverFee: integer('handover_fee').notNull(), // Amount in yen

    // Items being transferred
    items: jsonb('items').$type<ContractItem[]>().default([]).notNull(),

    // Signatures
    sellerSignature: jsonb('seller_signature').$type<SignatureData | null>(),
    buyerSignature: jsonb('buyer_signature').$type<SignatureData | null>(),

    // Audit trail
    auditTrail: jsonb('audit_trail')
      .$type<AuditEntry[]>()
      .default([])
      .notNull(),

    // PDF storage
    pdfUrl: text('pdf_url'),

    // Expiration (unsigned contracts expire after 30 days)
    expiresAt: timestamp('expires_at', { withTimezone: true }),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    signedAt: timestamp('signed_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      propertyIdIdx: index('idx_econtracts_property_id').on(table.propertyId),
      inquiryIdIdx: index('idx_econtracts_inquiry_id').on(table.inquiryId),
      sellerIdIdx: index('idx_econtracts_seller_id').on(table.sellerId),
      buyerIdIdx: index('idx_econtracts_buyer_id').on(table.buyerId),
      statusIdx: index('idx_econtracts_status').on(table.status),
      contractTypeIdx: index('idx_econtracts_contract_type').on(
        table.contractType
      ),
    };
  }
);
