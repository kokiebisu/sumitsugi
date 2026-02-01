import Stripe from 'stripe';
import { STRIPE_CONFIG } from './config';

export const stripe = STRIPE_CONFIG.secretKey
  ? new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  : ({} as Stripe); // Mock for tests

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
