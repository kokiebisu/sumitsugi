// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HandoverConfirmation } from '../handover-confirmation';

vi.mock('@/app/actions/escrow', () => ({
  confirmHandoverCompletion: vi.fn(),
}));

import { confirmHandoverCompletion } from '@/app/actions/escrow';

describe('HandoverConfirmation', () => {
  const defaultProps = {
    propertyId: 'prop-123',
    userId: 'user-456',
    role: 'buyer' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render confirmation button for buyer', () => {
    render(<HandoverConfirmation {...defaultProps} />);

    expect(screen.getByText('引き継ぎ完了を確認')).toBeDefined();
    expect(
      screen.getByText(/次の住人として引き継ぎが完了したことを確認/)
    ).toBeDefined();
  });

  it('should render confirmation button for seller', () => {
    render(<HandoverConfirmation {...defaultProps} role="seller" />);

    expect(screen.getByText('引き継ぎ完了を確認')).toBeDefined();
    expect(
      screen.getByText(/前の住人として引き継ぎが完了したことを確認/)
    ).toBeDefined();
  });

  it('should show loading state while confirming', async () => {
    vi.mocked(confirmHandoverCompletion).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<HandoverConfirmation {...defaultProps} />);
    fireEvent.click(screen.getByText('引き継ぎ完了を確認'));

    await waitFor(() => {
      expect(screen.getByText('確認中...')).toBeDefined();
    });
  });

  it('should show success state after confirmation', async () => {
    vi.mocked(confirmHandoverCompletion).mockResolvedValue({
      success: true,
      bothConfirmed: false,
    });

    render(<HandoverConfirmation {...defaultProps} />);
    fireEvent.click(screen.getByText('引き継ぎ完了を確認'));

    await waitFor(() => {
      expect(screen.getByText('もう一方の確認を待っています。')).toBeDefined();
    });
  });

  it('should show both-confirmed message when both parties confirm', async () => {
    vi.mocked(confirmHandoverCompletion).mockResolvedValue({
      success: true,
      bothConfirmed: true,
    });

    render(<HandoverConfirmation {...defaultProps} />);
    fireEvent.click(screen.getByText('引き継ぎ完了を確認'));

    await waitFor(() => {
      expect(screen.getByText(/双方の確認が完了/)).toBeDefined();
    });
  });

  it('should show error state on failure', async () => {
    vi.mocked(confirmHandoverCompletion).mockResolvedValue({
      success: false,
      error: 'Database connection failed',
    });

    render(<HandoverConfirmation {...defaultProps} />);
    fireEvent.click(screen.getByText('引き継ぎ完了を確認'));

    await waitFor(() => {
      expect(screen.getByText(/Database connection failed/)).toBeDefined();
    });
  });

  it('should show already confirmed state', () => {
    render(<HandoverConfirmation {...defaultProps} alreadyConfirmed={true} />);

    expect(screen.getByText('もう一方の確認を待っています。')).toBeDefined();
  });

  it('should show both confirmed state with escrow info', () => {
    render(
      <HandoverConfirmation
        {...defaultProps}
        alreadyConfirmed={true}
        bothConfirmed={true}
      />
    );

    expect(screen.getByText(/双方の確認が完了/)).toBeDefined();
  });

  it('should call confirmHandoverCompletion with correct params', async () => {
    vi.mocked(confirmHandoverCompletion).mockResolvedValue({
      success: true,
      bothConfirmed: false,
    });

    render(<HandoverConfirmation {...defaultProps} />);
    fireEvent.click(screen.getByText('引き継ぎ完了を確認'));

    await waitFor(() => {
      expect(confirmHandoverCompletion).toHaveBeenCalledWith(
        'prop-123',
        'user-456',
        'buyer'
      );
    });
  });
});
