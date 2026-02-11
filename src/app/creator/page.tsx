'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useAuth } from '@/contexts/auth-context';
import { CustomSignupDialog } from '@/components/auth/custom-signup-dialog';
import { BecomeSellerFlow } from '@/components/auth/become-seller-flow';
import { Button } from '@/components/ui/button';

export default function CreatorPage() {
  const router = useRouter();
  const { user, becomeSeller } = useAuth();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [showBecomeSellerFlow, setShowBecomeSellerFlow] = useState(false);

  const handleGetStarted = () => {
    if (!user) {
      setShowSignupDialog(true);
    } else if (!user.isSeller) {
      setShowBecomeSellerFlow(true);
    }
  };

  // Magic Link: ダイアログを閉じるだけ（ログインはMagic Linkクリック後に自動）
  const handleSignupDialogClose = () => {
    setShowSignupDialog(false);
  };

  const handleBecomeSellerComplete = (
    hostProfile: Parameters<typeof becomeSeller>[0] | undefined
  ) => {
    if (hostProfile) {
      becomeSeller(hostProfile);
    }
    setShowBecomeSellerFlow(false);
    // プロフィール作成完了後、ホスティングダッシュボードへリダイレクト
    router.push('/listing');
  };

  // ホストの場合は /listing にリダイレクト（リスティング管理はAPI経由）
  if (user?.isSeller) {
    router.push('/listing');
    return null;
  }

  // 未ログインまたは非ホストの場合はランディングページ
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-24">
            <h1 className="mb-6 text-4xl font-semibold text-foreground md:text-5xl">
              あなたの暮らしを、次の人へ
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-muted-foreground md:text-xl">
              大切に育ててきた空間、こだわりの家具、そこでのストーリー。
              <br className="hidden md:block" />
              同じように愛してくれる人に、引き継いでみませんか？
            </p>

            {/* ログイン状態に応じたCTA */}
            {!user && (
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="h-14 px-10 rounded-lg bg-[#E61E4D] text-base font-semibold text-white hover:bg-[#D01346]"
              >
                はじめる
              </Button>
            )}
            {user && !user.isSeller && (
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="h-14 px-10 rounded-lg bg-[#E61E4D] text-base font-semibold text-white hover:bg-[#D01346]"
              >
                暮らしを譲る
              </Button>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-16 text-3xl font-medium text-foreground">
              引き継ぎのメリット
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="group cursor-pointer">
                <div className="mb-4 overflow-hidden rounded-3xl">
                  <img
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80"
                    alt="引っ越し時の家具処分コストを削減。インテリア代として譲渡できます。"
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground leading-relaxed">
                  引っ越し時の家具処分コストを削減。インテリア代として譲渡できます。
                </h3>
              </div>

              <div className="group cursor-pointer">
                <div className="mb-4 overflow-hidden rounded-3xl">
                  <img
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&auto=format&fit=crop&q=80"
                    alt="あなたの暮らし方に共感する人に、空間とストーリーを引き継げます。"
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground leading-relaxed">
                  あなたの暮らし方に共感する人に、空間とストーリーを引き継げます。
                </h3>
              </div>

              <div className="group cursor-pointer">
                <div className="mb-4 overflow-hidden rounded-3xl">
                  <img
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80"
                    alt="興味を持った理由を聞いて、大切にしてくれる人を選べます。"
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground leading-relaxed">
                  興味を持った理由を聞いて、大切にしてくれる人を選べます。
                </h3>
              </div>

              <div className="group cursor-pointer">
                <div className="mb-4 overflow-hidden rounded-3xl">
                  <img
                    src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&auto=format&fit=crop&q=80"
                    alt="次の入居者が決まることで、退去後の空室期間を短縮できます。"
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground leading-relaxed">
                  次の入居者が決まることで、退去後の空室期間を短縮できます。
                </h3>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Dialogs */}
      <CustomSignupDialog
        open={showSignupDialog}
        onOpenChange={handleSignupDialogClose}
      />

      {showBecomeSellerFlow && (
        <BecomeSellerFlow
          onComplete={handleBecomeSellerComplete}
          onClose={() => setShowBecomeSellerFlow(false)}
        />
      )}
    </div>
  );
}
