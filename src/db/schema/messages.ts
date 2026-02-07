import {
  pgTable,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { properties } from './properties';
import { users } from './users';

// Threads table (§7.8, DESIGN_DOC §2.5)
export const threads = pgTable(
  'threads',
  {
    id: text('id').primaryKey(),
    propertyId: text('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    sellerId: text('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    buyerId: text('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      // 1物件×1ペア1スレッド
      uniquePropertySellerBuyer: unique('uq_threads_property_seller_buyer').on(
        table.propertyId,
        table.sellerId,
        table.buyerId
      ),
      propertyIdIdx: index('idx_threads_property_id').on(table.propertyId),
      sellerIdIdx: index('idx_threads_seller_id').on(table.sellerId),
      buyerIdIdx: index('idx_threads_buyer_id').on(table.buyerId),
    };
  }
);

// Messages table (§7.9, DESIGN_DOC §2.5)
export const messages = pgTable(
  'messages',
  {
    id: text('id').primaryKey(),
    threadId: text('thread_id')
      .notNull()
      .references(() => threads.id, { onDelete: 'cascade' }),
    senderId: text('sender_id').references(() => users.id, {
      onDelete: 'set null',
    }), // nullable: 退会時NULL→「退会済み」表示
    body: text('body').notNull(),
    messageType: varchar('message_type', { length: 20 })
      .default('text')
      .notNull(), // 'text' | 'template' | 'system'
    metadata: jsonb('metadata').$type<Record<string, unknown>>(), // 将来のAIテンプレート提案等
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    readAt: timestamp('read_at', { withTimezone: true }), // nullの場合は未読
  },
  (table) => {
    return {
      threadIdIdx: index('idx_messages_thread_id').on(table.threadId),
      senderIdIdx: index('idx_messages_sender_id').on(table.senderId),
      createdAtIdx: index('idx_messages_created_at').on(table.createdAt),
    };
  }
);
