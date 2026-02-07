import {
  pgTable,
  varchar,
  integer,
  timestamp,
  jsonb,
  text,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { properties } from './properties';

// Payments table - stores all payment transactions
export const payments = pgTable(
  'payments',
  {
    id: text('id').primaryKey(),
    propertyId: text('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Payment type: 'application_fee' | 'deposit' | 'remaining'
    type: varchar('type', { length: 50 }).notNull(),
    amount: integer('amount').notNull(), // Amount in yen

    // Stripe payment identifiers
    stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
    stripeChargeId: text('stripe_charge_id'),

    // Payment status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
    status: varchar('status', { length: 50 }).notNull().default('pending'),

    // Additional metadata (e.g., failure reasons, customer notes)
    metadata: jsonb('metadata').$type<{
      failureReason?: string;
      customerNotes?: string;
      [key: string]: unknown;
    }>(),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      propertyIdIdx: index('idx_payments_property_id').on(table.propertyId),
      userIdIdx: index('idx_payments_user_id').on(table.userId),
      statusIdx: index('idx_payments_status').on(table.status),
      typeIdx: index('idx_payments_type').on(table.type),
      stripePaymentIntentIdIdx: index(
        'idx_payments_stripe_payment_intent_id'
      ).on(table.stripePaymentIntentId),
    };
  }
);

// Transactions table - distribution log for payment splits
export const transactions = pgTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    paymentId: text('payment_id')
      .notNull()
      .references(() => payments.id, { onDelete: 'cascade' }),

    // Recipient info: 'seller' | 'platform' | 'stripe'
    recipientType: varchar('recipient_type', { length: 50 }).notNull(),
    recipientId: text('recipient_id'), // User ID for seller, null for platform/stripe
    amount: integer('amount').notNull(), // Amount in yen

    // Stripe transfer/payout identifiers
    stripeTransferId: text('stripe_transfer_id'),
    stripePayoutId: text('stripe_payout_id'),

    // Transaction status: 'pending' | 'processing' | 'completed' | 'failed'
    status: varchar('status', { length: 50 }).notNull().default('pending'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      paymentIdIdx: index('idx_transactions_payment_id').on(table.paymentId),
      recipientTypeIdx: index('idx_transactions_recipient_type').on(
        table.recipientType
      ),
      recipientIdIdx: index('idx_transactions_recipient_id').on(
        table.recipientId
      ),
      statusIdx: index('idx_transactions_status').on(table.status),
    };
  }
);

// Stripe Connect accounts table
export const stripeAccounts = pgTable(
  'stripe_accounts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .unique()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Stripe Connect account ID
    stripeAccountId: text('stripe_account_id').unique().notNull(),

    // Account type: 'express' | 'standard' | 'custom'
    accountType: varchar('account_type', { length: 50 })
      .notNull()
      .default('express'),

    // Onboarding and capability flags
    onboardingCompleted: boolean('onboarding_completed')
      .default(false)
      .notNull(),
    detailsSubmitted: boolean('details_submitted').default(false).notNull(),
    chargesEnabled: boolean('charges_enabled').default(false).notNull(),
    payoutsEnabled: boolean('payouts_enabled').default(false).notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      userIdIdx: index('idx_stripe_accounts_user_id').on(table.userId),
      stripeAccountIdIdx: index('idx_stripe_accounts_stripe_account_id').on(
        table.stripeAccountId
      ),
    };
  }
);
