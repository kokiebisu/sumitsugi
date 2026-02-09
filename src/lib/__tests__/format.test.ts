import { describe, it, expect } from 'vitest';
import { formatDateJa } from '../format';

describe('formatDateJa', () => {
  it('formats a date string to Japanese locale', () => {
    const result = formatDateJa('2026-04-15');
    expect(result).toBe('2026年4月15日');
  });

  it('formats a date with timezone offset correctly', () => {
    const result = formatDateJa('2026-12-25T00:00:00Z');
    // The exact output depends on the local timezone, but it should contain the year
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/12月/);
  });

  it('returns empty string for invalid date', () => {
    expect(formatDateJa('not-a-date')).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatDateJa('')).toBe('');
  });
});
