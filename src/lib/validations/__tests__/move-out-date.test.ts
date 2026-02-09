import { describe, it, expect, vi, afterEach } from 'vitest';
import { validateMoveOutDate } from '../move-out-date';

describe('validateMoveOutDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns error when moveOutDate is less than 1 month from now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01'));

    // 15 days from now
    const result = validateMoveOutDate('2026-03-16');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.warning).toBeUndefined();
  });

  it('returns error when moveOutDate is today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01'));

    const result = validateMoveOutDate('2026-03-01');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error when moveOutDate is in the past', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01'));

    const result = validateMoveOutDate('2026-02-15');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns warning when moveOutDate is 1-2 months from now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01'));

    // Exactly 1 month + 1 day from now (April 2)
    const result = validateMoveOutDate('2026-04-02');
    expect(result.valid).toBe(true);
    expect(result.warning).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('returns warning at exactly 1 month boundary', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01'));

    // Exactly 1 month from now (April 1)
    const result = validateMoveOutDate('2026-04-01');
    expect(result.valid).toBe(true);
    expect(result.warning).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('returns success when moveOutDate is more than 2 months from now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01'));

    // More than 2 months from now (May 2)
    const result = validateMoveOutDate('2026-05-02');
    expect(result.valid).toBe(true);
    expect(result.warning).toBeUndefined();
    expect(result.error).toBeUndefined();
  });

  it('returns success at exactly 2 months + 1 day boundary', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01'));

    const result = validateMoveOutDate('2026-05-02');
    expect(result.valid).toBe(true);
    expect(result.warning).toBeUndefined();
    expect(result.error).toBeUndefined();
  });

  it('returns error for empty string', () => {
    const result = validateMoveOutDate('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for invalid date string', () => {
    const result = validateMoveOutDate('not-a-date');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('error message is in Japanese', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01'));

    const result = validateMoveOutDate('2026-03-15');
    expect(result.error).toMatch(/1/);
  });

  it('warning message is in Japanese', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01'));

    const result = validateMoveOutDate('2026-04-15');
    expect(result.warning).toMatch(/2/);
  });
});
