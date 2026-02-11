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
  Image: ({ src }: { src: string }) => createElement('img', { src }),
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

  it('does not include large tsumugi logo in header', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    // The header should NOT contain a standalone "tsumugi" text element as a logo
    // Header should only have property name and creation date
    const parsed = JSON.parse(json) as any;
    // Find the first view child of page (the header)
    const page = parsed.props.children;
    const header = page.props.children[0];
    const headerJson = JSON.stringify(header);
    // Header should not contain standalone 'tsumugi' branded text
    expect(headerJson).not.toContain('"children":"tsumugi"');
  });

  it('includes property name in header', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    // Header should show property name
    const parsed = JSON.parse(json) as any;
    const page = parsed.props.children;
    const header = page.props.children[0];
    const headerJson = JSON.stringify(header);
    expect(headerJson).toContain('渋谷区神宮前 1LDK');
  });

  it('includes tsumugi annotation in footer', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('tsumugi（紡ぎ）');
  });

  it('includes FAQ URL in footer pointing to for-managers page', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('/for-managers');
  });

  it('does not include tsumugi explanation section (branding minimal)', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).not.toContain('tsumugiとは');
  });

  it('includes resident-authored handover explanation', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('家具引き継ぎについて');
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

  it('includes notes section and contact info', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('備考');
    expect(json).toContain('内見');
    expect(json).toContain('info@tsumugi.com');
  });

  it('includes footer with tsumugi annotation and FAQ URL', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('tsumugi（紡ぎ）');
    expect(json).toContain('/for-managers');
  });

  it('renders QR code image when faqQrCodeDataUrl is provided', () => {
    const propsWithQr = {
      ...defaultProps,
      faqQrCodeDataUrl: 'data:image/png;base64,TESTQRCODE',
    };
    const element = ConsultationDocument(propsWithQr);
    const json = JSON.stringify(element);
    expect(json).toContain('data:image/png;base64,TESTQRCODE');
  });

  it('does not render QR code image when faqQrCodeDataUrl is omitted', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).not.toContain('data:image/png;base64,');
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

  it('uses neutral title without sales pitch', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('家具引き継ぎのご相談');
    expect(json).not.toContain('残置物引き継ぎのご相談');
    expect(json).toContain('物件情報');
    expect(json).toContain('管理会社様へのお願い');
  });

  it('uses neutral colors for section titles and step badges', () => {
    const element = ConsultationDocument(defaultProps);
    const json = JSON.stringify(element);
    const parsed = JSON.parse(json) as any;
    const page = parsed.props.children;
    // Get the main content children (excluding footer)
    const children = page.props.children;
    // Footer is the last child — check everything before it uses neutral colors
    const contentJson = JSON.stringify(children.slice(0, children.length - 1));
    expect(contentJson).not.toContain('"color":"#FF5A5F"');
    expect(contentJson).not.toContain('"backgroundColor":"#FF5A5F"');
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
