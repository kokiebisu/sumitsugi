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

const { ConsentForm } = await import('../templates/consent-form');

describe('ConsentForm', () => {
  const defaultProps = {
    propertyAddress: '東京都渋谷区神宮前1-2-3',
    roomNumber: '301',
    sellerName: '山田太郎',
    buyerName: '佐藤花子',
    furnitureItems: [
      {
        name: 'ソファ',
        category: 'リビング',
        condition: '良好',
        remarks: '3人掛け',
      },
      { name: 'ダイニングテーブル', category: 'ダイニング', condition: '普通' },
      { name: 'デスクランプ', category: '書斎' },
    ],
    createdDate: '2026年2月7日',
  };

  it('renders without error', () => {
    const element = ConsentForm(defaultProps);
    expect(element).toBeTruthy();
  });

  it('includes property address', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('東京都渋谷区神宮前1-2-3');
  });

  it('includes room number', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('301');
  });

  it('includes seller name', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('山田太郎');
  });

  it('includes buyer name', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('佐藤花子');
  });

  it('includes all furniture items', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('ソファ');
    expect(json).toContain('ダイニングテーブル');
    expect(json).toContain('デスクランプ');
  });

  it('includes furniture count in section title', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('引き継ぎ対象物品');
    // Count rendered as separate children: ["3. 引き継ぎ対象物品（", 3, "点）"]
    expect(json).toContain('"children":["3. 引き継ぎ対象物品（",3,"点）"]');
  });

  it('includes terms and clauses', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('合意事項・責任分界');
    expect(json).toContain('現状有姿');
    expect(json).toContain('瑕疵');
  });

  it('includes signature section', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('署名');
    expect(json).toContain('前の住人（甲）');
    expect(json).toContain('次の住人（乙）');
    expect(json).toContain('承認（管理会社）');
  });

  it('shows dash for missing condition', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('—');
  });

  it('uses A4 page size', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('A4');
  });

  it('includes sumitsugi branding', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('sumitsugi');
  });

  it('includes creation date', () => {
    const element = ConsentForm(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('2026年2月7日');
  });

  it('renders blank line when buyer name is not provided', () => {
    const propsWithoutBuyer = { ...defaultProps, buyerName: undefined };
    const element = ConsentForm(propsWithoutBuyer);
    expect(element).toBeTruthy();
    const json = JSON.stringify(element);
    expect(json).not.toContain('佐藤花子');
  });
});
