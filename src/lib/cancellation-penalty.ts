/**
 * キャンセルペナルティ計算
 *
 * 引き継ぎフローの各段階におけるキャンセル時のペナルティと
 * 返金額を計算する。ビジネスルール:
 *
 * - 内見前: 無料キャンセル
 * - 申込金支払い後:
 *   - 次の住人都合: 申込金没収
 *   - 前の住人都合: 全額返金
 *   - 審査落ち: 全額返金
 * - 残額支払い後:
 *   - 次の住人都合: 引越し費用の20%（最低¥30,000、最高¥50,000）
 *   - 前の住人都合: 全額返金
 *   - 双方合意: 全額返金
 *
 * Ref: docs/requirements/payment.md §12.5, .claude/BUSINESS.md §キャンセル
 */

/** 申込金（固定） */
export const DEPOSIT_AMOUNT = 20000;

/** ペナルティ率（引越し費用に対する割合） */
const PENALTY_RATE = 0.2;

/** ペナルティ最低額 */
const PENALTY_MIN = 30000;

/** ペナルティ最高額 */
const PENALTY_MAX = 50000;

export type CancelledBy = 'buyer' | 'seller' | 'screening_failure' | 'mutual';

export type CancellationPhase =
  | 'pre_viewing'
  | 'post_deposit'
  | 'post_remaining_payment';

export interface CancellationInput {
  cancelledBy: CancelledBy;
  phase: CancellationPhase;
  handoverFee: number;
  depositPaid: number;
  remainingPaid: number;
}

export interface CancellationResult {
  penaltyAmount: number;
  refundAmount: number;
  depositForfeited: boolean;
  reason: string;
  cancelledBy: CancelledBy;
  phase: CancellationPhase;
}

/**
 * Calculates the cancellation penalty and refund amount.
 */
export function calculatePenalty(input: CancellationInput): CancellationResult {
  const { cancelledBy, phase, handoverFee, depositPaid, remainingPaid } = input;

  if (depositPaid < 0 || remainingPaid < 0 || handoverFee < 0) {
    throw new Error('金額は0以上である必要があります');
  }

  const totalPaid = depositPaid + remainingPaid;

  // Pre-viewing: always free
  if (phase === 'pre_viewing') {
    return {
      penaltyAmount: 0,
      refundAmount: 0,
      depositForfeited: false,
      reason: '内見前のキャンセルは無料です',
      cancelledBy,
      phase,
    };
  }

  // Seller cancellation or screening failure or mutual: full refund
  if (
    cancelledBy === 'seller' ||
    cancelledBy === 'screening_failure' ||
    cancelledBy === 'mutual'
  ) {
    const reason =
      cancelledBy === 'seller'
        ? '前の住人都合のキャンセルのため全額返金'
        : cancelledBy === 'screening_failure'
          ? '審査落ちのため全額返金'
          : '双方合意のキャンセルのため全額返金';

    return {
      penaltyAmount: 0,
      refundAmount: totalPaid,
      depositForfeited: false,
      reason,
      cancelledBy,
      phase,
    };
  }

  // Buyer cancellation post-deposit (before remaining payment)
  if (phase === 'post_deposit') {
    return {
      penaltyAmount: depositPaid,
      refundAmount: 0,
      depositForfeited: true,
      reason: '次の住人都合のキャンセルのため申込金は返金されません',
      cancelledBy,
      phase,
    };
  }

  // Buyer cancellation post-remaining payment
  const rawPenalty = handoverFee * PENALTY_RATE;
  const clampedPenalty = Math.min(
    PENALTY_MAX,
    Math.max(PENALTY_MIN, rawPenalty)
  );
  const penaltyAmount = Math.min(totalPaid, clampedPenalty);
  const refundAmount = totalPaid - penaltyAmount;

  return {
    penaltyAmount,
    refundAmount: Math.max(0, refundAmount),
    depositForfeited: false,
    reason: `次の住人都合のキャンセルのため引越し費用の20%（¥${penaltyAmount.toLocaleString()}）が差し引かれます`,
    cancelledBy,
    phase,
  };
}
