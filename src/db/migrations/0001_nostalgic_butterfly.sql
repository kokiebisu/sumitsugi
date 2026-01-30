ALTER TABLE "properties" ADD COLUMN "estimated_duration" varchar(50);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "landlord_consent" boolean DEFAULT false;