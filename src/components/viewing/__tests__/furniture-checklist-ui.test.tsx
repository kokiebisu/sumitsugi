// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FurnitureChecklistUI } from '../furniture-checklist-ui';
import type { ChecklistItem } from '@/lib/furniture-checklist';

const mockItems: ChecklistItem[] = [
  {
    id: 'item-1',
    furnitureType: 'sofa',
    photos: ['/photos/sofa.jpg'],
    condition: 'good',
    notes: '2年使用',
    disposition: 'undecided',
  },
  {
    id: 'item-2',
    furnitureType: 'bed',
    photos: ['/photos/bed.jpg'],
    condition: 'excellent',
    disposition: 'undecided',
  },
  {
    id: 'item-3',
    furnitureType: 'desk',
    photos: [],
    condition: 'fair',
    disposition: 'keep',
  },
];

describe('FurnitureChecklistUI', () => {
  it('renders all furniture items with Japanese labels', () => {
    const onChange = vi.fn();
    render(
      <FurnitureChecklistUI
        items={mockItems}
        onItemChange={onChange}
        deadlineDate="2026年2月22日（土）"
      />
    );

    expect(screen.getByText('ソファ')).toBeInTheDocument();
    expect(screen.getByText('ベッド')).toBeInTheDocument();
    expect(screen.getByText('デスク')).toBeInTheDocument();
  });

  it('displays the 7-day deadline notice', () => {
    const onChange = vi.fn();
    render(
      <FurnitureChecklistUI
        items={mockItems}
        onItemChange={onChange}
        deadlineDate="2026年2月22日（土）"
      />
    );

    expect(screen.getByText(/2026年2月22日（土）/)).toBeInTheDocument();
    expect(screen.getByText(/7日以内/)).toBeInTheDocument();
  });

  it('calls onItemChange with keep when keep button is clicked', () => {
    const onChange = vi.fn();
    render(
      <FurnitureChecklistUI
        items={mockItems}
        onItemChange={onChange}
        deadlineDate="2026年2月22日（土）"
      />
    );

    const keepButtons = screen.getAllByRole('button', { name: '引き継ぐ' });
    fireEvent.click(keepButtons[0]);

    expect(onChange).toHaveBeenCalledWith('item-1', 'keep');
  });

  it('calls onItemChange with take_away when take_away button is clicked', () => {
    const onChange = vi.fn();
    render(
      <FurnitureChecklistUI
        items={mockItems}
        onItemChange={onChange}
        deadlineDate="2026年2月22日（土）"
      />
    );

    const takeAwayButtons = screen.getAllByRole('button', {
      name: '引き継がない',
    });
    fireEvent.click(takeAwayButtons[0]);

    expect(onChange).toHaveBeenCalledWith('item-1', 'take_away');
  });

  it('shows condition badge for items with condition', () => {
    const onChange = vi.fn();
    render(
      <FurnitureChecklistUI
        items={mockItems}
        onItemChange={onChange}
        deadlineDate="2026年2月22日（土）"
      />
    );

    expect(screen.getByText('良い')).toBeInTheDocument();
    expect(screen.getByText('とても良い')).toBeInTheDocument();
    expect(screen.getByText('普通')).toBeInTheDocument();
  });

  it('displays notes when present', () => {
    const onChange = vi.fn();
    render(
      <FurnitureChecklistUI
        items={mockItems}
        onItemChange={onChange}
        deadlineDate="2026年2月22日（土）"
      />
    );

    expect(screen.getByText('2年使用')).toBeInTheDocument();
  });

  it('highlights selected disposition for each item', () => {
    const onChange = vi.fn();
    render(
      <FurnitureChecklistUI
        items={mockItems}
        onItemChange={onChange}
        deadlineDate="2026年2月22日（土）"
      />
    );

    // item-3 has disposition 'keep', its keep button should have active styling
    const keepButtons = screen.getAllByRole('button', { name: '引き継ぐ' });
    // The third item's keep button (index 2) should be marked active
    expect(keepButtons[2]).toHaveAttribute('data-active', 'true');
  });

  it('shows summary of selections', () => {
    const onChange = vi.fn();
    render(
      <FurnitureChecklistUI
        items={mockItems}
        onItemChange={onChange}
        deadlineDate="2026年2月22日（土）"
      />
    );

    // 1 keep, 0 take_away, 2 undecided
    expect(screen.getByText(/引き継ぐ: 1/)).toBeInTheDocument();
    expect(screen.getByText(/未決定: 2/)).toBeInTheDocument();
  });

  it('disables interaction when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <FurnitureChecklistUI
        items={mockItems}
        onItemChange={onChange}
        deadlineDate="2026年2月22日（土）"
        disabled
      />
    );

    const keepButtons = screen.getAllByRole('button', { name: '引き継ぐ' });
    fireEvent.click(keepButtons[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not mutate the items array', () => {
    const originalItems = mockItems.map((item) => ({ ...item }));
    const onChange = vi.fn();
    render(
      <FurnitureChecklistUI
        items={mockItems}
        onItemChange={onChange}
        deadlineDate="2026年2月22日（土）"
      />
    );

    const keepButtons = screen.getAllByRole('button', { name: '引き継ぐ' });
    fireEvent.click(keepButtons[0]);

    expect(mockItems).toEqual(originalItems);
  });
});
