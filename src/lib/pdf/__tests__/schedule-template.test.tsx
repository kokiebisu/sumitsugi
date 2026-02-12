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

const { ScheduleTemplate } = await import('../templates/schedule-template');

describe('ScheduleTemplate', () => {
  const defaultProps = {
    propertyAddress: '東京都渋谷区神宮前1-2-3',
    roomNumber: '301',
    sellerName: '山田太郎',
    buyerName: '佐藤花子',
    moveOutDate: '2026年3月31日',
    moveInDate: '2026年4月15日',
    steps: [
      {
        event: '退去',
        date: '2026年3月31日',
        person: '前の住人',
        notes: '荷物搬出完了',
      },
      { event: 'クリーニング', date: '2026年4月1日', person: '管理会社' },
      {
        event: '家具引き継ぎ確認',
        date: '2026年4月10日',
        person: '前の住人・次の住人',
      },
      { event: '鍵の引き渡し', date: '2026年4月14日', person: '管理会社' },
      { event: '入居', date: '2026年4月15日', person: '次の住人' },
    ],
    createdDate: '2026年2月7日',
  };

  it('renders without error', () => {
    const element = ScheduleTemplate(defaultProps);
    expect(element).toBeTruthy();
  });

  it('includes property address', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('東京都渋谷区神宮前1-2-3');
  });

  it('includes room number', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('301');
  });

  it('includes seller and buyer names', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('山田太郎');
    expect(json).toContain('佐藤花子');
  });

  it('includes move-out and move-in dates', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('2026年3月31日');
    expect(json).toContain('2026年4月15日');
  });

  it('includes all schedule steps', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('退去');
    expect(json).toContain('クリーニング');
    expect(json).toContain('家具引き継ぎ確認');
    expect(json).toContain('鍵の引き渡し');
    expect(json).toContain('入居');
  });

  it('includes step count in section title', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('日程タイムライン');
    expect(json).toContain(
      '"children":["3. 日程タイムライン（",5,"ステップ）"]'
    );
  });

  it('includes notes section', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('注意事項');
    expect(json).toContain('クリーニングは退去後');
  });

  it('includes approval section with three parties', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('確認・承認');
    expect(json).toContain('前の住人（甲）');
    expect(json).toContain('次の住人（乙）');
    expect(json).toContain('承認（管理会社）');
  });

  it('shows dash for missing step notes', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('—');
  });

  it('uses A4 page size', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('A4');
  });

  it('includes sumitsugi branding', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('sumitsugi');
  });

  it('includes creation date', () => {
    const element = ScheduleTemplate(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('2026年2月7日');
  });

  it('renders blank line when optional fields are not provided', () => {
    const propsWithoutOptional = {
      ...defaultProps,
      buyerName: undefined,
      moveOutDate: undefined,
      moveInDate: undefined,
    };
    const element = ScheduleTemplate(propsWithoutOptional);
    expect(element).toBeTruthy();
    const json = JSON.stringify(element);
    expect(json).not.toContain('佐藤花子');
  });

  it('shows 未定 for steps without date', () => {
    const propsWithUndecidedDate = {
      ...defaultProps,
      steps: [{ event: 'テスト', person: '管理会社' }],
    };
    const element = ScheduleTemplate(propsWithUndecidedDate);
    const json = JSON.stringify(element);
    expect(json).toContain('未定');
  });
});
