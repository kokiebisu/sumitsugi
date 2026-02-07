import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';

vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) =>
    createElement('document', null, children),
  Page: ({ children, size }: { children: React.ReactNode; size: string }) =>
    createElement('page', { 'data-size': size }, children),
  Text: ({ children }: { children: React.ReactNode }) =>
    createElement('text', null, children),
  View: ({ children }: { children: React.ReactNode }) =>
    createElement('view', null, children),
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T) => styles,
  },
}));

const { SampleDocument } = await import('../templates/sample');

describe('SampleDocument', () => {
  const defaultProps = {
    title: 'テスト書類',
    propertyName: '渋谷区神宮前 1LDK',
    date: '2026-02-07',
  };

  it('renders without error', () => {
    const element = SampleDocument(defaultProps);
    expect(element).toBeTruthy();
  });

  it('includes the title in the output', () => {
    const element = SampleDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('テスト書類');
  });

  it('includes the property name', () => {
    const element = SampleDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('渋谷区神宮前 1LDK');
  });

  it('includes the date', () => {
    const element = SampleDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('2026-02-07');
  });

  it('includes description when provided', () => {
    const element = SampleDocument({
      ...defaultProps,
      description: 'サンプル説明文',
    });
    const json = JSON.stringify(element);
    expect(json).toContain('サンプル説明文');
  });

  it('omits description section when not provided', () => {
    const element = SampleDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).not.toContain('説明');
  });

  it('includes tsumugi branding', () => {
    const element = SampleDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('tsumugi');
    expect(json).toContain('住人の暮らしを引き継ぐ');
  });

  it('uses A4 page size', () => {
    const element = SampleDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('A4');
  });
});
