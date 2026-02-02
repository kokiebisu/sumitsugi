'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Trash2, Loader2 } from 'lucide-react';
import {
  getEstimate,
  formatPriceRange,
  roundToThousand,
  type EstimateResult,
} from '@/lib/estimate-service';

interface EstimateCardProps {
  furniture: string[];
  area: string;
  rent?: number;
  layout?: string;
  onEstimateComplete?: (handoverFee: number) => void;
}

export function EstimateCard({
  furniture,
  area,
  rent,
  layout,
  onEstimateComplete,
}: EstimateCardProps) {
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const handleGetEstimate = async () => {
    if (furniture.length === 0) return;

    setIsLoading(true);
    setHasRequested(true);

    try {
      const result = await getEstimate({
        furniture,
        area,
        rent,
        layout,
      });
      setEstimate(result);

      // 中央値を引き継ぎ費用として提案（1000円単位に丸める）
      if (onEstimateComplete) {
        const suggestedFee = roundToThousand(
          (result.handoverFeeMin + result.handoverFeeMax) / 2
        );
        onEstimateComplete(suggestedFee);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 家具が変わったらリセット
  useEffect(() => {
    if (hasRequested) {
      setEstimate(null);
      setHasRequested(false);
    }
  }, [furniture.join(',')]);

  if (furniture.length === 0) {
    return (
      <div className="p-4 bg-muted/50 rounded-xl text-center">
        <p className="text-sm text-muted-foreground">
          家具を選択すると、引き継ぎ費用の目安を算出できます
        </p>
      </div>
    );
  }

  if (!hasRequested) {
    return (
      <button
        type="button"
        onClick={handleGetEstimate}
        className="w-full p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800 rounded-xl hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-950/50 dark:hover:to-purple-950/50 transition-all"
      >
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <span className="text-base font-medium text-violet-700 dark:text-violet-300">
            引き継ぎ費用の目安を見る
          </span>
        </div>
        <p className="text-xs text-violet-600/70 dark:text-violet-400/70 mt-1">
          Tsumugiの相場データをもとに算出
        </p>
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-muted/50 rounded-xl">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">算出中...</span>
        </div>
      </div>
    );
  }

  if (!estimate) return null;

  return (
    <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl space-y-4">
      {/* メインの差額表示 */}
      <div className="text-center pb-4 border-b border-green-200 dark:border-green-800">
        <p className="text-sm text-green-700 dark:text-green-300 mb-1">
          捨てるより
        </p>
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          <span className="text-2xl font-bold text-green-700 dark:text-green-300">
            最大 {formatPriceRange(estimate.savingsMin, estimate.savingsMax)}
          </span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300">お得</p>
      </div>

      {/* 詳細 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Trash2 className="w-4 h-4" />
            <span>処分した場合</span>
          </div>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            -
            {formatPriceRange(
              estimate.disposalCostMin,
              estimate.disposalCostMax
            )}
          </p>
          <p className="text-xs text-muted-foreground">処分費用がかかる</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>引き継いだ場合</span>
          </div>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            +
            {formatPriceRange(estimate.handoverFeeMin, estimate.handoverFeeMax)}
          </p>
          <p className="text-xs text-muted-foreground">収入として受け取れる</p>
        </div>
      </div>

      {/* 内訳 */}
      {estimate.breakdown.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            内訳を見る
          </summary>
          <div className="mt-2 space-y-1.5 pl-2">
            {estimate.breakdown.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-muted-foreground"
              >
                <span>{item.item}</span>
                <span>
                  処分: -{item.disposalCost.toLocaleString()}円 / 引継: +
                  {item.handoverValue.toLocaleString()}円
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* 注釈 */}
      <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-green-200 dark:border-green-800">
        ※ Tsumugiの過去事例・一般的な相場をもとに算出しています
      </p>
    </div>
  );
}
