import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';

vi.mock('lucide-react', () => ({
  MessageSquare: (props: Record<string, unknown>) =>
    createElement('svg', { 'data-icon': 'message-square', ...props }),
  Building2: (props: Record<string, unknown>) =>
    createElement('svg', { 'data-icon': 'building-2', ...props }),
  HelpCircle: (props: Record<string, unknown>) =>
    createElement('svg', { 'data-icon': 'help-circle', ...props }),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

const { ConsentPendingBanner } = await import('../consent-pending-banner');

describe('ConsentPendingBanner', () => {
  describe('consulted scenario', () => {
    it('shows consulted message when managementConsultedAt is set', () => {
      const element = ConsentPendingBanner({
        managementConsultedAt: '2025-01-15T10:00:00Z',
        managementCompanyName: '株式会社ABC管理',
      });
      const json = JSON.stringify(element);
      expect(json).toContain('管理会社に相談済み');
      expect(json).toContain('承認待ち');
    });

    it('uses blue/info styling for consulted state', () => {
      const element = ConsentPendingBanner({
        managementConsultedAt: '2025-01-15T10:00:00Z',
        managementCompanyName: '管理会社A',
      });
      const json = JSON.stringify(element);
      expect(json).toContain('bg-blue-50');
      expect(json).toContain('text-blue-700');
    });
  });

  describe('has management company but not consulted', () => {
    it('shows not-consulted message when company exists but no consultation date', () => {
      const element = ConsentPendingBanner({
        managementConsultedAt: null,
        managementCompanyName: '株式会社ABC管理',
      });
      const json = JSON.stringify(element);
      expect(json).toContain('管理会社あり');
      expect(json).toContain('未相談');
    });

    it('uses yellow/warning styling for not-consulted state', () => {
      const element = ConsentPendingBanner({
        managementConsultedAt: null,
        managementCompanyName: '管理会社B',
      });
      const json = JSON.stringify(element);
      expect(json).toContain('bg-yellow-50');
      expect(json).toContain('text-yellow-700');
    });
  });

  describe('no management company info', () => {
    it('shows no-info message when neither company nor consultation exists', () => {
      const element = ConsentPendingBanner({
        managementConsultedAt: null,
        managementCompanyName: null,
      });
      const json = JSON.stringify(element);
      expect(json).toContain('管理会社情報なし');
      expect(json).toContain('大家確認が必要');
    });

    it('uses gray/neutral styling for no-info state', () => {
      const element = ConsentPendingBanner({
        managementConsultedAt: null,
        managementCompanyName: null,
      });
      const json = JSON.stringify(element);
      expect(json).toContain('bg-gray-50');
      expect(json).toContain('text-gray-600');
    });

    it('treats undefined the same as null', () => {
      const element = ConsentPendingBanner({});
      const json = JSON.stringify(element);
      expect(json).toContain('管理会社情報なし');
      expect(json).toContain('大家確認が必要');
    });
  });

  describe('custom className', () => {
    it('accepts and applies custom className', () => {
      const element = ConsentPendingBanner({
        managementConsultedAt: null,
        managementCompanyName: null,
        className: 'custom-class',
      });
      const json = JSON.stringify(element);
      expect(json).toContain('custom-class');
    });
  });

  describe('icon rendering', () => {
    it('renders an icon for each banner state', () => {
      const consulted = ConsentPendingBanner({
        managementConsultedAt: '2025-01-15T10:00:00Z',
        managementCompanyName: 'ABC',
      });
      const hasCompany = ConsentPendingBanner({
        managementConsultedAt: null,
        managementCompanyName: 'ABC',
      });
      const noInfo = ConsentPendingBanner({
        managementConsultedAt: null,
        managementCompanyName: null,
      });

      // Each banner should have an icon with h-5 w-5 class
      for (const element of [consulted, hasCompany, noInfo]) {
        const json = JSON.stringify(element);
        expect(json).toContain('h-5 w-5');
      }
    });
  });
});
