'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { startStripeOnboarding } from '@/actions/stripe';

export default function OnboardingRefreshPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setIsLoading(true);
    setError(null);

    const result = await startStripeOnboarding();

    if (result.success && result.url) {
      router.push(result.url);
    } else {
      setError(result.error || 'オンボーディングリンクの生成に失敗しました');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 py-16 text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            リンクの有効期限が切れました
          </h1>
          <p className="text-muted-foreground mb-8">
            オンボーディングリンクの有効期限が切れました。
            新しいリンクを生成して続けてください。
          </p>

          {error && (
            <p
              className="text-sm text-red-600 mb-4"
              data-testid="refresh-error"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRetry}
              disabled={isLoading}
              className="w-full rounded-lg bg-[#E61E4D] hover:bg-[#D01346] text-white"
              data-testid="retry-onboarding"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  リダイレクト中...
                </>
              ) : (
                'オンボーディングを再開'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/listing')}
              className="w-full rounded-lg"
            >
              ダッシュボードに戻る
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
