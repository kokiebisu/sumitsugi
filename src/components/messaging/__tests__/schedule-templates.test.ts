import { describe, it, expect } from 'vitest';
import { SCHEDULE_TEMPLATES } from '../schedule-templates';

describe('SCHEDULE_TEMPLATES', () => {
  it('should have at least 3 templates', () => {
    expect(SCHEDULE_TEMPLATES.length).toBeGreaterThanOrEqual(3);
  });

  it('should contain non-empty strings', () => {
    for (const template of SCHEDULE_TEMPLATES) {
      expect(template.length).toBeGreaterThan(0);
    }
  });

  it('should have unique templates', () => {
    const unique = new Set(SCHEDULE_TEMPLATES);
    expect(unique.size).toBe(SCHEDULE_TEMPLATES.length);
  });
});
