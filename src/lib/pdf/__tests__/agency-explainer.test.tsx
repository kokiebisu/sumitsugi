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

const { AgencyExplainer } = await import('../templates/agency-explainer');

describe('AgencyExplainer PDF Template', () => {
  const defaultProps = {
    createdDate: '2026/02/13',
  };

  it('renders without error', () => {
    const element = AgencyExplainer(defaultProps);
    expect(element).toBeTruthy();
  });

  it('uses A4 page size', () => {
    const element = AgencyExplainer(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('A4');
  });

  it('includes sumitsugi branding', () => {
    const element = AgencyExplainer(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('sumitsugi');
  });

  it('includes title', () => {
    const element = AgencyExplainer(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('仲介会社様向けご案内');
  });

  it('includes creation date', () => {
    const element = AgencyExplainer(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('2026/02/13');
  });

  it('includes section about what sumitsugi is', () => {
    const element = AgencyExplainer(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('sumitsugiとは');
    expect(json).toContain('プラットフォーム');
  });

  it('includes section about three benefits for agencies', () => {
    const element = AgencyExplainer(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('仲介会社様の3つのメリット');
    expect(json).toContain('成約数UP');
    expect(json).toContain('初期費用の削減');
    expect(json).toContain('新規客層の獲得');
  });

  it('emphasizes no workflow changes', () => {
    const element = AgencyExplainer(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('御社の業務フローは変わりません');
  });

  it('includes division of responsibilities section', () => {
    const element = AgencyExplainer(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('役割分担');
    expect(json).toContain('家具の引き継ぎ');
    expect(json).toContain('sumitsugiが担当');
    expect(json).toContain('賃貸契約');
    expect(json).toContain('仲介会社様が担当');
  });

  it('includes property list provision section', () => {
    const element = AgencyExplainer(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('物件リストの提供について');
  });

  it('includes contact section with default email', () => {
    const element = AgencyExplainer(defaultProps);
    const json = JSON.stringify(element);
    expect(json).toContain('お問い合わせ');
    expect(json).toContain('hello@sumitsugi.jp');
  });

  it('uses custom contact email when provided', () => {
    const element = AgencyExplainer({
      ...defaultProps,
      contactEmail: 'custom@example.com',
    });
    const json = JSON.stringify(element);
    expect(json).toContain('custom@example.com');
    expect(json).not.toContain('hello@sumitsugi.jp');
  });

  it('includes phone number when provided', () => {
    const element = AgencyExplainer({
      ...defaultProps,
      contactEmail: 'hello@sumitsugi.jp',
      contactPhone: '03-1234-5678',
    });
    const json = JSON.stringify(element);
    expect(json).toContain('03-1234-5678');
  });
});
