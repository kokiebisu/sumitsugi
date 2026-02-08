// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from '../ui/star-rating';

describe('StarRating', () => {
  it('should render 5 star buttons', () => {
    render(<StarRating value={0} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('should display correct aria labels', () => {
    render(<StarRating value={3} />);
    expect(screen.getByLabelText('1星')).toBeTruthy();
    expect(screen.getByLabelText('3星')).toBeTruthy();
    expect(screen.getByLabelText('5星')).toBeTruthy();
  });

  it('should disable buttons in read-only mode', () => {
    render(<StarRating value={3} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('should enable buttons when onChange is provided', () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it('should call onChange with correct value on click', () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    const fourthStar = screen.getByLabelText('4星');
    fireEvent.click(fourthStar);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('should show numeric value when showValue is true', () => {
    render(<StarRating value={4.2} showValue />);
    expect(screen.getByText('4.2')).toBeTruthy();
  });

  it('should not show numeric value when value is 0', () => {
    render(<StarRating value={0} showValue />);
    expect(screen.queryByText('0.0')).toBeNull();
  });

  it('should show review count when provided', () => {
    render(<StarRating value={4} reviewCount={3} />);
    expect(screen.getByText('(3件)')).toBeTruthy();
  });

  it('should not show review count when zero', () => {
    render(<StarRating value={4} reviewCount={0} />);
    expect(screen.queryByText('(0件)')).toBeNull();
  });

  it('should not show review count when not provided', () => {
    render(<StarRating value={4} />);
    expect(screen.queryByText(/件/)).toBeNull();
  });
});
