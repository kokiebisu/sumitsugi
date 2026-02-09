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
  Link: ({ children, src }: { children: React.ReactNode; src: string }) =>
    createElement('a', { href: src }, children),
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T) => styles,
  },
}));

const { ConsultationDocument } =
  await import('../templates/consultation-document');

describe('ConsultationDocument', () => {
  const defaultProps = {
    propertyName: '渋谷区神宮前 1LDK',
    propertyAddress: '東京都渋谷区神宮前1-2-3',
    moveOutDate: '2026年3月31日',
    sellerName: '山田太郎',
    furnitureItems: [
      { name: 'ソファ', category: 'コア', description: '3人掛け、良好' },
      { name: 'ダイニングテーブル', category: 'コア' },
      { name: 'デスクランプ', category: '追加', description: 'IKEA製' },
    ],
    createdDate: '2026年2月7日',
  };

  it('renders without error', () => {
    const element = ConsultationDocument(defaultProps);
    expect(element).toBeTruthy();
  });

  it('includes property name', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('渋谷区神宮前 1LDK');
  });

  it('includes property address', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('東京都渋谷区神宮前1-2-3');
  });

  it('includes move-out date', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('2026年3月31日');
  });

  it('includes seller name', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('山田太郎');
  });

  it('includes all furniture items', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('ソファ');
    expect(json).toContain('ダイニングテーブル');
    expect(json).toContain('デスクランプ');
  });

  it('includes furniture count in section title', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('暫定家具リスト');
    // Count is rendered as separate children: ["暫定家具リスト（", 3, "点）"]
    expect(json).toContain('"children":["暫定家具リスト（",3,"点）"]');
  });

  it('includes tsumugi branding', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('tsumugi');
  });

  it('includes tsumugi explanation section', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('tsumugiとは');
    expect(json).toContain('引き継ぎ');
  });

  it('includes action steps for management company', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('内容のご確認');
    expect(json).toContain('オーナー様への転送');
    expect(json).toContain('承認結果のご連絡');
  });

  it('uses A4 page size', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('A4');
  });

  it('shows dash for items without description', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('—');
  });

  it('includes creation date', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('2026年2月7日');
  });

  it('includes notes section, footer, and contact info', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('備考');
    expect(json).toContain('内見');
    expect(json).toContain('info@tsumugi.com');
    expect(json).toContain('tsumugi. All rights reserved');
    expect(json).toContain('https://tsumugi.com');
  });

  it('renders correctly with empty furniture list', () => {
    const propsWithNoFurniture = { ...defaultProps, furnitureItems: [] };
    const element = ConsultationDocument(propsWithNoFurniture);
    expect(element).toBeTruthy();
    const json = JSON.stringify(element);
    expect(json).toContain('"children":["暫定家具リスト（",0,"点）"]');
  });

  it('renders correctly with single furniture item', () => {
    const propsWithOne = {
      ...defaultProps,
      furnitureItems: [
        { name: 'ベッド', category: 'コア', description: 'シングル' },
      ],
    };
    const element = ConsultationDocument(propsWithOne);
    const json = JSON.stringify(element);
    expect(json).toContain('ベッド');
    expect(json).toContain('"children":["暫定家具リスト（",1,"点）"]');
  });

  it('includes furniture categories and descriptions', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('コア');
    expect(json).toContain('追加');
    expect(json).toContain('3人掛け、良好');
    expect(json).toContain('IKEA製');
  });

  it('includes all section headers and document title', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('残置物引き継ぎのご相談');
    expect(json).toContain('物件情報');
    expect(json).toContain('管理会社様へのお願い');
  });

  it('includes action step descriptions', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('本資料に記載の家具リスト');
    expect(json).toContain('物件オーナー（大家）様');
    expect(json).toContain('承認・条件付き承認・不承認');
  });

  it('includes table headers and property info labels', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('品名');
    expect(json).toContain('カテゴリ');
    expect(json).toContain('物件名');
    expect(json).toContain('所在地');
    expect(json).toContain('退去予定日');
    expect(json).toContain('前の住人');
  });

  it('explains furniture list is provisional', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('暫定');
    expect(json).toContain('最終的な引き継ぎ品目は合意時に確定');
  });
});
