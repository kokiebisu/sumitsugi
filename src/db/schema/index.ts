// Export all schema tables
export { users, sellerProfiles } from './users';
export { properties } from './properties';
export { inquiries } from './inquiries';
export {
  sessions,
  accounts,
  verifications,
  verificationTokens,
} from './sessions';
export { payments, transactions, stripeAccounts } from './payments';

// Define relations
import { relations } from 'drizzle-orm';
import { users, sellerProfiles } from './users';
import { properties } from './properties';
import { inquiries } from './inquiries';
import { sessions, accounts } from './sessions';
import { payments, transactions, stripeAccounts } from './payments';

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
