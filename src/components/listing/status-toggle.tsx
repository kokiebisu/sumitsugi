'use client';

import { cn } from '@/lib/utils';
import type { PropertyStatusInput } from '@/lib/validations/property';

interface StatusToggleProps {
  value: PropertyStatusInput;
  onChange: (status: PropertyStatusInput) => void;
}

const statusOptions: ReadonlyArray<{
  value: PropertyStatusInput;
  label: string;
}> = [
  { value: 'draft', label: '下書き' },
  { value: 'public', label: '公開' },
] as const;

export function StatusToggle({ value, onChange }: StatusToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border p-1 gap-1">
      {statusOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="button"
          data-active={value === option.value ? 'true' : 'false'}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            value === option.value
              ? option.value === 'public'
                ? 'bg-green-100 text-green-700'
                : 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
