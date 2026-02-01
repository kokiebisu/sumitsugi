CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_charge_id" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "stripe_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_account_id" text NOT NULL,
	"account_type" varchar(50) DEFAULT 'express' NOT NULL,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"details_submitted" boolean DEFAULT false NOT NULL,
	"charges_enabled" boolean DEFAULT false NOT NULL,
	"payouts_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stripe_accounts_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "stripe_accounts_stripe_account_id_unique" UNIQUE("stripe_account_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"recipient_type" varchar(50) NOT NULL,
	"recipient_id" uuid,
	"amount" integer NOT NULL,
	"stripe_transfer_id" text,
	"stripe_payout_id" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_accounts" ADD CONSTRAINT "stripe_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_payments_property_id" ON "payments" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_payments_user_id" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_type" ON "payments" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_payments_stripe_payment_intent_id" ON "payments" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "idx_stripe_accounts_user_id" ON "stripe_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_stripe_accounts_stripe_account_id" ON "stripe_accounts" USING btree ("stripe_account_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_payment_id" ON "transactions" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_recipient_type" ON "transactions" USING btree ("recipient_type");--> statement-breakpoint
CREATE INDEX "idx_transactions_recipient_id" ON "transactions" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_status" ON "transactions" USING btree ("status");