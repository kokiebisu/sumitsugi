import {
  pgTable,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { properties } from './properties';

export type EmailType =
  | 'management_company_agreement'
  | 'management_company_faq'
  | 'management_company_notification';

export type EmailLogStatus = 'sent' | 'failed' | 'bounced';

export interface EmailLogMetadata {
  resendMessageId?: string;
  attachmentUrls?: string[];
  error?: string;
}

export const emailLogs = pgTable(
  'email_logs',
  {
    id: text('id').primaryKey().notNull(),
    propertyId: text('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    recipientEmail: varchar('recipient_email', { length: 320 }).notNull(),
    emailType: varchar('email_type', { length: 50 })
      .$type<EmailType>()
      .notNull(),
    subject: varchar('subject', { length: 500 }).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
    status: varchar('status', { length: 20 })
      .$type<EmailLogStatus>()
      .default('sent')
      .notNull(),
    pdfUrl: text('pdf_url'),
    metadata: jsonb('metadata').$type<EmailLogMetadata>(),
  },
  (table) => {
    return {
      propertyIdIdx: index('idx_email_logs_property_id').on(table.propertyId),
      emailTypeIdx: index('idx_email_logs_email_type').on(table.emailType),
      sentAtIdx: index('idx_email_logs_sent_at').on(table.sentAt),
    };
  }
);
