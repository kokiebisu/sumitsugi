'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getStripeAccountStatus } from '@/actions/stripe';

type OnboardingState = 'loading' | 'complete' | 'incomplete';

export default function OnboardingReturnPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>('loading');

  useEffect(() => {
    async function checkStatus() {
      const result = await getStripeAccountStatus();

      if (
        result.success &&
        result.exists &&
        result.account?.onboardingCompleted
      ) {
        setState('complete');
      } else {
        setState('incomplete');
      }
    }

    checkStatus();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 py-16 text-center">
          {state === 'loading' && (
            <div data-testid="onboarding-loading">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                確認中...
              </h1>
              <p className="text-muted-foreground">
                アカウントのステータスを確認しています。
              </p>
            </div>
          )}

          {state === 'complete' && (
            <div data-testid="onboarding-complete">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                オンボーディング完了
              </h1>
              <p className="text-muted-foreground mb-8">
                Stripeアカウントの設定が完了しました。
                リスティングの作成を続けましょう。
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/listing/new">
                  <Button className="w-full rounded-lg bg-[#E61E4D] hover:bg-[#D01346] text-white">
                    リスティングを作成
                  </Button>
                </Link>
                <Link href="/listing">
                  <Button variant="outline" className="w-full rounded-lg">
                    ダッシュボードに戻る
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {state === 'incomplete' && (
            <div data-testid="onboarding-incomplete">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                設定が未完了です
              </h1>
              <p className="text-muted-foreground mb-8">
                Stripeアカウントの設定が完了していません。
                もう一度お試しください。
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => router.push('/listing')}
                  className="w-full rounded-lg bg-[#E61E4D] hover:bg-[#D01346] text-white"
                >
                  ダッシュボードに戻る
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
