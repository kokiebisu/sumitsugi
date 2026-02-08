'use client';

import { useState, useEffect } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { AlertCircle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStripe } from '@/lib/stripe/client';
import { createDepositPayment } from '@/app/actions/payment';

interface DepositFormProps {
  propertyId: string;
  userId: string;
  handoverFeeTotal: number;
  depositAmount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function DepositFormContent({
  propertyId,
  depositAmount,
  onSuccess,
  onError,
}: Pick<
  DepositFormProps,
  'propertyId' | 'depositAmount' | 'onSuccess' | 'onError'
>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(
          submitError.message || 'お支払い情報の確認に失敗しました'
        );
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/properties/${propertyId}/payment?step=deposit&status=success`,
        },
      });

      if (result.error) {
        throw new Error(result.error.message || 'お支払い処理に失敗しました');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'お支払い処理中にエラーが発生しました';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-500" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-blue-900 dark:text-blue-100">
            エスクロー保護
          </p>
          <p className="text-blue-800 dark:text-blue-200">
            デポジットはエスクローに預けられ、引き渡し確認後に前の住人に送金されます。
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="font-semibold">デポジット（30%）</span>
          <span className="text-2xl font-bold text-[#FF5A5F]">
            {depositAmount.toLocaleString()}円
          </span>
        </div>

        <PaymentElement />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-500" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full h-12 text-base"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>処理中...</span>
          </>
        ) : (
          `${depositAmount.toLocaleString()}円を支払う`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        お支払いにより、
        <a
          href="/terms"
          className="underline hover:text-foreground"
          target="_blank"
        >
          利用規約
        </a>
        および
        <a
          href="/privacy"
          className="underline hover:text-foreground"
          target="_blank"
        >
          プライバシーポリシー
        </a>
        に同意したものとみなされます
      </p>
    </form>
  );
}

export function DepositForm({
  propertyId,
  userId,
  handoverFeeTotal,
  depositAmount,
  onSuccess,
  onError,
}: DepositFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const result = await createDepositPayment(
          propertyId,
          userId,
          handoverFeeTotal
        );

        if (!result.success) {
          throw new Error(result.error || 'お支払いの準備に失敗しました');
        }

        if (!result.clientSecret) {
          throw new Error('お支払い情報の取得に失敗しました');
        }

        setClientSecret(result.clientSecret);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'お支払いの準備中にエラーが発生しました';
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [propertyId, userId, handoverFeeTotal, onError]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>デポジットのお支払い</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">読み込み中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>デポジットのお支払い</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-500" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                  エラーが発生しました
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const stripePromise = getStripe();

  return (
    <Card>
      <CardHeader>
        <CardTitle>デポジットのお支払い</CardTitle>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#FF5A5F',
              },
            },
            locale: 'ja',
          }}
        >
          <DepositFormContent
            propertyId={propertyId}
            depositAmount={depositAmount}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}
