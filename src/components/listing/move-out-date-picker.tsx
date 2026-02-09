'use client';

import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import {
  validateMoveOutDate,
  type MoveOutDateValidationResult,
} from '@/lib/validations/move-out-date';

interface MoveOutDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MoveOutDatePicker({
  value,
  onChange,
  disabled = false,
}: MoveOutDatePickerProps) {
  const validation: MoveOutDateValidationResult | null = useMemo(() => {
    if (!value) return null;
    return validateMoveOutDate(value);
  }, [value]);

  return (
    <div className="space-y-2">
      <Label htmlFor="moveOutDate" className="text-sm font-medium">
        退去予定日 <span className="text-coral">*</span>
      </Label>
      <Input
        id="moveOutDate"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`rounded-lg border-border ${
          validation?.error
            ? 'border-red-500 focus-visible:ring-red-500'
            : validation?.warning
              ? 'border-yellow-500 focus-visible:ring-yellow-500'
              : ''
        }`}
        aria-invalid={validation?.error ? 'true' : undefined}
        aria-describedby={
          validation?.error
            ? 'moveOutDate-error'
            : validation?.warning
              ? 'moveOutDate-warning'
              : undefined
        }
      />

      {validation?.error && (
        <div
          id="moveOutDate-error"
          role="alert"
          className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{validation.error}</span>
        </div>
      )}

      {validation?.warning && !validation?.error && (
        <div
          id="moveOutDate-warning"
          role="status"
          className="flex items-start gap-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{validation.warning}</span>
        </div>
      )}
    </div>
  );
}
