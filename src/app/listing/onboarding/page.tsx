import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OnboardingReturnPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 py-16 text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            決済アカウント設定
          </h1>
          <p className="text-muted-foreground mb-4">
            この機能は現在準備中です。
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Stripeアカウントの設定は近日公開予定です。
          </p>
          <Link href="/listing">
            <Button variant="outline" className="rounded-lg">
              ダッシュボードに戻る
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
