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

const { ManagementFaq } = await import('../templates/management-faq');

describe('ManagementFaq', () => {
  const defaultProps = {
    createdDate: '2026年2月7日',
  };

  it('renders without error', () => {
    const element = ManagementFaq(defaultProps);
    expect(element).toBeTruthy();
  });

  it('includes title', () => {
    const element = ManagementFaq(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('管理会社様向け FAQ');
  });

  it('includes tsumugi branding', () => {
    const element = ManagementFaq(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('tsumugi');
  });

  it('includes creation date', () => {
    const element = ManagementFaq(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('2026年2月7日');
  });

  it('includes default FAQ about what tsumugi is', () => {
    const element = ManagementFaq(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('tsumugiとは何ですか');
    expect(json).toContain('プラットフォーム');
  });

  it('includes FAQ about workload increase', () => {
    const element = ManagementFaq(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('業務は増えますか');
    expect(json).toContain('転送');
  });

  it('includes FAQ about trouble responsibility', () => {
    const element = ManagementFaq(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('トラブル');
    expect(json).toContain('責任分担');
  });

  it('includes FAQ about explaining to owners', () => {
    const element = ManagementFaq(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('オーナー');
    expect(json).toContain('相談資料');
  });

  it('includes FAQ about tenant inquiries', () => {
    const element = ManagementFaq(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('入居者から質問');
  });

  it('includes FAQ about costs', () => {
    const element = ManagementFaq(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('費用');
    expect(json).toContain('紹介フィー');
  });

  it('includes contact section with default email', () => {
    const element = ManagementFaq(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('お問い合わせ');
    expect(json).toContain('support@tsumugi.com');
  });

  it('uses custom contact email when provided', () => {
    const element = ManagementFaq({
      ...defaultProps,
      contactEmail: 'custom@example.com',
    });
    const json = JSON.stringify(element);
    expect(json).toContain('custom@example.com');
    expect(json).not.toContain('support@tsumugi.com');
  });

  it('uses custom FAQ items when provided', () => {
    const customFaq = [
      { question: 'Q. カスタム質問？', answer: 'カスタム回答です。' },
    ];
    const element = ManagementFaq({
      ...defaultProps,
      faqItems: customFaq,
    });
    const json = JSON.stringify(element);
    expect(json).toContain('カスタム質問');
    expect(json).toContain('カスタム回答');
    expect(json).not.toContain('tsumugiとは何ですか');
  });

  it('uses A4 page size', () => {
    const element = ManagementFaq(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('A4');
  });
});
