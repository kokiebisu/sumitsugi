'use client';

import { useState } from 'react';
import { Info, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getPriceGuide,
  getAdjustedRange,
  getTotalPriceRange,
  CONDITION_LABELS,
  type FurnitureCondition,
} from '@/lib/pricing-guidance';
import { cn } from '@/lib/utils';

interface PricingGuidanceProps {
  selectedFurniture: string[];
  handoverFee: string;
}

export function PricingGuidance({
  selectedFurniture,
  handoverFee,
}: PricingGuidanceProps) {
  const [condition, setCondition] = useState<FurnitureCondition>('good');
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedFurniture.length === 0) return null;

  const totalRange = getTotalPriceRange(selectedFurniture, condition);
  const fee = handoverFee ? parseInt(handoverFee, 10) : 0;

  // 人気帯判定: 合計の人気帯を計算
  const popularMin = selectedFurniture.reduce((sum, id) => {
    const guide = getPriceGuide(id);
    return sum + (guide?.popularRange.min ?? 0);
  }, 0);
  const popularMax = selectedFurniture.reduce((sum, id) => {
    const guide = getPriceGuide(id);
    return sum + (guide?.popularRange.max ?? 0);
  }, 0);
  const isPopular = fee > 0 && fee >= popularMin && fee <= popularMax;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            参考価格帯: {totalRange.min.toLocaleString()}〜
            {totalRange.max.toLocaleString()}円
          </p>
          {isPopular && (
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-700 dark:text-green-300">
                この価格帯は選ばれやすい価格です
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          aria-label={isExpanded ? '詳細を閉じる' : '詳細を見る'}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </button>
      </div>

      {/* 展開時の詳細 */}
      {isExpanded && (
        <div className="border-t border-blue-200 dark:border-blue-800 px-4 py-3 space-y-3">
          {/* 状態選択 */}
          <div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
              家具の状態
            </p>
            <div className="flex gap-2">
              {(
                Object.entries(CONDITION_LABELS) as [
                  FurnitureCondition,
                  string,
                ][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCondition(key)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    condition === key
                      ? 'bg-blue-600 text-white dark:bg-blue-500'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* カテゴリ別の内訳 */}
          <div className="space-y-2">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              カテゴリ別参考価格
            </p>
            {selectedFurniture.map((id) => {
              const guide = getPriceGuide(id);
              if (!guide) return null;
              const range = getAdjustedRange(guide, condition);
              return (
                <div
                  key={id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-foreground">{guide.label}</span>
                  <span className="text-muted-foreground">
                    {range.min.toLocaleString()}〜{range.max.toLocaleString()}円
                  </span>
                </div>
              );
            })}
            <div className="flex items-center justify-between text-xs font-medium pt-2 border-t border-blue-200 dark:border-blue-800">
              <span className="text-foreground">合計</span>
              <span className="text-blue-700 dark:text-blue-300">
                {totalRange.min.toLocaleString()}〜
                {totalRange.max.toLocaleString()}円
              </span>
            </div>
          </div>

          {/* 人気価格帯のヒント */}
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                選ばれやすい価格帯
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {popularMin.toLocaleString()}〜{popularMax.toLocaleString()}円
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
