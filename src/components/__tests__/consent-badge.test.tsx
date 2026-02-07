import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';

vi.mock('lucide-react', () => ({
  CheckCircle2: ({ children, ...props }: Record<string, unknown>) =>
    createElement('svg', { 'data-icon': 'check-circle-2', ...props }, children),
  AlertCircle: ({ children, ...props }: Record<string, unknown>) =>
    createElement('svg', { 'data-icon': 'alert-circle', ...props }, children),
  XCircle: ({ children, ...props }: Record<string, unknown>) =>
    createElement('svg', { 'data-icon': 'x-circle', ...props }, children),
  Clock: ({ children, ...props }: Record<string, unknown>) =>
    createElement('svg', { 'data-icon': 'clock', ...props }, children),
  ShieldQuestion: ({ children, ...props }: Record<string, unknown>) =>
    createElement(
      'svg',
      { 'data-icon': 'shield-question', ...props },
      children
    ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

const { ConsentBadge } = await import('../consent-badge');

describe('ConsentBadge', () => {
  describe('inline variant', () => {
    it('renders approved status with green styling and checkmark', () => {
      const element = ConsentBadge({ status: 'approved', variant: 'inline' });
      const json = JSON.stringify(element);
      expect(json).toContain('大家承認済み');
      expect(json).toContain('bg-green-50');
      expect(json).toContain('text-green-700');
      expect(json).toContain('✓');
    });

    it('renders pending status with gray styling', () => {
      const element = ConsentBadge({ status: 'pending', variant: 'inline' });
      const json = JSON.stringify(element);
      expect(json).toContain('要確認');
      expect(json).toContain('bg-gray-100');
      expect(json).toContain('text-gray-600');
    });

    it('renders conditional status with yellow styling', () => {
      const element = ConsentBadge({
        status: 'conditional',
        variant: 'inline',
      });
      const json = JSON.stringify(element);
      expect(json).toContain('条件付き承認');
      expect(json).toContain('bg-yellow-50');
      expect(json).toContain('text-yellow-700');
    });

    it('renders rejected status with red styling', () => {
      const element = ConsentBadge({ status: 'rejected', variant: 'inline' });
      const json = JSON.stringify(element);
      expect(json).toContain('承認不可');
      expect(json).toContain('bg-red-50');
      expect(json).toContain('text-red-700');
    });

    it('renders expired status with gray styling', () => {
      const element = ConsentBadge({ status: 'expired', variant: 'inline' });
      const json = JSON.stringify(element);
      expect(json).toContain('期限切れ');
      expect(json).toContain('bg-gray-100');
      expect(json).toContain('text-gray-500');
    });
  });

  describe('overlay variant', () => {
    it('renders approved overlay with green background', () => {
      const element = ConsentBadge({ status: 'approved', variant: 'overlay' });
      const json = JSON.stringify(element);
      expect(json).toContain('大家承認済み');
      expect(json).toContain('bg-green-600');
      expect(json).toContain('absolute');
    });

    it('renders rejected overlay with red background', () => {
      const element = ConsentBadge({ status: 'rejected', variant: 'overlay' });
      const json = JSON.stringify(element);
      expect(json).toContain('承認不可');
      expect(json).toContain('bg-red-600');
    });

    it('defaults to overlay variant', () => {
      const element = ConsentBadge({ status: 'approved' });
      const json = JSON.stringify(element);
      expect(json).toContain('absolute');
      expect(json).toContain('shadow-md');
    });
  });

  describe('custom className', () => {
    it('accepts and applies custom className', () => {
      const element = ConsentBadge({
        status: 'approved',
        variant: 'inline',
        className: 'custom-class',
      });
      const json = JSON.stringify(element);
      expect(json).toContain('custom-class');
    });
  });

  describe('icon rendering', () => {
    it('renders an icon element for each status', () => {
      const statuses: Array<
        'pending' | 'conditional' | 'approved' | 'rejected' | 'expired'
      > = ['pending', 'conditional', 'approved', 'rejected', 'expired'];
      for (const status of statuses) {
        const element = ConsentBadge({ status, variant: 'inline' });
        const json = JSON.stringify(element);
        // Each badge should contain an icon with h-3 w-3 class
        expect(json).toContain('h-3 w-3');
      }
    });
  });

  describe('checkmark prefix', () => {
    it('only shows checkmark for approved status', () => {
      const approved = ConsentBadge({ status: 'approved', variant: 'inline' });
      const pending = ConsentBadge({ status: 'pending', variant: 'inline' });
      expect(JSON.stringify(approved)).toContain('✓');
      expect(JSON.stringify(pending)).not.toContain('✓');
    });
  });
});
