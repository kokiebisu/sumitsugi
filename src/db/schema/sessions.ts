import { pgTable, uuid, varchar, timestamp, text, integer, primaryKey, index } from "drizzle-orm/pg-core";
import { users } from "./users";

// Sessions table for NextAuth.js
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionToken: varchar("session_token", { length: 255 }).unique().notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("idx_sessions_user_id").on(table.userId),
    expiresIdx: index("idx_sessions_expires").on(table.expires),
  };
});

// Accounts table for OAuth providers
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'oauth' | 'email'
  provider: varchar("provider", { length: 50 }).notNull(), // 'google' | 'apple' | 'email'
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),

  // OAuth tokens
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: varchar("token_type", { length: 50 }),
  scope: text("scope"),
  idToken: text("id_token"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("idx_accounts_user_id").on(table.userId),
    providerAccountIdIdx: index("idx_accounts_provider_account_id").on(table.provider, table.providerAccountId),
  };
});

// Verification tokens for email verification
export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(), // Email address
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  };
});
