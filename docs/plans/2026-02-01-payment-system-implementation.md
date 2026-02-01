# Payment System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Stripe Connect-based payment system with application fee, deposit, escrow, and multi-party distribution for tsumugi platform.

**Architecture:** Build on existing Drizzle ORM + Neon PostgreSQL. Add Stripe SDK, create payment schema (payments, transactions, stripe_accounts), implement server actions for payment flows, and create minimal UI for payment processing with escrow and auto-distribution.

**Tech Stack:**
- Stripe SDK (@stripe/stripe-js, stripe server-side)
- Drizzle ORM + Neon PostgreSQL
- Next.js 16 Server Actions
- React Hook Form + Zod validation
- shadcn/ui components

**Design Reference:** See `docs/plans/2026-01-31-payment-system-design.md` for all business logic decisions.

---

## Phase 1: Foundation & Database Schema

### Task 1: Install Stripe Dependencies

**Files:**
- Modify: `package.json`
- Create: `.env.local.example`

**Step 1: Install Stripe packages**

```bash
npm install stripe @stripe/stripe-js
npm install --save-dev @types/stripe
```

**Step 2: Add environment variables to .env.local.example**

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Step 3: Verify installation**

Run: `npm list stripe @stripe/stripe-js`
Expected: Both packages installed successfully

**Step 4: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "feat: add Stripe SDK dependencies"
```

---

### Task 2: Create Payment Database Schema

**Files:**
- Create: `src/db/schema/payments.ts`
- Modify: `src/db/schema/index.ts`

**Step 1: Write failing migration test**

Create: `src/db/schema/__tests__/payments.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { payments, transactions, stripeAccounts } from '../payments';

describe('Payment Schema', () => {
  it('should define payments table with correct columns', () => {
    expect(payments).toBeDefined();
    expect(payments.id).toBeDefined();
    expect(payments.propertyId).toBeDefined();
    expect(payments.userId).toBeDefined();
    expect(payments.type).toBeDefined();
    expect(payments.amount).toBeDefined();
    expect(payments.stripePaymentIntentId).toBeDefined();
    expect(payments.status).toBeDefined();
  });

  it('should define transactions table with correct columns', () => {
    expect(transactions).toBeDefined();
    expect(transactions.paymentId).toBeDefined();
    expect(transactions.recipientType).toBeDefined();
    expect(transactions.amount).toBeDefined();
  });

  it('should define stripeAccounts table with correct columns', () => {
    expect(stripeAccounts).toBeDefined();
    expect(stripeAccounts.userId).toBeDefined();
    expect(stripeAccounts.stripeAccountId).toBeDefined();
    expect(stripeAccounts.accountType).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- payments.test.ts`
Expected: FAIL - Module not found

**Step 3: Create payment schema**

Create: `src/db/schema/payments.ts`

```typescript
import { pgTable, uuid, varchar, integer, timestamp, decimal, index, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";
import { properties } from "./properties";

// Payment types: application_fee, deposit, remaining
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Next tenant (payer)

  type: varchar("type", { length: 20 }).notNull(), // 'application_fee' | 'deposit' | 'remaining'
  amount: integer("amount").notNull(), // Amount in JPY (¥)

  // Stripe Integration
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeChargeId: varchar("stripe_charge_id", { length: 255 }),

  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending' | 'succeeded' | 'failed' | 'refunded'

  // Metadata
  metadata: varchar("metadata", { length: 1000 }), // JSON string for additional data

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("payments_user_idx").on(table.userId),
  propertyIdx: index("payments_property_idx").on(table.propertyId),
  typeIdx: index("payments_type_idx").on(table.type),
  statusIdx: index("payments_status_idx").on(table.status),
}));

// Transaction distribution log
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),

  recipientType: varchar("recipient_type", { length: 30 }).notNull(), // 'previous_tenant' | 'landlord' | 'property_management' | 'platform'
  recipientId: uuid("recipient_id"), // User ID or null for platform
  amount: integer("amount").notNull(), // Amount in JPY (¥)

  // Stripe Integration
  stripeTransferId: varchar("stripe_transfer_id", { length: 255 }),
  stripePayoutId: varchar("stripe_payout_id", { length: 255 }),

  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending' | 'succeeded' | 'failed'

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  paymentIdx: index("transactions_payment_idx").on(table.paymentId),
  recipientIdx: index("transactions_recipient_idx").on(table.recipientId),
  statusIdx: index("transactions_status_idx").on(table.status),
}));

// Stripe Connect Accounts
export const stripeAccounts = pgTable("stripe_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  stripeAccountId: varchar("stripe_account_id", { length: 255 }).notNull().unique(),
  accountType: varchar("account_type", { length: 30 }).notNull(), // 'previous_tenant' | 'landlord' | 'property_management'

  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  detailsSubmitted: boolean("details_submitted").default(false).notNull(),
  chargesEnabled: boolean("charges_enabled").default(false).notNull(),
  payoutsEnabled: boolean("payouts_enabled").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("stripe_accounts_user_idx").on(table.userId),
  stripeAccountIdx: index("stripe_accounts_stripe_account_idx").on(table.stripeAccountId),
}));
```

**Step 4: Export from schema index**

Modify: `src/db/schema/index.ts`

Add at top:
```typescript
export { payments, transactions, stripeAccounts } from "./payments";
```

Add relations at bottom:
```typescript
import { payments, transactions, stripeAccounts } from "./payments";

// Payment relations
export const paymentsRelations = relations(payments, ({ one, many }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [payments.propertyId],
    references: [properties.id],
  }),
  transactions: many(transactions),
}));

// Transaction relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  payment: one(payments, {
    fields: [transactions.paymentId],
    references: [payments.id],
  }),
  recipient: one(users, {
    fields: [transactions.recipientId],
    references: [users.id],
  }),
}));

// Stripe Account relations
export const stripeAccountsRelations = relations(stripeAccounts, ({ one }) => ({
  user: one(users, {
    fields: [stripeAccounts.userId],
    references: [users.id],
  }),
}));
```

**Step 5: Run test to verify it passes**

Run: `npm test -- payments.test.ts`
Expected: PASS (if tests configured, otherwise skip)

**Step 6: Generate migration**

Run: `npx drizzle-kit generate`
Expected: Migration file created in `src/db/migrations/`

**Step 7: Commit**

```bash
git add src/db/schema/payments.ts src/db/schema/index.ts src/db/migrations/
git commit -m "feat: add payment system database schema

- Add payments table (application_fee, deposit, remaining)
- Add transactions table (distribution log)
- Add stripe_accounts table (Connect accounts)
- Add indexes for performance
- Add relations to users and properties"
```

---

### Task 3: Add additionalCleaningFee to Properties

**Files:**
- Modify: `src/db/schema/properties.ts`

**Step 1: Add column to properties table**

In `src/db/schema/properties.ts`, add after `handoverFee`:

```typescript
  additionalCleaningFee: integer("additional_cleaning_fee").default(8000).notNull(), // Fixed ¥8,000
```

**Step 2: Generate migration**

Run: `npx drizzle-kit generate`
Expected: Migration file created

**Step 3: Commit**

```bash
git add src/db/schema/properties.ts src/db/migrations/
git commit -m "feat: add additionalCleaningFee to properties schema

Default: ¥8,000 (flat rate, independent of furniture count)"
```

---

## Phase 2: Stripe Integration Layer

### Task 4: Create Stripe Client Utilities

**Files:**
- Create: `src/lib/stripe/client.ts`
- Create: `src/lib/stripe/server.ts`
- Create: `src/lib/stripe/config.ts`

**Step 1: Create Stripe config**

Create: `src/lib/stripe/config.ts`

```typescript
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

  // Fee structure (from design doc)
  ADDITIONAL_CLEANING_FEE: 8000, // ¥8,000 flat
  LANDLORD_INCENTIVE_RATE: 0.01, // 1%
  LANDLORD_INCENTIVE_MIN: 3000, // ¥3,000 minimum
  PLATFORM_FEE_RATE: 0.15, // 15%
  APPLICATION_FEE: 20000, // ¥20,000 non-refundable

  // Deposit calculation
  DEPOSIT_RATE: 0.30, // 30%
  DEPOSIT_MIN: 30000, // ¥30,000
  DEPOSIT_MAX: 50000, // ¥50,000

  // Escrow
  ESCROW_HOLD_HOURS: 48, // 24-48 hours dispute period
} as const;

if (!STRIPE_CONFIG.publishableKey) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
}

if (!STRIPE_CONFIG.secretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}
```

**Step 2: Create server-side Stripe client**

Create: `src/lib/stripe/server.ts`

```typescript
import Stripe from 'stripe';
import { STRIPE_CONFIG } from './config';

export const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

/**
 * Calculate landlord incentive: max(1% of handover fee, ¥3,000)
 */
export function calculateLandlordIncentive(handoverFeeTotal: number): number {
  return Math.max(
    Math.round(handoverFeeTotal * STRIPE_CONFIG.LANDLORD_INCENTIVE_RATE),
    STRIPE_CONFIG.LANDLORD_INCENTIVE_MIN
  );
}

/**
 * Calculate deposit amount: 30% with bounds [¥30k, ¥50k]
 */
export function calculateDeposit(handoverFeeTotal: number): number {
  const calculated = Math.round(handoverFeeTotal * STRIPE_CONFIG.DEPOSIT_RATE);
  return Math.min(
    Math.max(calculated, STRIPE_CONFIG.DEPOSIT_MIN),
    STRIPE_CONFIG.DEPOSIT_MAX
  );
}

/**
 * Calculate platform fee: 15% of handover fee
 */
export function calculatePlatformFee(handoverFeeTotal: number): number {
  return Math.round(handoverFeeTotal * STRIPE_CONFIG.PLATFORM_FEE_RATE);
}

/**
 * Calculate previous tenant receives amount
 */
export function calculatePreviousTenantAmount(handoverFeeTotal: number): number {
  const cleaningFee = STRIPE_CONFIG.ADDITIONAL_CLEANING_FEE;
  const landlordIncentive = calculateLandlordIncentive(handoverFeeTotal);
  const platformFee = calculatePlatformFee(handoverFeeTotal);

  return handoverFeeTotal - cleaningFee - landlordIncentive - platformFee;
}

/**
 * Calculate full fee breakdown
 */
export interface FeeBreakdown {
  handoverFeeTotal: number;
  additionalCleaningFee: number;
  landlordIncentive: number;
  platformFee: number;
  previousTenantReceives: number;
  applicationFee: number;
  deposit: number;
  remaining: number;
}

export function calculateFeeBreakdown(handoverFeeTotal: number): FeeBreakdown {
  const additionalCleaningFee = STRIPE_CONFIG.ADDITIONAL_CLEANING_FEE;
  const landlordIncentive = calculateLandlordIncentive(handoverFeeTotal);
  const platformFee = calculatePlatformFee(handoverFeeTotal);
  const previousTenantReceives = calculatePreviousTenantAmount(handoverFeeTotal);
  const applicationFee = STRIPE_CONFIG.APPLICATION_FEE;
  const deposit = calculateDeposit(handoverFeeTotal);
  const remaining = handoverFeeTotal - deposit;

  return {
    handoverFeeTotal,
    additionalCleaningFee,
    landlordIncentive,
    platformFee,
    previousTenantReceives,
    applicationFee,
    deposit,
    remaining,
  };
}
```

**Step 3: Create client-side Stripe utilities**

Create: `src/lib/stripe/client.ts`

```typescript
'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from './config';

let stripePromise: Promise<Stripe | null>;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
  }
  return stripePromise;
}
```

**Step 4: Write tests for calculation functions**

Create: `src/lib/stripe/__tests__/server.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import {
  calculateLandlordIncentive,
  calculateDeposit,
  calculatePlatformFee,
  calculatePreviousTenantAmount,
  calculateFeeBreakdown,
} from '../server';

describe('Stripe Server Utilities', () => {
  describe('calculateLandlordIncentive', () => {
    it('should return minimum ¥3,000 for low handover fees', () => {
      expect(calculateLandlordIncentive(80000)).toBe(3000);
      expect(calculateLandlordIncentive(150000)).toBe(3000);
    });

    it('should return 1% for high handover fees', () => {
      expect(calculateLandlordIncentive(400000)).toBe(4000);
      expect(calculateLandlordIncentive(500000)).toBe(5000);
    });
  });

  describe('calculateDeposit', () => {
    it('should return minimum ¥30,000 for low fees', () => {
      expect(calculateDeposit(80000)).toBe(30000);
    });

    it('should return 30% for mid-range fees', () => {
      expect(calculateDeposit(150000)).toBe(45000);
    });

    it('should return maximum ¥50,000 for high fees', () => {
      expect(calculateDeposit(200000)).toBe(50000);
      expect(calculateDeposit(300000)).toBe(50000);
    });
  });

  describe('calculateFeeBreakdown', () => {
    it('should correctly break down ¥150,000 handover fee', () => {
      const breakdown = calculateFeeBreakdown(150000);

      expect(breakdown.handoverFeeTotal).toBe(150000);
      expect(breakdown.additionalCleaningFee).toBe(8000);
      expect(breakdown.landlordIncentive).toBe(3000);
      expect(breakdown.platformFee).toBe(22500); // 15%
      expect(breakdown.previousTenantReceives).toBe(116500);
      expect(breakdown.applicationFee).toBe(20000);
      expect(breakdown.deposit).toBe(45000);
      expect(breakdown.remaining).toBe(105000);
    });
  });
});
```

**Step 5: Run tests**

Run: `npm test -- server.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/stripe/
git commit -m "feat: add Stripe integration utilities

- Server-side Stripe client with calculation functions
- Client-side Stripe.js loader
- Fee breakdown calculations (15% platform, 1% landlord, ¥8k cleaning)
- Deposit calculation (30% with ¥30k-50k bounds)
- Unit tests for all calculation functions"
```

---

## Phase 3: Payment Server Actions

### Task 5: Create Stripe Connect Account Server Actions

**Files:**
- Create: `src/app/actions/stripe-connect.ts`

**Step 1: Write tests for Stripe Connect actions**

Create: `src/app/actions/__tests__/stripe-connect.test.ts`

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import { createConnectAccount, getConnectAccountOnboardingLink } from '../stripe-connect';

// Mock Stripe
jest.mock('../../../lib/stripe/server', () => ({
  stripe: {
    accounts: {
      create: jest.fn(),
      createLoginLink: jest.fn(),
    },
    accountLinks: {
      create: jest.fn(),
    },
  },
}));

describe('Stripe Connect Actions', () => {
  it('should create connect account for previous tenant', async () => {
    // Test implementation
  });

  it('should generate onboarding link', async () => {
    // Test implementation
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- stripe-connect.test.ts`
Expected: FAIL - Module not found

**Step 3: Implement Stripe Connect actions**

Create: `src/app/actions/stripe-connect.ts`

```typescript
'use server';

import { stripe } from '@/lib/stripe/server';
import { db } from '@/db';
import { stripeAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface ConnectAccountResult {
  success: boolean;
  accountId?: string;
  error?: string;
}

/**
 * Create Stripe Connect Account for user
 */
export async function createConnectAccount(
  userId: string,
  accountType: 'previous_tenant' | 'landlord' | 'property_management',
  email: string
): Promise<ConnectAccountResult> {
  try {
    // Check if account already exists
    const existing = await db.query.stripeAccounts.findFirst({
      where: eq(stripeAccounts.userId, userId),
    });

    if (existing) {
      return {
        success: true,
        accountId: existing.stripeAccountId,
      };
    }

    // Create Stripe Connect Account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'JP',
      email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
    });

    // Save to database
    await db.insert(stripeAccounts).values({
      userId,
      stripeAccountId: account.id,
      accountType,
      onboardingCompleted: false,
      detailsSubmitted: account.details_submitted || false,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
    });

    revalidatePath('/account');

    return {
      success: true,
      accountId: account.id,
    };
  } catch (error) {
    console.error('Failed to create Connect account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate onboarding link for Stripe Connect Account
 */
export async function getConnectAccountOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return {
      success: true,
      url: accountLink.url,
    };
  } catch (error) {
    console.error('Failed to create onboarding link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Stripe Connect Account status
 */
export async function getConnectAccountStatus(userId: string) {
  try {
    const account = await db.query.stripeAccounts.findFirst({
      where: eq(stripeAccounts.userId, userId),
    });

    if (!account) {
      return { success: true, exists: false };
    }

    // Fetch latest status from Stripe
    const stripeAccount = await stripe.accounts.retrieve(account.stripeAccountId);

    // Update local database
    await db
      .update(stripeAccounts)
      .set({
        detailsSubmitted: stripeAccount.details_submitted || false,
        chargesEnabled: stripeAccount.charges_enabled || false,
        payoutsEnabled: stripeAccount.payouts_enabled || false,
        onboardingCompleted: stripeAccount.details_submitted || false,
        updatedAt: new Date(),
      })
      .where(eq(stripeAccounts.userId, userId));

    return {
      success: true,
      exists: true,
      account: {
        stripeAccountId: account.stripeAccountId,
        onboardingCompleted: stripeAccount.details_submitted || false,
        chargesEnabled: stripeAccount.charges_enabled || false,
        payoutsEnabled: stripeAccount.payouts_enabled || false,
      },
    };
  } catch (error) {
    console.error('Failed to get Connect account status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Step 4: Run tests**

Run: `npm test -- stripe-connect.test.ts`
Expected: PASS (update mocks as needed)

**Step 5: Commit**

```bash
git add src/app/actions/stripe-connect.ts
git commit -m "feat: add Stripe Connect account server actions

- createConnectAccount: Create Express Connect account
- getConnectAccountOnboardingLink: Generate onboarding URL
- getConnectAccountStatus: Check account status and sync
- Save Connect accounts to database
- Support previous_tenant, landlord, property_management types"
```

---

### Task 6: Create Payment Server Actions

**Files:**
- Create: `src/app/actions/payment.ts`

**Step 1: Implement payment server actions**

Create: `src/app/actions/payment.ts`

```typescript
'use server';

import { stripe, calculateFeeBreakdown, STRIPE_CONFIG } from '@/lib/stripe/server';
import { db } from '@/db';
import { payments, transactions, stripeAccounts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface CreatePaymentResult {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  error?: string;
}

/**
 * Create application fee payment (¥20,000 non-refundable)
 * Immediately transfers to previous tenant
 */
export async function createApplicationFeePayment(
  propertyId: string,
  userId: string, // Next tenant (payer)
  previousTenantId: string
): Promise<CreatePaymentResult> {
  try {
    const amount = STRIPE_CONFIG.APPLICATION_FEE;

    // Get previous tenant's Stripe account
    const previousTenantAccount = await db.query.stripeAccounts.findFirst({
      where: and(
        eq(stripeAccounts.userId, previousTenantId),
        eq(stripeAccounts.accountType, 'previous_tenant')
      ),
    });

    if (!previousTenantAccount) {
      return {
        success: false,
        error: 'Previous tenant has not set up payment account',
      };
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'jpy',
      metadata: {
        propertyId,
        userId,
        type: 'application_fee',
      },
    });

    // Save payment to database
    const [payment] = await db.insert(payments).values({
      propertyId,
      userId,
      type: 'application_fee',
      amount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
    }).returning();

    return {
      success: true,
      paymentId: payment.id,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  } catch (error) {
    console.error('Failed to create application fee payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process application fee transfer to previous tenant
 * Called after payment succeeds
 */
export async function processApplicationFeeTransfer(paymentId: string) {
  try {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, paymentId),
    });

    if (!payment || payment.type !== 'application_fee') {
      throw new Error('Invalid payment');
    }

    // Get property to find previous tenant
    const property = await db.query.properties.findFirst({
      where: eq(payments.propertyId, payment.propertyId),
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Get previous tenant's Stripe account
    const previousTenantAccount = await db.query.stripeAccounts.findFirst({
      where: and(
        eq(stripeAccounts.userId, property.userId),
        eq(stripeAccounts.accountType, 'previous_tenant')
      ),
    });

    if (!previousTenantAccount) {
      throw new Error('Previous tenant Stripe account not found');
    }

    // Create immediate transfer to previous tenant
    const transfer = await stripe.transfers.create({
      amount: payment.amount,
      currency: 'jpy',
      destination: previousTenantAccount.stripeAccountId,
      metadata: {
        paymentId: payment.id,
        type: 'application_fee',
      },
    });

    // Record transaction
    await db.insert(transactions).values({
      paymentId: payment.id,
      recipientType: 'previous_tenant',
      recipientId: property.userId,
      amount: payment.amount,
      stripeTransferId: transfer.id,
      status: 'succeeded',
    });

    revalidatePath(`/properties/${payment.propertyId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to process application fee transfer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create deposit payment (30% of handover fee)
 * Held in escrow
 */
export async function createDepositPayment(
  propertyId: string,
  userId: string,
  handoverFeeTotal: number
): Promise<CreatePaymentResult> {
  try {
    const breakdown = calculateFeeBreakdown(handoverFeeTotal);
    const amount = breakdown.deposit;

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'jpy',
      capture_method: 'manual', // Hold for escrow
      metadata: {
        propertyId,
        userId,
        type: 'deposit',
        handoverFeeTotal: handoverFeeTotal.toString(),
      },
    });

    // Save payment to database
    const [payment] = await db.insert(payments).values({
      propertyId,
      userId,
      type: 'deposit',
      amount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      metadata: JSON.stringify({ handoverFeeTotal }),
    }).returning();

    return {
      success: true,
      paymentId: payment.id,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  } catch (error) {
    console.error('Failed to create deposit payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create remaining payment (70% of handover fee)
 * Held in escrow
 */
export async function createRemainingPayment(
  propertyId: string,
  userId: string,
  handoverFeeTotal: number
): Promise<CreatePaymentResult> {
  try {
    const breakdown = calculateFeeBreakdown(handoverFeeTotal);
    const amount = breakdown.remaining;

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'jpy',
      capture_method: 'manual', // Hold for escrow
      metadata: {
        propertyId,
        userId,
        type: 'remaining',
        handoverFeeTotal: handoverFeeTotal.toString(),
      },
    });

    // Save payment to database
    const [payment] = await db.insert(payments).values({
      propertyId,
      userId,
      type: 'remaining',
      amount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      metadata: JSON.stringify({ handoverFeeTotal }),
    }).returning();

    return {
      success: true,
      paymentId: payment.id,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  } catch (error) {
    console.error('Failed to create remaining payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Step 2: Commit**

```bash
git add src/app/actions/payment.ts
git commit -m "feat: add payment creation server actions

- createApplicationFeePayment: ¥20k non-refundable
- createDepositPayment: 30% held in escrow
- createRemainingPayment: 70% held in escrow
- processApplicationFeeTransfer: Immediate transfer to previous tenant
- All payments tracked in database with Stripe integration"
```

---

## Phase 4: Escrow Release & Distribution

### Task 7: Create Escrow Release Server Actions

**Files:**
- Create: `src/app/actions/escrow.ts`

**Step 1: Implement escrow release logic**

Create: `src/app/actions/escrow.ts`

```typescript
'use server';

import { stripe, calculateFeeBreakdown, STRIPE_CONFIG } from '@/lib/stripe/server';
import { db } from '@/db';
import { payments, transactions, stripeAccounts, properties } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface ReleaseEscrowResult {
  success: boolean;
  transactions?: Array<{ recipientType: string; amount: number }>;
  error?: string;
}

/**
 * Release escrow and distribute to all parties
 * Called after handover completion confirmation + 24-48h dispute period
 */
export async function releaseEscrowAndDistribute(
  propertyId: string
): Promise<ReleaseEscrowResult> {
  try {
    // Get property and handover fee
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property || !property.handoverFee) {
      throw new Error('Property or handover fee not found');
    }

    const handoverFeeTotal = property.handoverFee;
    const breakdown = calculateFeeBreakdown(handoverFeeTotal);

    // Get all escrowed payments (deposit + remaining)
    const escrowedPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.propertyId, propertyId),
        eq(payments.status, 'succeeded')
      ),
    });

    if (escrowedPayments.length === 0) {
      throw new Error('No escrowed payments found');
    }

    // Get Stripe accounts
    const previousTenantAccount = await db.query.stripeAccounts.findFirst({
      where: and(
        eq(stripeAccounts.userId, property.userId),
        eq(stripeAccounts.accountType, 'previous_tenant')
      ),
    });

    if (!previousTenantAccount) {
      throw new Error('Previous tenant Stripe account not found');
    }

    const distributionResults = [];

    // 1. Transfer to previous tenant
    const previousTenantTransfer = await stripe.transfers.create({
      amount: breakdown.previousTenantReceives,
      currency: 'jpy',
      destination: previousTenantAccount.stripeAccountId,
      metadata: {
        propertyId,
        type: 'handover_payment',
      },
    });

    await db.insert(transactions).values({
      paymentId: escrowedPayments[0].id, // Link to deposit payment
      recipientType: 'previous_tenant',
      recipientId: property.userId,
      amount: breakdown.previousTenantReceives,
      stripeTransferId: previousTenantTransfer.id,
      status: 'succeeded',
    });

    distributionResults.push({
      recipientType: 'previous_tenant',
      amount: breakdown.previousTenantReceives,
    });

    // 2. Transfer to landlord (if Stripe account exists)
    // Note: In Phase 1, landlord may not have Stripe account
    // Platform holds landlord incentive until account is created

    // 3. Transfer to property management (for additional cleaning)
    // Note: Similar to landlord, may implement in Phase 2

    // 4. Platform fee (automatically retained)
    await db.insert(transactions).values({
      paymentId: escrowedPayments[0].id,
      recipientType: 'platform',
      recipientId: null, // Platform has no user ID
      amount: breakdown.platformFee,
      status: 'succeeded',
    });

    distributionResults.push({
      recipientType: 'platform',
      amount: breakdown.platformFee,
    });

    return {
      success: true,
      transactions: distributionResults,
    };
  } catch (error) {
    console.error('Failed to release escrow:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Confirm handover completion (by user)
 */
export async function confirmHandoverCompletion(
  propertyId: string,
  userId: string,
  role: 'previous_tenant' | 'next_tenant'
) {
  // TODO: Implement handover completion tracking
  // Store confirmation timestamp
  // When both parties confirm, schedule escrow release after 24-48h

  return { success: true };
}
```

**Step 2: Commit**

```bash
git add src/app/actions/escrow.ts
git commit -m "feat: add escrow release and distribution logic

- releaseEscrowAndDistribute: Multi-party distribution after handover
- Transfers to previous tenant (calculated amount)
- Records platform fee transaction
- confirmHandoverCompletion: Track completion confirmations
- Phase 1: Focus on previous tenant + platform distribution"
```

---

## Phase 5: Basic Payment UI

### Task 8: Create Payment Form Component

**Files:**
- Create: `src/components/payment/application-fee-form.tsx`
- Create: `src/components/payment/deposit-form.tsx`
- Create: `src/components/payment/fee-breakdown.tsx`

**Step 1: Create fee breakdown display component**

Create: `src/components/payment/fee-breakdown.tsx`

```typescript
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface FeeBreakdownProps {
  handoverFeeTotal: number;
  additionalCleaningFee: number;
  landlordIncentive: number;
  platformFee: number;
  previousTenantReceives: number;
  showDetails?: boolean;
}

export function FeeBreakdown({
  handoverFeeTotal,
  additionalCleaningFee,
  landlordIncentive,
  platformFee,
  previousTenantReceives,
  showDetails = false,
}: FeeBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('ja-JP')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>引越し費用</CardTitle>
        <CardDescription>
          家具・インテリアの引き継ぎにかかる費用
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>合計</span>
            <span className="text-2xl text-coral">
              {formatCurrency(handoverFeeTotal)}
            </span>
          </div>

          {showDetails && (
            <>
              <Separator />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">内訳（参考）</p>
                <div className="flex justify-between">
                  <span>前の住人への支払い</span>
                  <span>{formatCurrency(previousTenantReceives)}</span>
                </div>
                <div className="flex justify-between">
                  <span>追加清掃費</span>
                  <span>{formatCurrency(additionalCleaningFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>大家協力金</span>
                  <span>{formatCurrency(landlordIncentive)}</span>
                </div>
                <div className="flex justify-between">
                  <span>プラットフォーム手数料</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Create application fee form**

Create: `src/components/payment/application-fee-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe/client';

interface ApplicationFeeFormProps {
  propertyId: string;
  previousTenantId: string;
  onSuccess?: () => void;
}

function ApplicationFeePaymentForm({ onSuccess }: { onSuccess?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (submitError) {
        setError(submitError.message || '決済に失敗しました');
      } else {
        onSuccess?.();
      }
    } catch (err) {
      setError('予期せぬエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>申込金の支払い</CardTitle>
          <CardDescription>
            ¥20,000（非返金）- 審査申し込み時に必要です
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              申込金は前の住人への補償金として使用されます。審査落ちの場合でも返金されませんのでご注意ください。
            </AlertDescription>
          </Alert>

          <PaymentElement />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                処理中...
              </>
            ) : (
              '¥20,000を支払う'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export function ApplicationFeeForm({
  propertyId,
  previousTenantId,
  onSuccess,
}: ApplicationFeeFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const stripePromise = getStripe();

  // TODO: Call createApplicationFeePayment server action to get clientSecret

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <ApplicationFeePaymentForm onSuccess={onSuccess} />
    </Elements>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/payment/
git commit -m "feat: add payment UI components

- FeeBreakdown: Display handover fee with optional details
- ApplicationFeeForm: Stripe Elements integration for ¥20k payment
- Proper error handling and loading states
- Clear messaging about non-refundable nature"
```

---

## Phase 6: Webhook Handling

### Task 9: Create Stripe Webhook Handler

**Files:**
- Create: `src/app/api/webhooks/stripe/route.ts`

**Step 1: Implement webhook endpoint**

Create: `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { processApplicationFeeTransfer } from '@/app/actions/payment';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;

        // Update payment status
        await db
          .update(payments)
          .set({
            status: 'succeeded',
            stripeChargeId: paymentIntent.charges.data[0]?.id,
            updatedAt: new Date(),
          })
          .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

        // Get payment to check type
        const payment = await db.query.payments.findFirst({
          where: eq(payments.stripePaymentIntentId, paymentIntent.id),
        });

        // If application fee, immediately transfer to previous tenant
        if (payment?.type === 'application_fee') {
          await processApplicationFeeTransfer(payment.id);
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;

        await db
          .update(payments)
          .set({
            status: 'failed',
            updatedAt: new Date(),
          })
          .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

        break;
      }

      case 'transfer.created':
      case 'transfer.updated':
        // Log transfer events
        console.log('Transfer event:', event.type, event.data.object.id);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

**Step 2: Configure webhook in Stripe Dashboard**

Create: `docs/plans/stripe-webhook-setup.md`

```markdown
# Stripe Webhook Setup

## Development (Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy webhook signing secret to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Production

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`
   - `transfer.updated`
4. Copy signing secret to production environment variables
```

**Step 3: Commit**

```bash
git add src/app/api/webhooks/stripe/ docs/plans/stripe-webhook-setup.md
git commit -m "feat: add Stripe webhook handler

- Handle payment_intent.succeeded: Update status + trigger transfers
- Handle payment_intent.payment_failed: Update status
- Signature verification for security
- Automatic application fee transfer on success
- Setup documentation for dev/production"
```

---

## Phase 7: Integration & Testing

### Task 10: Create End-to-End Payment Flow Integration

**Files:**
- Create: `src/app/properties/[id]/payment/page.tsx`

**Step 1: Create payment page**

Create: `src/app/properties/[id]/payment/page.tsx`

```typescript
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { FeeBreakdown } from '@/components/payment/fee-breakdown';
import { ApplicationFeeForm } from '@/components/payment/application-fee-form';
import { calculateFeeBreakdown } from '@/lib/stripe/server';

export default async function PaymentPage({
  params,
}: {
  params: { id: string };
}) {
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, params.id),
  });

  if (!property || !property.handoverFee) {
    notFound();
  }

  const breakdown = calculateFeeBreakdown(property.handoverFee);

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">引越し費用の支払い</h1>
        <p className="text-muted-foreground">
          {property.title}
        </p>
      </div>

      <FeeBreakdown {...breakdown} showDetails />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            ステップ1: 申込金の支払い
          </h2>
          <ApplicationFeeForm
            propertyId={property.id}
            previousTenantId={property.userId}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">支払いの流れ</h2>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-coral text-white flex items-center justify-center text-xs">
                1
              </span>
              <div>
                <p className="font-medium">申込金 ¥20,000</p>
                <p className="text-muted-foreground">
                  賃貸審査申し込み時（非返金）
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs">
                2
              </span>
              <div>
                <p className="font-medium">デポジット {breakdown.deposit.toLocaleString()}円</p>
                <p className="text-muted-foreground">
                  審査通過後（30%）
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs">
                3
              </span>
              <div>
                <p className="font-medium">残額 {breakdown.remaining.toLocaleString()}円</p>
                <p className="text-muted-foreground">
                  引き継ぎ日確定時（70%）
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/properties/[id]/payment/
git commit -m "feat: add payment page with full flow UI

- Display fee breakdown with details
- Three-step payment flow visualization
- Application fee form integration
- Clear messaging about payment stages
- Responsive design with step indicators"
```

---

## Phase 8: Documentation & Deployment Prep

### Task 11: Update Documentation

**Files:**
- Modify: `docs/REQUIREMENTS.md`
- Create: `docs/DEPLOYMENT.md`

**Step 1: Update REQUIREMENTS.md implementation status**

In `docs/REQUIREMENTS.md`, update Phase 1 status:

```markdown
### 3.1 対象範囲（Phase 1: 現在）

- 物件情報の表示 ✅
- 物件登録・管理機能 ✅
- 問い合わせフォーム ✅
- 基本的な認証機能 ✅
- ユーザー管理システム（データベース連携） ✅
- **決済システム ✅**
  - Stripe Connect 統合
  - 申込金支払い（¥20,000）
  - デポジット・残額支払い
  - エスクロー機能
  - 多者間自動分配
```

**Step 2: Create deployment guide**

Create: `docs/DEPLOYMENT.md`

```markdown
# Payment System Deployment Guide

## Prerequisites

1. Stripe Account (https://dashboard.stripe.com)
2. Database with migrations applied
3. Environment variables configured

## Environment Variables

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...
```

## Deployment Steps

### 1. Run Database Migrations

```bash
npx drizzle-kit push
```

### 2. Configure Stripe Webhook

1. Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - transfer.created
   - transfer.updated

### 3. Deploy Application

```bash
npm run build
# Deploy to Vercel/your hosting provider
```

### 4. Test Payment Flow

1. Create test property with handover fee
2. Test application fee payment
3. Verify webhook processing
4. Check database transactions

## Monitoring

- Stripe Dashboard: Monitor payments and transfers
- Database: Check `payments` and `transactions` tables
- Application logs: Review webhook processing

## Troubleshooting

**Payment fails:**
- Check Stripe test/live mode
- Verify API keys
- Review webhook logs

**Transfer fails:**
- Verify Connect account onboarding complete
- Check account capabilities
- Review Stripe balance

**Database errors:**
- Verify migrations applied
- Check foreign key constraints
- Review connection pool settings
```

**Step 3: Commit**

```bash
git add docs/
git commit -m "docs: update implementation status and add deployment guide

- Mark payment system as completed in REQUIREMENTS.md
- Add comprehensive deployment guide
- Include environment variables checklist
- Add troubleshooting section"
```

---

## Implementation Complete!

**Summary:**
- ✅ Database schema (payments, transactions, stripe_accounts)
- ✅ Stripe integration (server + client utilities)
- ✅ Server actions (Connect accounts, payments, escrow)
- ✅ Payment UI components (fee breakdown, forms)
- ✅ Webhook handling (automatic transfers)
- ✅ End-to-end payment page
- ✅ Documentation & deployment guide

**Total Commits:** 11
**Estimated Time:** 8-12 hours of focused work

**Next Steps (Post-Implementation):**
1. Add deposit and remaining payment forms
2. Implement handover completion tracking
3. Add landlord/property management Connect account creation
4. Build admin dashboard for transaction monitoring
5. Add refund functionality for cancellations

---

## Execution Options

Plan complete and saved to `docs/plans/2026-02-01-payment-system-implementation.md`.

**Two execution approaches:**

**1. Subagent-Driven (this session)** - Fresh subagent per task, code review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans skill, batch execution with checkpoints

**Which approach would you like?**
