// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusToggle } from '../status-toggle';

describe('StatusToggle', () => {
  it('renders with draft status by default', () => {
    const onChange = vi.fn();
    render(<StatusToggle value="draft" onChange={onChange} />);
    expect(screen.getByText('下書き')).toBeInTheDocument();
  });

  it('renders with public status', () => {
    const onChange = vi.fn();
    render(<StatusToggle value="public" onChange={onChange} />);
    expect(screen.getByText('公開')).toBeInTheDocument();
  });

  it('calls onChange when toggled from draft to public', () => {
    const onChange = vi.fn();
    render(<StatusToggle value="draft" onChange={onChange} />);
    const publicButton = screen.getByRole('button', { name: '公開' });
    fireEvent.click(publicButton);
    expect(onChange).toHaveBeenCalledWith('public');
  });

  it('calls onChange when toggled from public to draft', () => {
    const onChange = vi.fn();
    render(<StatusToggle value="public" onChange={onChange} />);
    const draftButton = screen.getByRole('button', { name: '下書き' });
    fireEvent.click(draftButton);
    expect(onChange).toHaveBeenCalledWith('draft');
  });

  it('shows visual indicator for active status', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <StatusToggle value="draft" onChange={onChange} />
    );
    const draftButton = screen.getByRole('button', { name: '下書き' });
    expect(draftButton).toHaveAttribute('data-active', 'true');

    rerender(<StatusToggle value="public" onChange={onChange} />);
    const publicButton = screen.getByRole('button', { name: '公開' });
    expect(publicButton).toHaveAttribute('data-active', 'true');
  });
});
