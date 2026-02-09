// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FurnitureForm } from '../furniture-form';
import {
  DEFAULT_NEW_PRICES,
  type FurnitureFormItem,
} from '@/lib/validations/furniture';

// Mock crypto.randomUUID for stable IDs
let uuidCounter = 0;
beforeEach(() => {
  uuidCounter = 0;
  vi.stubGlobal('crypto', {
    randomUUID: () => `test-uuid-${++uuidCounter}`,
  });
});

describe('FurnitureForm', () => {
  it('renders empty state with add button', () => {
    const onChange = vi.fn();
    render(<FurnitureForm items={[]} onChange={onChange} />);
    expect(screen.getByText('家具を追加')).toBeInTheDocument();
  });

  it('renders core and additional sections', () => {
    const onChange = vi.fn();
    render(<FurnitureForm items={[]} onChange={onChange} />);
    expect(screen.getByText('コアセット')).toBeInTheDocument();
    expect(screen.getByText('追加家具')).toBeInTheDocument();
  });

  it('adds a new furniture item when add button is clicked', () => {
    const onChange = vi.fn();
    render(<FurnitureForm items={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText('家具を追加'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const newItems = onChange.mock.calls[0][0];
    expect(newItems).toHaveLength(1);
    expect(newItems[0].category).toBe('additional');
  });

  it('displays existing items grouped by category', () => {
    const items: FurnitureFormItem[] = [
      {
        id: 'core-1',
        name: 'リビングソファ',
        category: 'core',
        furnitureCategory: 'sofa',
        newPrice: 50000,
      },
      {
        id: 'add-1',
        name: 'デスクランプ',
        category: 'additional',
        furnitureCategory: 'lighting',
        newPrice: 10000,
      },
    ];
    const onChange = vi.fn();
    render(<FurnitureForm items={items} onChange={onChange} />);

    // Both item names should be visible as input values
    expect(screen.getByDisplayValue('リビングソファ')).toBeInTheDocument();
    expect(screen.getByDisplayValue('デスクランプ')).toBeInTheDocument();
  });

  it('removes an item when delete button is clicked', () => {
    const items: FurnitureFormItem[] = [
      {
        id: 'item-1',
        name: 'ソファ',
        category: 'core',
        furnitureCategory: 'sofa',
      },
    ];
    const onChange = vi.fn();
    render(<FurnitureForm items={items} onChange={onChange} />);

    const deleteButton = screen.getByLabelText('家具を削除');
    fireEvent.click(deleteButton);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('updates item name when input changes', () => {
    const items: FurnitureFormItem[] = [
      {
        id: 'item-1',
        name: '赤いソファ',
        category: 'additional',
        furnitureCategory: 'sofa',
      },
    ];
    const onChange = vi.fn();
    render(<FurnitureForm items={items} onChange={onChange} />);

    const nameInput = screen.getByDisplayValue('赤いソファ');
    fireEvent.change(nameInput, { target: { value: '新しいソファ' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = onChange.mock.calls[0][0];
    expect(updated[0].name).toBe('新しいソファ');
  });

  it('sets default new price when furniture category changes', () => {
    const items: FurnitureFormItem[] = [
      {
        id: 'item-1',
        name: 'テスト',
        category: 'additional',
        furnitureCategory: 'other',
        newPrice: DEFAULT_NEW_PRICES.other,
      },
    ];
    const onChange = vi.fn();
    render(<FurnitureForm items={items} onChange={onChange} />);

    const categorySelect = screen.getByDisplayValue('その他');
    fireEvent.change(categorySelect, { target: { value: 'sofa' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = onChange.mock.calls[0][0];
    expect(updated[0].furnitureCategory).toBe('sofa');
    expect(updated[0].newPrice).toBe(DEFAULT_NEW_PRICES.sofa);
  });

  it('toggles item between core and additional', () => {
    const items: FurnitureFormItem[] = [
      {
        id: 'item-1',
        name: 'ソファ',
        category: 'additional',
        furnitureCategory: 'sofa',
      },
    ];
    const onChange = vi.fn();
    render(<FurnitureForm items={items} onChange={onChange} />);

    const groupSelect = screen.getByDisplayValue('追加家具');
    fireEvent.change(groupSelect, { target: { value: 'core' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = onChange.mock.calls[0][0];
    expect(updated[0].category).toBe('core');
  });

  it('updates brand when input changes', () => {
    const items: FurnitureFormItem[] = [
      {
        id: 'item-1',
        name: 'ソファ',
        category: 'core',
        furnitureCategory: 'sofa',
        brand: '',
      },
    ];
    const onChange = vi.fn();
    render(<FurnitureForm items={items} onChange={onChange} />);

    const brandInput = screen.getByPlaceholderText('ブランド名（任意）');
    fireEvent.change(brandInput, { target: { value: 'IKEA' } });

    const updated = onChange.mock.calls[0][0];
    expect(updated[0].brand).toBe('IKEA');
  });

  it('updates years used when input changes', () => {
    const items: FurnitureFormItem[] = [
      {
        id: 'item-1',
        name: 'ソファ',
        category: 'core',
        furnitureCategory: 'sofa',
      },
    ];
    const onChange = vi.fn();
    render(<FurnitureForm items={items} onChange={onChange} />);

    const yearsInput = screen.getByPlaceholderText('使用年数');
    fireEvent.change(yearsInput, { target: { value: '3' } });

    const updated = onChange.mock.calls[0][0];
    expect(updated[0].yearsUsed).toBe(3);
  });

  it('updates price when input changes', () => {
    const items: FurnitureFormItem[] = [
      {
        id: 'item-1',
        name: 'ソファ',
        category: 'core',
        furnitureCategory: 'sofa',
      },
    ];
    const onChange = vi.fn();
    render(<FurnitureForm items={items} onChange={onChange} />);

    const priceInput = screen.getByPlaceholderText('希望価格（円）');
    fireEvent.change(priceInput, { target: { value: '20000' } });

    const updated = onChange.mock.calls[0][0];
    expect(updated[0].price).toBe(20000);
  });

  it('does not mutate original items array', () => {
    const items: FurnitureFormItem[] = [
      {
        id: 'item-1',
        name: '青いソファ',
        category: 'core',
        furnitureCategory: 'sofa',
      },
    ];
    const originalItems = [...items];
    const onChange = vi.fn();
    render(<FurnitureForm items={items} onChange={onChange} />);

    const nameInput = screen.getByDisplayValue('青いソファ');
    fireEvent.change(nameInput, { target: { value: '新しいソファ' } });

    // Original items should not be mutated
    expect(items).toEqual(originalItems);
  });
});
