import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// LandlordConsent JSONB structure (§7.4)
// ConsentStatus: 'pending' | 'approved' | 'conditional' | 'rejected' | 'expired'
export type ConsentStatus =
  | 'pending'
  | 'approved'
  | 'conditional'
  | 'rejected'
  | 'expired';

export interface LandlordConsent {
  status: ConsentStatus;
  approvedItems?: string[];
  rejectedItems?: string[];
  conditions?: string;
  restorationTerms?: string;
  approvedAt?: string;
  approvedBy?: string;
}

// FurnitureItem JSONB structure (§7.7)
export type FurnitureCategory =
  | 'sofa'
  | 'dining_table'
  | 'bed_frame'
  | 'desk'
  | 'storage'
  | 'chair'
  | 'lighting'
  | 'rug'
  | 'other';

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'core' | 'additional';
  furnitureCategory: FurnitureCategory;
  description?: string;
  photoUrl?: string;
  price?: number;
  brand?: string;
  newPrice?: number;
  yearsUsed?: number;
  pin?: { photoIndex: number; x: number; y: number };
}

// MoveOutReason (§7.6)
export type MoveOutReason =
  | 'job_transfer'
  | 'job_change'
  | 'marriage'
  | 'family'
  | 'upgrade'
  | 'downsize'
  | 'end_of_contract'
  | 'other';

export const properties = pgTable(
  'properties',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Basic Info
    title: varchar('title', { length: 500 }).notNull(),
    summary: text('summary'),
    images: text('images').array().notNull(), // Array of S3 URLs
    status: varchar('status', { length: 20 }).default('draft').notNull(), // 'draft' | 'public'

    // Pricing
    handoverFee: integer('handover_fee'),
    additionalCleaningFee: integer('additional_cleaning_fee')
      .default(8000)
      .notNull(), // Fixed ¥8,000
    coreSetPrice: integer('core_set_price'), // コアセット一括価格（円）
    rent: integer('rent'),
    managementFee: integer('management_fee'),
    deposit: decimal('deposit', { precision: 3, scale: 1 }), // Months
    keyMoney: decimal('key_money', { precision: 3, scale: 1 }), // Months

    // Location
    area: varchar('area', { length: 100 }),
    lat: decimal('lat', { precision: 10, scale: 7 }),
    lng: decimal('lng', { precision: 10, scale: 7 }),
    neighborhood: varchar('neighborhood', { length: 255 }),

    // Property Details
    layout: varchar('layout', { length: 50 }),
    occupancy: integer('occupancy'),
    style: varchar('style', { length: 50 }),
    furnitureItems: jsonb('furniture_items').$type<FurnitureItem[]>(), // 破壊的変更: furniture text[] → furnitureItems JSONB
    condition: varchar('condition', { length: 20 }), // 'excellent' | 'good' | 'used'
    estimatedDuration: varchar('estimated_duration', { length: 50 }), // Contract duration e.g., '2〜4ヶ月'
    landlordConsent: jsonb('landlord_consent')
      .$type<LandlordConsent>()
      .default({ status: 'pending' }), // 破壊的変更: boolean → JSONB
    amenities: text('amenities').array(), // Array of amenities (e.g., WiFi, AC, washing machine)

    // Move-out Info (F-501, §7.1)
    moveOutDate: timestamp('move_out_date', { withTimezone: true }),
    moveOutReason: varchar('move_out_reason', {
      length: 50,
    }).$type<MoveOutReason>(),

    // Management Company
    managementCompanyName: varchar('management_company_name', { length: 255 }),
    managementCompanyEmail: varchar('management_company_email', {
      length: 320,
    }),
    managementConsultedAt: timestamp('management_consulted_at', {
      withTimezone: true,
    }),

    // Generated PDFs (F-611/F-612/F-616)
    pdfUrls: jsonb('pdf_urls').$type<Record<string, string>>(),

    // Detailed Descriptions
    furnitureDescription: text('furniture_description'),
    story: text('story'),
    conditions: text('conditions'),

    // Handover Details (JSONB for nested structure)
    handoverDetails: jsonb('handover_details').$type<{
      included?: string[];
      notIncluded?: string[];
      viewingAvailableFrom?: string;
      moveInAvailableFrom?: string;
    }>(),

    // FAQ
    faq: jsonb('faq').$type<
      Array<{
        question: string;
        answer: string;
      }>
    >(),

    // Host Profile (denormalized for performance)
    handoverHost: jsonb('handover_host').$type<{
      name: string;
      occupation: string;
      bio: string;
      avatar?: string;
      whyChoseThis?: Array<{ reason: string; image?: string }>;
      messageToNext?: string;
      socialLinks?: {
        instagram?: string;
        twitter?: string;
        website?: string;
        youtube?: string;
        tiktok?: string;
      };
    }>(),

    // Pro Coordination (B2B)
    isProCoordinated: boolean('is_pro_coordinated').default(false).notNull(),

    // Internal Management
    issueRecord: jsonb('issue_record')
      .$type<
        Array<{
          issue: string;
          reportedAt: string;
        }>
      >()
      .default([]),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (table) => {
    return {
      statusIdx: index('idx_properties_status').on(table.status),
      userIdIdx: index('idx_properties_user_id').on(table.userId),
      areaIdx: index('idx_properties_area').on(table.area),
      createdAtIdx: index('idx_properties_created_at').on(table.createdAt),
    };
  }
);
