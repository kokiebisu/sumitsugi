'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StripeConnectOnboarding } from '@/components/payment/stripe-connect-onboarding';

export default function StripeSetupPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackStatus = searchParams.get('status');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            読み込み中...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Link
            href="/account"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            アカウントに戻る
          </Link>

          <h1 className="mb-2 text-2xl font-semibold text-foreground">
            報酬受取口座の設定
          </h1>
          <p className="mb-8 text-muted-foreground">
            引き継ぎの報酬を受け取るための口座を設定します
          </p>

          {/* Callback status messages */}
          {callbackStatus === 'complete' && (
            <Card className="mb-6 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      設定が完了しました
                    </p>
                    <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                      Stripeでの口座設定が完了しました。下記のステータスをご確認ください。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {callbackStatus === 'refresh' && (
            <Card className="mb-6 border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <RefreshCw className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
                  <div>
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                      設定を続けてください
                    </p>
                    <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                      Stripeでの設定が中断されました。下のボタンから設定を続けてください。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Onboarding component */}
          <StripeConnectOnboarding userId={user.id} userEmail={user.email} />

          {/* Info section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">よくあるご質問</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium">報酬はいつ受け取れますか？</p>
                <p className="mt-1 text-muted-foreground">
                  引き継ぎが完了し、双方が確認した後、エスクローから口座に送金されます。通常2〜3営業日でお振込みされます。
                </p>
              </div>
              <div>
                <p className="font-medium">手数料はかかりますか？</p>
                <p className="mt-1 text-muted-foreground">
                  口座の設定は無料です。引き継ぎ時にプラットフォーム手数料（15%）が差し引かれます。
                </p>
              </div>
              <div>
                <p className="font-medium">個人情報は安全ですか？</p>
                <p className="mt-1 text-muted-foreground">
                  口座情報はStripe（国際決済プラットフォーム）が安全に管理します。sumitsugiでは口座情報を直接保持しません。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
