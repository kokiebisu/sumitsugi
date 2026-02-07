import { describe, it, expect } from 'vitest';
import {
  isAvailableFromMonth,
  getDaysUntilMoveOut,
  isUrgentMoveIn,
} from '../utils';

describe('isAvailableFromMonth', () => {
  it('returns true when move-out date is within the specified month', () => {
    // Move-out March 15, filter March → should be available
    expect(isAvailableFromMonth('2026-03-15', 2026, 3)).toBe(true);
  });

  it('returns true when move-out date is before the specified month', () => {
    // Move-out February 28, filter March → already moved out, available
    expect(isAvailableFromMonth('2026-02-28', 2026, 3)).toBe(true);
  });

  it('returns false when move-out date is after the specified month', () => {
    // Move-out April 15, filter March → not yet available
    expect(isAvailableFromMonth('2026-04-15', 2026, 3)).toBe(false);
  });

  it('returns true when move-out date is on the last day of the month', () => {
    // Move-out March 31, filter March → available at end of month
    expect(isAvailableFromMonth('2026-03-31', 2026, 3)).toBe(true);
  });

  it('returns false when move-out date is first day of next month', () => {
    // Move-out April 1, filter March → not available in March
    expect(isAvailableFromMonth('2026-04-01', 2026, 3)).toBe(false);
  });

  it('returns false when moveOutDate is undefined', () => {
    expect(isAvailableFromMonth(undefined, 2026, 3)).toBe(false);
  });

  it('handles February correctly (non-leap year)', () => {
    // 2027 is not a leap year, Feb has 28 days
    expect(isAvailableFromMonth('2027-02-28', 2027, 2)).toBe(true);
    expect(isAvailableFromMonth('2027-03-01', 2027, 2)).toBe(false);
  });

  it('handles February correctly (leap year)', () => {
    // 2028 is a leap year, Feb has 29 days
    expect(isAvailableFromMonth('2028-02-29', 2028, 2)).toBe(true);
    expect(isAvailableFromMonth('2028-03-01', 2028, 2)).toBe(false);
  });

  it('handles December to January year boundary', () => {
    expect(isAvailableFromMonth('2026-12-31', 2026, 12)).toBe(true);
    expect(isAvailableFromMonth('2027-01-01', 2026, 12)).toBe(false);
  });
});

describe('getDaysUntilMoveOut', () => {
  it('returns positive number for future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const result = getDaysUntilMoveOut(futureDate.toISOString().split('T')[0]);
    expect(result).toBe(10);
  });

  it('returns 0 for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getDaysUntilMoveOut(today)).toBe(0);
  });

  it('returns negative for past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const result = getDaysUntilMoveOut(pastDate.toISOString().split('T')[0]);
    expect(result).toBe(-5);
  });
});

describe('isUrgentMoveIn', () => {
  it('returns true for move-out within 30 days', () => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    expect(isUrgentMoveIn(date.toISOString().split('T')[0])).toBe(true);
  });

  it('returns false for move-out more than 30 days out', () => {
    const date = new Date();
    date.setDate(date.getDate() + 60);
    expect(isUrgentMoveIn(date.toISOString().split('T')[0])).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isUrgentMoveIn(undefined)).toBe(false);
  });

  it('returns false for past dates', () => {
    const date = new Date();
    date.setDate(date.getDate() - 5);
    expect(isUrgentMoveIn(date.toISOString().split('T')[0])).toBe(false);
  });
});
