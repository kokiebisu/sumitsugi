'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createConnectAccount,
  getConnectAccountOnboardingLink,
  getConnectAccountStatus,
} from '@/app/actions/stripe-connect';

type AccountStatus = {
  exists: boolean;
  account?: {
    stripeAccountId: string;
    onboardingCompleted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  };
};

interface StripeConnectOnboardingProps {
  userId: string;
  userEmail: string;
}

export function StripeConnectOnboarding({
  userId,
  userEmail,
}: StripeConnectOnboardingProps) {
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await getConnectAccountStatus(userId);
      if (!result.success) {
        throw new Error(result.error || 'ステータスの取得に失敗しました');
      }
      setStatus({
        exists: result.exists ?? false,
        account: result.account,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'ステータスの取得に失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleStartOnboarding = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Step 1: Create the account if it doesn't exist
      let accountId = status?.account?.stripeAccountId;

      if (!accountId) {
        const createResult = await createConnectAccount(
          userId,
          'previous_tenant',
          userEmail
        );
        if (!createResult.success) {
          throw new Error(createResult.error || 'アカウント作成に失敗しました');
        }
        accountId = createResult.accountId;
      }

      if (!accountId) {
        throw new Error('アカウントIDの取得に失敗しました');
      }

      // Step 2: Get onboarding link
      const returnUrl = `${window.location.origin}/account/stripe-setup?status=complete`;
      const refreshUrl = `${window.location.origin}/account/stripe-setup?status=refresh`;

      const linkResult = await getConnectAccountOnboardingLink(
        accountId,
        returnUrl,
        refreshUrl
      );

      if (!linkResult.success || !linkResult.url) {
        throw new Error(
          linkResult.error || 'オンボーディングリンクの取得に失敗しました'
        );
      }

      // Step 3: Redirect to Stripe
      window.location.href = linkResult.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '処理中にエラーが発生しました'
      );
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>報酬受取口座</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">読み込み中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Account fully set up
  if (status?.account?.chargesEnabled && status?.account?.payoutsEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>報酬受取口座</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">
                口座設定済み
              </p>
              <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                報酬受取口座が正常に設定されています。引き継ぎが完了すると、設定した口座に報酬が送金されます。
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>本人確認完了</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>入金受付有効</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>出金有効</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Account exists but onboarding incomplete
  if (status?.exists && status?.account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>報酬受取口座</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                設定が未完了です
              </p>
              <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                Stripeでの本人確認が完了していません。オンボーディングを続けて設定を完了してください。
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <Button
            onClick={handleStartOnboarding}
            disabled={isCreating}
            className="mt-4 w-full"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>準備中...</span>
              </>
            ) : (
              <>
                <ExternalLink className="h-5 w-5" />
                <span>設定を続ける</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No account yet
  return (
    <Card>
      <CardHeader>
        <CardTitle>報酬受取口座</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          引き継ぎの報酬を受け取るには、Stripeで口座情報を登録する必要があります。本人確認と銀行口座の登録を行ってください。
        </p>

        <div className="mb-4 space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
          <p className="font-medium">設定に必要なもの：</p>
          <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
            <li>本人確認書類（免許証、パスポートなど）</li>
            <li>銀行口座情報</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <Button
          onClick={handleStartOnboarding}
          disabled={isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>準備中...</span>
            </>
          ) : (
            '報酬受取口座を設定'
          )}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Stripeの安全な環境で口座情報を登録します
        </p>
      </CardContent>
    </Card>
  );
}
