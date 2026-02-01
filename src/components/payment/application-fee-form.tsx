"use client";

import { useState, useEffect } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStripe } from "@/lib/stripe/client";
import { STRIPE_CONFIG } from "@/lib/stripe/config";
import { createApplicationFeePayment } from "@/app/actions/payment";

interface ApplicationFeeFormProps {
  propertyId: string;
  userId: string;
  previousTenantId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function ApplicationFeeFormContent({
  propertyId,
  userId,
  previousTenantId,
  onSuccess,
  onError,
}: ApplicationFeeFormProps) {
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
          submitError.message || "お支払い情報の確認に失敗しました"
        );
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/properties/${propertyId}?payment=success`,
        },
      });

      if (result.error) {
        throw new Error(
          result.error.message || "お支払い処理に失敗しました"
        );
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "お支払い処理中にエラーが発生しました";
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
      <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-yellow-900 dark:text-yellow-100">
              重要：申込金について
            </p>
            <ul className="space-y-1 text-yellow-800 dark:text-yellow-200">
              <li>
                • 申込金{STRIPE_CONFIG.APPLICATION_FEE.toLocaleString()}
                円は返金不可です
              </li>
              <li>• お支払い後すぐに前の住人に直接送金されます</li>
              <li>
                •
                この金額は引き継ぎの意思表示として前の住人に支払われます
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="font-semibold">申込金</span>
          <span className="text-2xl font-bold text-[#FF5A5F]">
            {STRIPE_CONFIG.APPLICATION_FEE.toLocaleString()}円
          </span>
        </div>

        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0" />
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
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>処理中...</span>
          </>
        ) : (
          `${STRIPE_CONFIG.APPLICATION_FEE.toLocaleString()}円を支払う`
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
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

export function ApplicationFeeForm({
  propertyId,
  userId,
  previousTenantId,
  onSuccess,
  onError,
}: ApplicationFeeFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const result = await createApplicationFeePayment(
          propertyId,
          userId,
          previousTenantId
        );

        if (!result.success) {
          throw new Error(
            result.error || "お支払いの準備に失敗しました"
          );
        }

        if (!result.clientSecret) {
          throw new Error("お支払い情報の取得に失敗しました");
        }

        setClientSecret(result.clientSecret);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "お支払いの準備中にエラーが発生しました";
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [propertyId, userId, previousTenantId, onError]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>申込金のお支払い</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">読み込み中...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>申込金のお支払い</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0" />
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
        <CardTitle>申込金のお支払い</CardTitle>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#FF5A5F",
              },
            },
            locale: "ja",
          }}
        >
          <ApplicationFeeFormContent
            propertyId={propertyId}
            userId={userId}
            previousTenantId={previousTenantId}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}
