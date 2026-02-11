// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
  }),
}));

vi.mock('@/components/auth/custom-signup-dialog', () => ({
  CustomSignupDialog: () => null,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
}));

const { PropertySidebar } = await import('../property-sidebar');

function makeProperty(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-1',
    title: 'Test Property',
    images: [],
    handoverFee: 60000,
    area: '渋谷区',
    status: 'public' as const,
    ...overrides,
  };
}

describe('PropertySidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rental cost note', () => {
    it('displays rental cost note below handover fee', () => {
      const property = makeProperty({ handoverFee: 60000 });
      render(<PropertySidebar property={property} />);

      expect(
        screen.getByText(
          /賃貸の初期費用（敷金・礼金・仲介手数料等）は別途かかります/
        )
      ).toBeInTheDocument();
    });

    it('renders note with subdued styling', () => {
      const property = makeProperty({ handoverFee: 50000 });
      render(<PropertySidebar property={property} />);

      const note = screen.getByText(
        /賃貸の初期費用（敷金・礼金・仲介手数料等）は別途かかります/
      );
      expect(note.className).toContain('text-xs');
      expect(note.className).toContain('text-muted-foreground');
    });

    it('displays handover fee amount', () => {
      const property = makeProperty({ handoverFee: 60000 });
      render(<PropertySidebar property={property} />);

      expect(screen.getByText('¥60,000')).toBeInTheDocument();
    });

    it('displays rent when available', () => {
      const property = makeProperty({ rent: 120000 });
      render(<PropertySidebar property={property} />);

      expect(screen.getByText('¥120,000/月')).toBeInTheDocument();
    });
  });
});
