import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  image: text("image"), // NextAuth uses 'image' field
  emailVerified: timestamp("email_verified", { withTimezone: true }), // NextAuth uses timestamp
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

  // Authentication
  passwordHash: text("password_hash"),
  authProvider: varchar("auth_provider", { length: 50 }).default("email"),

  // Roles
  isSeller: boolean("is_seller").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const sellerProfiles = pgTable("seller_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").unique().notNull().references(() => users.id, { onDelete: "cascade" }),
  occupation: varchar("occupation", { length: 255 }).notNull(),
  bio: text("bio").notNull(),
  sellerSince: timestamp("seller_since", { withTimezone: true }).defaultNow().notNull(),

  // Social Links stored as JSONB for flexibility
  socialLinks: jsonb("social_links").$type<{
    instagram?: string;
    twitter?: string;
    website?: string;
    youtube?: string;
    tiktok?: string;
  }>().default({}),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
