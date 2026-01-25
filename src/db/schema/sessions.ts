import { pgTable, uuid, varchar, timestamp, text, integer, primaryKey, index } from "drizzle-orm/pg-core";
import { users } from "./users";

// Sessions table for NextAuth.js
export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
}, (table) => {
  return {
    userIdIdx: index("idx_sessions_user_id").on(table.userId),
  };
});

// Accounts table for OAuth providers (NextAuth.js compatible)
export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 50 }),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
    userIdIdx: index("idx_accounts_user_id").on(table.userId),
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
