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

  const navigateToDetails = () => {
    // Click "次へ" to go from intro to details
    const nextButton = screen.getByText('次へ');
    fireEvent.click(nextButton);
  };

  describe('isProCoordinated checkbox', () => {
    it('renders checkbox in details step', () => {
      render(<CreateListingFlow {...defaultProps} />);
      navigateToDetails();

      expect(
        screen.getByLabelText('プロにコーディネートされた部屋ですか？')
      ).toBeInTheDocument();
    });

    it('defaults to unchecked', () => {
      render(<CreateListingFlow {...defaultProps} />);
      navigateToDetails();

      const checkbox = screen.getByLabelText(
        'プロにコーディネートされた部屋ですか？'
      );
      expect(checkbox).not.toBeChecked();
    });

    it('can be toggled on and off', () => {
      render(<CreateListingFlow {...defaultProps} />);
      navigateToDetails();

      const checkbox = screen.getByLabelText(
        'プロにコーディネートされた部屋ですか？'
      );

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('includes isProCoordinated in submitted data when checked', () => {
      const onComplete = vi.fn();
      render(<CreateListingFlow {...defaultProps} onComplete={onComplete} />);
      navigateToDetails();

      // Check the pro-coordinated checkbox
      const checkbox = screen.getByLabelText(
        'プロにコーディネートされた部屋ですか？'
      );
      fireEvent.click(checkbox);

      // Fill required move-out date to proceed
      const dateInput = screen.getByLabelText('退去予定日', { exact: false });
      fireEvent.change(dateInput, { target: { value: '2026-06-01' } });

      // Go to confirm step
      const nextButton = screen.getByText('次へ');
      fireEvent.click(nextButton);

      // Submit
      const submitButton = screen.getByText('掲載する');
      fireEvent.click(submitButton);

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          isProCoordinated: true,
        })
      );
    });

    it('includes isProCoordinated as false in submitted data when unchecked', () => {
      const onComplete = vi.fn();
      render(<CreateListingFlow {...defaultProps} onComplete={onComplete} />);
      navigateToDetails();

      // Fill required move-out date to proceed without checking pro-coordinated
      const dateInput = screen.getByLabelText('退去予定日', { exact: false });
      fireEvent.change(dateInput, { target: { value: '2026-06-01' } });

      // Go to confirm step
      const nextButton = screen.getByText('次へ');
      fireEvent.click(nextButton);

      // Submit
      const submitButton = screen.getByText('掲載する');
      fireEvent.click(submitButton);

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          isProCoordinated: false,
        })
      );
    });

    it('does not block proceeding when unchecked (optional field)', () => {
      render(<CreateListingFlow {...defaultProps} />);
      navigateToDetails();

      // Fill required move-out date but leave checkbox unchecked
      const dateInput = screen.getByLabelText('退去予定日', { exact: false });
      fireEvent.change(dateInput, { target: { value: '2026-06-01' } });

      // Should be able to proceed
      const nextButton = screen.getByText('次へ');
      expect(nextButton).not.toBeDisabled();
    });
  });
});
