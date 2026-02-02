-- Custom SQL migration file, put your code below! --
ALTER TABLE "stripe_accounts" RENAME COLUMN "onboarding_complete" TO "onboarding_completed";