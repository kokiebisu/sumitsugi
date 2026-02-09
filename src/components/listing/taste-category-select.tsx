'use client';

import { cn } from '@/lib/utils';
import type { TasteCategoryInput } from '@/lib/validations/property';

interface TasteCategorySelectProps {
  value: TasteCategoryInput | '';
  onChange: (category: TasteCategoryInput) => void;
  className?: string;
}

const tasteCategories: ReadonlyArray<{
  value: TasteCategoryInput;
  label: string;
}> = [
  { value: 'minimal', label: 'ミニマル' },
  { value: 'natural', label: 'ナチュラル' },
  { value: 'modern', label: 'モダン' },
  { value: 'japanese', label: '和風' },
  { value: 'industrial', label: 'インダストリアル' },
  { value: 'vintage', label: 'ヴィンテージ' },
] as const;

export function TasteCategorySelect({
  value,
  onChange,
  className,
}: TasteCategorySelectProps) {
  return (
    <select
      role="combobox"
      value={value}
      onChange={(e) => onChange(e.target.value as TasteCategoryInput)}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      <option value="" disabled>
        テイストを選択
      </option>
      {tasteCategories.map((cat) => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  );
}
