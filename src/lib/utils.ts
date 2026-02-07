import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 退去日までの残り日数を計算
 */
export function getDaysUntilMoveOut(moveOutDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const moveOut = new Date(moveOutDate);
  moveOut.setHours(0, 0, 0, 0);
  return Math.ceil(
    (moveOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * 即入居可能かどうか判定（退去日が30日以内）
 */
export function isUrgentMoveIn(moveOutDate: string | undefined): boolean {
  if (!moveOutDate) return false;
  const days = getDaysUntilMoveOut(moveOutDate);
  return days >= 0 && days <= 30;
}

/**
 * 指定年月以降に入居可能かどうか判定（F-508）
 * moveOutDate（退去日）が指定月の末日以前であれば、その月以降に入居可能とみなす
 */
export function isAvailableFromMonth(
  moveOutDate: string | undefined,
  year: number,
  month: number
): boolean {
  if (!moveOutDate) return false;
  const moveOut = new Date(moveOutDate);
  moveOut.setHours(0, 0, 0, 0);
  // 指定月の末日を計算（month is 1-indexed）
  const endOfMonth = new Date(year, month, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  return moveOut.getTime() <= endOfMonth.getTime();
}
