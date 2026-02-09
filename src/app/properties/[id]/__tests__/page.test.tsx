// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('@/components/header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock('@/components/footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('@/components/listing/price-comparison', () => ({
  PriceComparison: () => (
    <div data-testid="price-comparison">PriceComparison</div>
  ),
}));

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const createIcon = (name: string) => {
    const Icon = ({ className }: { className?: string }) => (
      <svg data-testid={`icon-${name}`} className={className} />
    );
    Icon.displayName = name;
    return Icon;
  };
  return {
    ...actual,
    ArrowLeft: createIcon('ArrowLeft'),
    Calendar: createIcon('Calendar'),
    MapPin: createIcon('MapPin'),
  };
});

const mockGetPropertyById = vi.fn();
vi.mock('@/lib/data', () => ({
  getPropertyById: (...args: unknown[]) => mockGetPropertyById(...args),
}));

vi.mock('@/lib/format', () => ({
  formatDateJa: (date: string) => date,
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

const { default: PropertyDetailPage } = await import('../page');

function makeProperty(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-1',
    title: 'Test Property',
    images: [],
    handoverFee: 60000,
    location: { neighborhood: 'Shibuya' },
    moveOutDate: '2026-03-01',
    layout: '1LDK',
    furniture: ['bed', 'desk'],
    ...overrides,
  };
}

describe('PropertyDetailPage', () => {
  describe('rental cost note', () => {
    it('displays rental cost note when handoverFee > 0', async () => {
      const property = makeProperty({ handoverFee: 60000 });
      mockGetPropertyById.mockReturnValue(property);

      const params = Promise.resolve({ id: 'test-1' });
      const element = await PropertyDetailPage({ params });
      render(element);

      expect(
        screen.getByText(
          /別途、賃貸初期費用（敷金・礼金・仲介手数料等）がかかります/
        )
      ).toBeInTheDocument();
    });

    it('does not display rental cost note when handoverFee is 0', async () => {
      const property = makeProperty({ handoverFee: 0 });
      mockGetPropertyById.mockReturnValue(property);

      const params = Promise.resolve({ id: 'test-1' });
      const element = await PropertyDetailPage({ params });
      render(element);

      expect(
        screen.queryByText(
          /別途、賃貸初期費用（敷金・礼金・仲介手数料等）がかかります/
        )
      ).not.toBeInTheDocument();
    });

    it('renders note with subdued styling (text-xs text-muted-foreground)', async () => {
      const property = makeProperty({ handoverFee: 50000 });
      mockGetPropertyById.mockReturnValue(property);

      const params = Promise.resolve({ id: 'test-1' });
      const element = await PropertyDetailPage({ params });
      render(element);

      const note = screen.getByText(
        /別途、賃貸初期費用（敷金・礼金・仲介手数料等）がかかります/
      );
      expect(note.className).toContain('text-xs');
      expect(note.className).toContain('text-muted-foreground');
    });
  });
});
