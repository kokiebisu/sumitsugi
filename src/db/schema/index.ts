// Export all schema tables
export { users, sellerProfiles } from './users';
export {
  properties,
  type ConsentStatus,
  type LandlordConsent,
  type FurnitureCategory,
  type FurnitureItem,
  type MoveOutReason,
} from './properties';
export { inquiries } from './inquiries';
export { threads, messages } from './messages';
export {
  sessions,
  accounts,
  verifications,
  verificationTokens,
} from './sessions';
export { payments, transactions, stripeAccounts } from './payments';
export {
  emailLogs,
  type EmailType,
  type EmailLogStatus,
  type EmailLogMetadata,
} from './email-logs';
export { handoverConfirmations } from './handover-confirmations';

// Define relations
import { relations } from 'drizzle-orm';
import { users, sellerProfiles } from './users';
import { properties } from './properties';
import { inquiries } from './inquiries';
import { threads, messages } from './messages';
import { sessions, accounts } from './sessions';
import { payments, transactions, stripeAccounts } from './payments';
import { emailLogs } from './email-logs';
import { handoverConfirmations } from './handover-confirmations';

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  sellerProfile: one(sellerProfiles, {
    fields: [users.id],
    references: [sellerProfiles.userId],
  }),
  properties: many(properties),
  inquiries: many(inquiries),
  sessions: many(sessions),
  accounts: many(accounts),
  payments: many(payments),
  stripeAccount: one(stripeAccounts, {
    fields: [users.id],
    references: [stripeAccounts.userId],
  }),
}));

// Seller Profile relations
export const sellerProfilesRelations = relations(sellerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [sellerProfiles.userId],
    references: [users.id],
  }),
}));

// Property relations
export const propertiesRelations = relations(properties, ({ one, many }) => ({
  user: one(users, {
    fields: [properties.userId],
    references: [users.id],
  }),
  inquiries: many(inquiries),
  payments: many(payments),
  threads: many(threads),
  emailLogs: many(emailLogs),
  handoverConfirmation: one(handoverConfirmations, {
    fields: [properties.id],
    references: [handoverConfirmations.propertyId],
  }),
}));

// Inquiry relations
export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  property: one(properties, {
    fields: [inquiries.propertyId],
    references: [properties.id],
  }),
  user: one(users, {
    fields: [inquiries.userId],
    references: [users.id],
  }),
}));

// Session relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Account relations
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// Payment relations
export const paymentsRelations = relations(payments, ({ one, many }) => ({
  property: one(properties, {
    fields: [payments.propertyId],
    references: [properties.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

// Transaction relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  payment: one(payments, {
    fields: [transactions.paymentId],
    references: [payments.id],
  }),
}));

// Stripe Account relations
export const stripeAccountsRelations = relations(stripeAccounts, ({ one }) => ({
  user: one(users, {
    fields: [stripeAccounts.userId],
    references: [users.id],
  }),
}));

// Thread relations
export const threadsRelations = relations(threads, ({ one, many }) => ({
  property: one(properties, {
    fields: [threads.propertyId],
    references: [properties.id],
  }),
  seller: one(users, {
    fields: [threads.sellerId],
    references: [users.id],
    relationName: 'threadSeller',
  }),
  buyer: one(users, {
    fields: [threads.buyerId],
    references: [users.id],
    relationName: 'threadBuyer',
  }),
  messages: many(messages),
}));

// Message relations
export const messagesRelations = relations(messages, ({ one }) => ({
  thread: one(threads, {
    fields: [messages.threadId],
    references: [threads.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Email Log relations
export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  property: one(properties, {
    fields: [emailLogs.propertyId],
    references: [properties.id],
  }),
}));

// Handover Confirmation relations
export const handoverConfirmationsRelations = relations(
  handoverConfirmations,
  ({ one }) => ({
    property: one(properties, {
      fields: [handoverConfirmations.propertyId],
      references: [properties.id],
    }),
  })
);
