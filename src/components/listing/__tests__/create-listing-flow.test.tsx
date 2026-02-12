// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateListingFlow } from '../create-listing-flow';

describe('CreateListingFlow', () => {
  const defaultProps = {
    onComplete: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders intro step by default', () => {
    render(<CreateListingFlow {...defaultProps} />);
    expect(screen.getByText('ステップ1')).toBeInTheDocument();
  });

  it('navigates from intro to details step', () => {
    render(<CreateListingFlow {...defaultProps} />);
    const nextButton = screen.getByText('次へ');
    fireEvent.click(nextButton);
    expect(screen.getByText('物件の詳細')).toBeInTheDocument();
  });

  it('does not render pro-coordinated checkbox (removed in meeting #16)', () => {
    render(<CreateListingFlow {...defaultProps} />);
    // Navigate to details step
    fireEvent.click(screen.getByText('次へ'));

    expect(
      screen.queryByText('プロにコーディネートされた部屋ですか？')
    ).not.toBeInTheDocument();
  });
});
