'use client';

import type { ChecklistItem, ItemDisposition } from '@/lib/furniture-checklist';
import { furnitureLabels } from '@/lib/data';

const conditionLabels: Record<string, string> = {
  excellent: 'とても良い',
  good: '良い',
  fair: '普通',
};

interface FurnitureChecklistUIProps {
  items: ChecklistItem[];
  onItemChange: (itemId: string, disposition: ItemDisposition) => void;
  deadlineDate: string;
  disabled?: boolean;
}

/**
 * 家具チェックリストUI
 *
 * 内見後に次の住人が家具の引き継ぎ意向を選択するコンポーネント。
 * 各家具に対して「引き継ぐ」(keep)か「引き継がない」(take_away)を選択する。
 */
export function FurnitureChecklistUI({
  items,
  onItemChange,
  deadlineDate,
  disabled = false,
}: FurnitureChecklistUIProps) {
  const keepCount = items.filter((i) => i.disposition === 'keep').length;
  const takeAwayCount = items.filter(
    (i) => i.disposition === 'take_away'
  ).length;
  const undecidedCount = items.filter(
    (i) => i.disposition === 'undecided'
  ).length;

  const handleClick = (itemId: string, disposition: ItemDisposition) => {
    if (disabled) return;
    onItemChange(itemId, disposition);
  };

  return (
    <div className="space-y-6">
      {/* Deadline notice */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-600">
          回答期限: {deadlineDate}（内見から7日以内）
        </p>
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>引き継ぐ: {keepCount}</span>
        <span>引き継がない: {takeAwayCount}</span>
        <span>未決定: {undecidedCount}</span>
      </div>

      {/* Item list */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                {furnitureLabels[item.furnitureType]}
              </h3>
              {item.condition && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  {conditionLabels[item.condition]}
                </span>
              )}
            </div>

            {item.notes && (
              <p className="mb-3 text-sm text-gray-500">{item.notes}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                aria-label="引き継ぐ"
                data-active={item.disposition === 'keep' ? 'true' : 'false'}
                disabled={disabled}
                onClick={() => handleClick(item.id, 'keep')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  item.disposition === 'keep'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                引き継ぐ
              </button>
              <button
                type="button"
                aria-label="引き継がない"
                data-active={
                  item.disposition === 'take_away' ? 'true' : 'false'
                }
                disabled={disabled}
                onClick={() => handleClick(item.id, 'take_away')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  item.disposition === 'take_away'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                引き継がない
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
