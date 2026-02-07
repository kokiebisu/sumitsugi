'use client';

import { useState, useCallback } from 'react';
import { Check, Loader2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { confirmHandoverCompletion } from '@/app/actions/escrow';

interface HandoverConfirmationProps {
  propertyId: string;
  userId: string;
  role: 'buyer' | 'seller';
  alreadyConfirmed?: boolean;
  bothConfirmed?: boolean;
  otherPartyConfirmed?: boolean;
}

type ConfirmationState =
  | 'idle'
  | 'loading'
  | 'confirmed'
  | 'both_confirmed'
  | 'error';

export function HandoverConfirmation({
  propertyId,
  userId,
  role,
  alreadyConfirmed = false,
  bothConfirmed: initialBothConfirmed = false,
  otherPartyConfirmed = false,
}: HandoverConfirmationProps) {
  const [state, setState] = useState<ConfirmationState>(
    initialBothConfirmed
      ? 'both_confirmed'
      : alreadyConfirmed
        ? 'confirmed'
        : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleLabel = role === 'buyer' ? '次の住人' : '前の住人';

  const handleConfirm = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);

    try {
      const result = await confirmHandoverCompletion(propertyId, userId, role);

      if (result.success) {
        setState(result.bothConfirmed ? 'both_confirmed' : 'confirmed');
      } else {
        setState('error');
        setErrorMessage(result.error ?? '予期しないエラーが発生しました');
      }
    } catch {
      setState('error');
      setErrorMessage(
        'ネットワークエラーが発生しました。もう一度お試しください。'
      );
    }
  }, [propertyId, userId, role]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          引き継ぎ完了確認
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {roleLabel}
          として引き継ぎが完了したことを確認してください。双方が確認後、エスクローが解放されます。
        </p>

        {/* Status indicators */}
        <div className="space-y-2">
          <StatusRow
            label="次の住人"
            confirmed={
              role === 'buyer'
                ? state === 'confirmed' || state === 'both_confirmed'
                : otherPartyConfirmed || state === 'both_confirmed'
            }
          />
          <StatusRow
            label="前の住人"
            confirmed={
              role === 'seller'
                ? state === 'confirmed' || state === 'both_confirmed'
                : otherPartyConfirmed || state === 'both_confirmed'
            }
          />
        </div>

        {/* Action / State display */}
        {state === 'idle' && (
          <Button
            onClick={handleConfirm}
            className="w-full bg-[#FF5A5F] hover:bg-[#FF5A5F]/90"
          >
            引き継ぎ完了を確認
          </Button>
        )}

        {state === 'loading' && (
          <Button disabled className="w-full">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            確認中...
          </Button>
        )}

        {state === 'confirmed' && (
          <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 dark:text-green-500" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                確認済み
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              もう一方の確認を待っています。
            </p>
          </div>
        )}

        {state === 'both_confirmed' && (
          <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 dark:text-green-500" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                双方の確認が完了しました
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              エスクローが解放され、前の住人への送金が処理されます。
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-2">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                <span className="text-sm font-medium text-red-900 dark:text-red-100">
                  {errorMessage}
                </span>
              </div>
            </div>
            <Button
              onClick={handleConfirm}
              variant="outline"
              className="w-full"
            >
              再試行
            </Button>
          </div>
        )}

        {/* Info about dispute period */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 dark:text-blue-100">
              双方の確認後、エスクロー資金が前の住人に送金されます。問題がある場合は確認前にサポートにご連絡ください。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusRow({
  label,
  confirmed,
}: {
  label: string;
  confirmed: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <span className="text-sm">{label}</span>
      {confirmed ? (
        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-500 font-medium">
          <Check className="w-4 h-4" />
          確認済み
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          未確認
        </span>
      )}
    </div>
  );
}
