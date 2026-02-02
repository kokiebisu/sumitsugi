'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useAuth } from '@/contexts/auth-context';
import { CustomSignupDialog } from '@/components/auth/custom-signup-dialog';
import { BecomeSellerFlow } from '@/components/auth/become-seller-flow';
import { Button } from '@/components/ui/button';
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Home,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

// リスティングカードコンポーネント
function ListingCard({
  listing,
  onDelete,
}: {
  listing: {
    id: string;
    title: string;
    status: string;
    roomPhotos?: string[];
    publishedAt?: string;
  };
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const firstPhoto = listing.roomPhotos?.[0];

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
      {/* 画像 */}
      <div className="aspect-[4/3] bg-muted relative">
        {firstPhoto ? (
          <img
            src={firstPhoto}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl">🏠</span>
          </div>
        )}
        {/* ステータスバッジ */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              listing.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {listing.status === 'published' ? '公開中' : '下書き'}
          </span>
        </div>
        {/* メニューボタン */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-sm"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-border py-2 min-w-[160px] z-20">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-3">
                  <Eye className="w-4 h-4" />
                  プレビュー
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-3">
                  <Edit2 className="w-4 h-4" />
                  編集
                </button>
                <button
                  onClick={() => {
                    onDelete(listing.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-3 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  削除
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* 情報 */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1">{listing.title}</h3>
        <p className="text-sm text-muted-foreground">
          {listing.publishedAt
            ? `公開日: ${new Date(listing.publishedAt).toLocaleDateString('ja-JP')}`
            : '未公開'}
        </p>
      </div>
    </div>
  );
}

export default function CreatorPage() {
  const router = useRouter();
  const { user, login, becomeSeller, listings, deleteListing } = useAuth();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [showBecomeSellerFlow, setShowBecomeSellerFlow] = useState(false);

  // ユーザーのリスティングのみフィルター
  const userListings = listings.filter((l) => l.userId === user?.id);

  const handleGetStarted = () => {
    if (!user) {
      setShowSignupDialog(true);
    } else if (!user.isSeller) {
      setShowBecomeSellerFlow(true);
    }
  };

  const handleSignupComplete = (newUser: Parameters<typeof login>[0]) => {
    login(newUser);
    setShowSignupDialog(false);
    // サインアップ完了後、すぐにBecomeSellerFlowを表示
    setShowBecomeSellerFlow(true);
  };

  const handleBecomeSellerComplete = (
    hostProfile: Parameters<typeof becomeSeller>[0]
  ) => {
    becomeSeller(hostProfile);
    setShowBecomeSellerFlow(false);
    // プロフィール作成完了後、ホスティングダッシュボードへリダイレクト
    router.push('/listing');
  };

  // ホストでリスティングがある場合はダッシュボード表示
  if (user?.isSeller && userListings.length > 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />

        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-10">
            {/* ダッシュボードヘッダー */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                おかえりなさい、{user.name}さん
              </h1>
              <p className="text-muted-foreground">
                ダッシュボードであなたのリスティングを管理しましょう
              </p>
            </div>

            {/* クイックアクション */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <Link
                href="/listing/new"
                className="p-6 bg-white rounded-2xl border border-border hover:shadow-md transition-shadow"
              >
                <Home className="w-8 h-8 text-[#E61E4D] mb-3" />
                <h3 className="font-semibold text-foreground mb-1">
                  新規リスティング
                </h3>
                <p className="text-sm text-muted-foreground">
                  新しい暮らしを掲載する
                </p>
              </Link>
              <div className="p-6 bg-white rounded-2xl border border-border hover:shadow-md transition-shadow cursor-pointer">
                <MessageSquare className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-1">
                  メッセージ
                </h3>
                <p className="text-sm text-muted-foreground">
                  問い合わせを確認する
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-border hover:shadow-md transition-shadow cursor-pointer">
                <BarChart3 className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-1">分析</h3>
                <p className="text-sm text-muted-foreground">
                  パフォーマンスを見る
                </p>
              </div>
            </div>

            {/* リスティング一覧 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                あなたのリスティング
              </h2>
              <Link href="/listing/new">
                <Button variant="outline" className="rounded-lg gap-2">
                  <Plus className="w-4 h-4" />
                  追加
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onDelete={deleteListing}
                />
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ホストだがリスティングがない場合は /listing にリダイレクト
  if (user?.isSeller && userListings.length === 0) {
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
        onOpenChange={setShowSignupDialog}
        onSignupComplete={handleSignupComplete}
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
