import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { properties } from "./properties";
import { users } from "./users";

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

  // Property Snapshot
  propertyTitle: varchar("property_title", { length: 500 }).notNull(),

  // Status Management
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  // 'pending' | 'reviewing' | 'approved' | 'viewing_scheduled'
  // | 'contract_in_progress' | 'completed' | 'rejected' | 'cancelled'

  // Applicant Info
  applicantName: varchar("applicant_name", { length: 255 }).notNull(),
  applicantEmail: varchar("applicant_email", { length: 255 }).notNull(),

  // Content
  reason: text("reason").notNull(),
  questions: text("questions"),

  // Viewing Confirmation (JSONB)
  viewingConfirmation: jsonb("viewing_confirmation").$type<{
    hostConfirmed?: boolean;
    hostConfirmedAt?: string;
    applicantConfirmed?: boolean;
    applicantConfirmedAt?: string;
  }>().default({}),

  // Admin Notes
  notes: text("notes"),

  // Timestamps
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    propertyIdIdx: index("idx_inquiries_property_id").on(table.propertyId),
    userIdIdx: index("idx_inquiries_user_id").on(table.userId),
    statusIdx: index("idx_inquiries_status").on(table.status),
    submittedAtIdx: index("idx_inquiries_submitted_at").on(table.submittedAt),
  };
});
