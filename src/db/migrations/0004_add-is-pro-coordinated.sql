-- Add is_pro_coordinated boolean to properties
-- Refs: TSU-267, task tsumugi-x6s

ALTER TABLE "properties" ADD COLUMN "is_pro_coordinated" boolean DEFAULT false NOT NULL;
