import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, decimal, index, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Basic Info
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary"),
  images: text("images").array().notNull(), // Array of S3 URLs
  status: varchar("status", { length: 20 }).default("draft").notNull(), // 'draft' | 'public'

  // Pricing
  handoverFee: integer("handover_fee"),
  rent: integer("rent"),
  managementFee: integer("management_fee"),
  deposit: decimal("deposit", { precision: 3, scale: 1 }), // Months
  keyMoney: decimal("key_money", { precision: 3, scale: 1 }), // Months

  // Location
  area: varchar("area", { length: 100 }),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  neighborhood: varchar("neighborhood", { length: 255 }),

  // Property Details
  layout: varchar("layout", { length: 50 }),
  occupancy: integer("occupancy"),
  style: varchar("style", { length: 50 }),
  furniture: text("furniture").array(), // Array of furniture types
  condition: varchar("condition", { length: 20 }), // 'excellent' | 'good' | 'used'
  estimatedDuration: varchar("estimated_duration", { length: 50 }), // Contract duration e.g., '2〜4ヶ月'
  landlordConsent: boolean("landlord_consent").default(false), // Landlord approval status
  amenities: text("amenities").array(), // Array of amenities (e.g., WiFi, AC, washing machine)

  // Detailed Descriptions
  furnitureDescription: text("furniture_description"),
  story: text("story"),
  conditions: text("conditions"),

  // Handover Details (JSONB for nested structure)
  handoverDetails: jsonb("handover_details").$type<{
    included?: string[];
    notIncluded?: string[];
    viewingAvailableFrom?: string;
    moveInAvailableFrom?: string;
  }>(),

  // FAQ
  faq: jsonb("faq").$type<Array<{
    question: string;
    answer: string;
  }>>(),

  // Host Profile (denormalized for performance)
  handoverHost: jsonb("handover_host").$type<{
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

  // Internal Management
  issueRecord: jsonb("issue_record").$type<Array<{
    issue: string;
    reportedAt: string;
  }>>().default([]),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
}, (table) => {
  return {
    statusIdx: index("idx_properties_status").on(table.status),
    userIdIdx: index("idx_properties_user_id").on(table.userId),
    areaIdx: index("idx_properties_area").on(table.area),
    createdAtIdx: index("idx_properties_created_at").on(table.createdAt),
  };
});
