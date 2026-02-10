// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceComparison } from '../listing/price-comparison';

describe('PriceComparison', () => {
  it('renders nothing when no furniture is provided', () => {
    const { container } = render(
      <PriceComparison furniture={[]} handoverFee={0} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when handover fee is 0', () => {
    const { container } = render(
      <PriceComparison furniture={['bed', 'desk']} handoverFee={0} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays new price comparison text', () => {
    render(<PriceComparison furniture={['bed', 'desk']} handoverFee={30000} />);
    expect(screen.getByText(/新品で揃えた場合/)).toBeDefined();
  });

  it('displays discount rate', () => {
    render(<PriceComparison furniture={['bed', 'desk']} handoverFee={30000} />);
    expect(screen.getByText(/新品の.*%の価格で引き継ぎ/)).toBeDefined();
  });

  it('displays handover fee amount', () => {
    render(<PriceComparison furniture={['bed', 'desk']} handoverFee={30000} />);
    expect(screen.getByText(/30,000/)).toBeDefined();
  });

  it('renders for single furniture item', () => {
    render(<PriceComparison furniture={['bed']} handoverFee={20000} />);
    expect(screen.getByText(/新品で揃えた場合/)).toBeDefined();
  });
});
