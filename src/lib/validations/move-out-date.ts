/**
 * Move-out date validation with 2-tier checking.
 *
 * - ERROR: moveOutDate < 1 month from now (blocks submission)
 * - WARNING: moveOutDate 1-2 months from now (allows submission with warning)
 * - OK: moveOutDate > 2 months from now
 */

export interface MoveOutDateValidationResult {
  valid: boolean;
  warning?: string;
  error?: string;
}

/**
 * Add months to a date without mutation.
 * Handles month-end edge cases (e.g., Jan 31 + 1 month = Feb 28).
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  result.setMonth(targetMonth);
  // Handle overflow (e.g., Jan 31 -> Mar 3 instead of Feb 28)
  if (result.getMonth() > (date.getMonth() + months) % 12) {
    result.setDate(0); // Set to last day of previous month
  }
  return result;
}

/**
 * Validate a move-out date string with 2-tier validation:
 * - ERROR if date is invalid or less than 1 month from now
 * - WARNING if date is 1-2 months from now
 * - OK if date is more than 2 months from now
 */
export function validateMoveOutDate(
  dateString: string
): MoveOutDateValidationResult {
  if (!dateString || dateString.trim() === '') {
    return {
      valid: false,
      error: '退去予定日を入力してください',
    };
  }

  // Parse as local time to avoid UTC offset issues with date-only strings
  const moveOutDate = new Date(dateString + 'T00:00:00');
  if (isNaN(moveOutDate.getTime())) {
    return {
      valid: false,
      error: '有効な日付を入力してください',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  moveOutDate.setHours(0, 0, 0, 0);

  const oneMonthFromNow = addMonths(today, 1);
  const twoMonthsFromNow = addMonths(today, 2);

  if (moveOutDate < oneMonthFromNow) {
    return {
      valid: false,
      error:
        '退去予定日は1ヶ月以上先の日付を指定してください。直近の退去日では引き継ぎの準備が間に合いません。',
    };
  }

  if (moveOutDate <= twoMonthsFromNow) {
    return {
      valid: true,
      warning:
        '退去予定日まで2ヶ月以内です。早めに引き継ぎの準備を進めることをお勧めします。',
    };
  }

  return { valid: true };
}
