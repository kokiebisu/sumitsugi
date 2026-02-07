-- Management Company Integration: email field + email_logs table
-- Refs: TSU-20, task 3j1

-- ============================================================
-- 1. Properties: Add management company email
-- ============================================================
ALTER TABLE "properties" ADD COLUMN "management_company_email" varchar(320);
--> statement-breakpoint

-- ============================================================
-- 2. Email Logs table (sending history)
-- ============================================================
CREATE TABLE "email_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"recipient_email" varchar(320) NOT NULL,
	"email_type" varchar(50) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'sent' NOT NULL,
	"pdf_url" text,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_email_logs_property_id" ON "email_logs" USING btree ("property_id");
--> statement-breakpoint
CREATE INDEX "idx_email_logs_email_type" ON "email_logs" USING btree ("email_type");
--> statement-breakpoint
CREATE INDEX "idx_email_logs_sent_at" ON "email_logs" USING btree ("sent_at");
