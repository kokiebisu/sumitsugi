export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Fee structure (from design doc)
  ADDITIONAL_CLEANING_FEE: 8000, // ¥8,000 flat
  LANDLORD_INCENTIVE_RATE: 0.01, // 1%
  LANDLORD_INCENTIVE_MIN: 3000, // ¥3,000 minimum
  PLATFORM_FEE_RATE: 0.15, // 15%
  APPLICATION_FEE: 20000, // ¥20,000 non-refundable

  // Deposit calculation
  DEPOSIT_RATE: 0.3, // 30%
  DEPOSIT_MIN: 30000, // ¥30,000
  DEPOSIT_MAX: 50000, // ¥50,000

  // Escrow
  ESCROW_HOLD_HOURS: 48, // 24-48 hours dispute period
} as const;

// Only validate in production runtime, not in tests or CI builds
// CI builds may not have Stripe secrets available, and that's OK
// The actual Stripe client will fail at runtime if secrets are needed but missing
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST;
const isCIBuild = process.env.CI === 'true';
const isServerSide = typeof window === 'undefined';

if (isServerSide && !isTestEnv && !isCIBuild) {
  // Server-side runtime validation only
  if (!STRIPE_CONFIG.secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
}

if (!isTestEnv && !isCIBuild && !STRIPE_CONFIG.publishableKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable'
  );
}
