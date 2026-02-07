import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { properties } from './properties';
import { users } from './users';

export const handoverConfirmations = pgTable(
  'handover_confirmations',
  {
    id: text('id').primaryKey().notNull(),
    propertyId: text('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    buyerId: text('buyer_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    sellerId: text('seller_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    buyerConfirmedAt: timestamp('buyer_confirmed_at', { withTimezone: true }),
    sellerConfirmedAt: timestamp('seller_confirmed_at', {
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      uniqueProperty: unique('uq_handover_confirmations_property').on(
        table.propertyId
      ),
    };
  }
);
