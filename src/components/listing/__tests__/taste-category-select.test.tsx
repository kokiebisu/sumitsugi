// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TasteCategorySelect } from '../taste-category-select';

describe('TasteCategorySelect', () => {
  it('renders with placeholder text when no value', () => {
    const onChange = vi.fn();
    render(<TasteCategorySelect value="" onChange={onChange} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('renders all 6 categories as options', () => {
    const onChange = vi.fn();
    render(<TasteCategorySelect value="" onChange={onChange} />);
    const options = screen.getAllByRole('option');
    // 6 categories + 1 placeholder
    expect(options).toHaveLength(7);
  });

  it('shows Japanese labels for each category', () => {
    const onChange = vi.fn();
    render(<TasteCategorySelect value="" onChange={onChange} />);
    expect(screen.getByText('ミニマル')).toBeInTheDocument();
    expect(screen.getByText('ナチュラル')).toBeInTheDocument();
    expect(screen.getByText('モダン')).toBeInTheDocument();
    expect(screen.getByText('和風')).toBeInTheDocument();
    expect(screen.getByText('インダストリアル')).toBeInTheDocument();
    expect(screen.getByText('ヴィンテージ')).toBeInTheDocument();
  });

  it('calls onChange when a category is selected', () => {
    const onChange = vi.fn();
    render(<TasteCategorySelect value="" onChange={onChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'minimal' } });
    expect(onChange).toHaveBeenCalledWith('minimal');
  });

  it('displays the selected value', () => {
    const onChange = vi.fn();
    render(<TasteCategorySelect value="modern" onChange={onChange} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('modern');
  });
});
