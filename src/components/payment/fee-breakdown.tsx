'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { calculateFeeBreakdown } from '@/lib/stripe/calculations';

interface FeeBreakdownProps {
  handoverFeeTotal: number;
  showDetails?: boolean;
  className?: string;
}

export function FeeBreakdown({
  handoverFeeTotal,
  showDetails = false,
  className = '',
}: FeeBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  const breakdown = calculateFeeBreakdown(handoverFeeTotal);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">引き継ぎ費用の内訳</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>引き継ぎ費用総額</span>
          <span className="text-[#FF5A5F]">
            {handoverFeeTotal.toLocaleString()}円
          </span>
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>申込金（返金不可）</span>
                <span>{STRIPE_CONFIG.APPLICATION_FEE.toLocaleString()}円</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>デポジット（30%）</span>
                <span>{breakdown.deposit.toLocaleString()}円</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>残金（70%）</span>
                <span>{breakdown.remaining.toLocaleString()}円</span>
              </div>
              <div className="flex justify-between text-muted-foreground pt-2 border-t">
                <span>追加清掃費用</span>
                <span>
                  {STRIPE_CONFIG.ADDITIONAL_CLEANING_FEE.toLocaleString()}円
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>大家様インセンティブ（1%）</span>
                <span>{breakdown.landlordIncentive.toLocaleString()}円</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>プラットフォーム手数料（15%）</span>
                <span>{breakdown.platformFee.toLocaleString()}円</span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between font-semibold">
                <span>前の住人が受け取る金額</span>
                <span className="text-green-600">
                  {breakdown.sellerReceives.toLocaleString()}円
                </span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <p>
                ※ 申込金は返金不可ですが、前の住人に直接お支払いいただきます
              </p>
              <p>
                ※
                デポジット・残金は引き継ぎ完了後、48時間の異議申し立て期間を経て前の住人に支払われます
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center pt-2"
        >
          <span>{isExpanded ? '詳細を閉じる' : '詳細を見る'}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </CardContent>
    </Card>
  );
}
