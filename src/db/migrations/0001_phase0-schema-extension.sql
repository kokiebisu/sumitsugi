-- Phase 0: Schema Extensions (properties, inquiries, threads, messages)
-- Refs: T-4, T-5, REQUIREMENTS.md §7.1-§7.9, DESIGN_DOC §2.5

-- ============================================================
-- 1. Properties: New columns
-- ============================================================
ALTER TABLE "properties" ADD COLUMN "core_set_price" integer;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "move_out_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "move_out_reason" varchar(50);
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "management_company_name" varchar(255);
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "management_consulted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "pdf_urls" jsonb;
--> statement-breakpoint

-- ============================================================
-- 2. Properties: Breaking change - landlord_consent boolean → JSONB
-- Data transformation: true → {"status":"approved"}, false/null → {"status":"pending"}
-- ============================================================
ALTER TABLE "properties" ADD COLUMN "landlord_consent_new" jsonb DEFAULT '{"status":"pending"}'::jsonb;
--> statement-breakpoint
UPDATE "properties" SET "landlord_consent_new" = CASE
  WHEN "landlord_consent" = true THEN '{"status":"approved"}'::jsonb
  ELSE '{"status":"pending"}'::jsonb
END;
--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "landlord_consent";
--> statement-breakpoint
ALTER TABLE "properties" RENAME COLUMN "landlord_consent_new" TO "landlord_consent";
--> statement-breakpoint

-- ============================================================
-- 3. Properties: Breaking change - furniture text[] → furniture_items JSONB
-- Data transformation: existing text[] → empty JSONB array []
-- (String array values cannot be auto-converted to FurnitureItem objects)
-- ============================================================
ALTER TABLE "properties" ADD COLUMN "furniture_items" jsonb;
--> statement-breakpoint
UPDATE "properties" SET "furniture_items" = '[]'::jsonb WHERE "furniture" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "furniture";
--> statement-breakpoint

-- ============================================================
-- 4. Inquiries: New columns (§7.2)
-- ============================================================
ALTER TABLE "inquiries" ADD COLUMN "duration" varchar(100);
--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "agreed_furniture_ids" text[];
--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "viewing_date" timestamp with time zone;
--> statement-breakpoint

-- ============================================================
-- 5. Threads table (§7.8, DESIGN_DOC §2.5)
-- ============================================================
CREATE TABLE "threads" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_buyer_id_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "uq_threads_property_seller_buyer" UNIQUE("property_id","seller_id","buyer_id");
--> statement-breakpoint
CREATE INDEX "idx_threads_property_id" ON "threads" USING btree ("property_id");
--> statement-breakpoint
CREATE INDEX "idx_threads_seller_id" ON "threads" USING btree ("seller_id");
--> statement-breakpoint
CREATE INDEX "idx_threads_buyer_id" ON "threads" USING btree ("buyer_id");
--> statement-breakpoint

-- ============================================================
-- 6. Messages table (§7.9, DESIGN_DOC §2.5)
-- ============================================================
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"sender_id" text,
	"body" text NOT NULL,
	"message_type" varchar(20) DEFAULT 'text' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_messages_thread_id" ON "messages" USING btree ("thread_id");
--> statement-breakpoint
CREATE INDEX "idx_messages_sender_id" ON "messages" USING btree ("sender_id");
--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "messages" USING btree ("created_at");
