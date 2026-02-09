import { BadgePercent, TrendingDown } from 'lucide-react';
import {
  calculateNewPriceTotal,
  calculateDiscountRate,
} from '@/lib/pricing-guidance';

interface PriceComparisonProps {
  furniture: string[];
  handoverFee: number;
  yearsOfUse?: number;
}

export function PriceComparison({
  furniture,
  handoverFee,
}: PriceComparisonProps) {
  if (furniture.length === 0 || handoverFee <= 0) return null;

  const newPriceTotal = calculateNewPriceTotal(furniture);
  if (newPriceTotal <= 0) return null;

  const discountRate = calculateDiscountRate(handoverFee, newPriceTotal);
  const handoverPercent = Math.max(0, 100 - discountRate);

  return (
    <div className="rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30 p-4 space-y-3">
      {/* 新品価格比較 */}
      <div className="flex items-start gap-3">
        <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">新品で揃えた場合</p>
          <p className="text-lg font-bold text-foreground">
            約{(newPriceTotal / 10000).toFixed(1)}万円
          </p>
        </div>
      </div>

      {/* 割引率表示 */}
      {discountRate > 0 && (
        <div className="flex items-center gap-3 pt-2 border-t border-green-200 dark:border-green-800">
          <BadgePercent className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              新品の{handoverPercent}%の価格で引き継ぎ
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              引越し費用: {handoverFee.toLocaleString()}円（{discountRate}
              %おトク）
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
