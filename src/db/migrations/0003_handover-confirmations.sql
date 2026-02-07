-- Handover Confirmations: buyer/seller completion tracking
-- Refs: TSU-98, task 3r3

-- ============================================================
-- 1. Handover Confirmations table
-- ============================================================
CREATE TABLE "handover_confirmations" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"buyer_id" text,
	"seller_id" text,
	"buyer_confirmed_at" timestamp with time zone,
	"seller_confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "handover_confirmations" ADD CONSTRAINT "handover_confirmations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "handover_confirmations" ADD CONSTRAINT "handover_confirmations_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "handover_confirmations" ADD CONSTRAINT "handover_confirmations_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "handover_confirmations" ADD CONSTRAINT "uq_handover_confirmations_property" UNIQUE("property_id");
