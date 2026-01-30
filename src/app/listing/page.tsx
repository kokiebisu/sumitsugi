"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Eye, Edit2, Trash2, MessageSquare, Home } from "lucide-react"
import { InquiryList } from "@/components/admin/inquiry-list"

// 無限スクロール用の画像データ（Unsplash - 明るいインテリア・部屋の写真）
const scrollImages = {
  row1: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop", // 明るいリビング（白基調）
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&h=600&fit=crop", // 日当たりの良いリビング
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop", // 白いキッチン
    "https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?w=800&h=600&fit=crop", // ナチュラルインテリア
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=600&fit=crop", // 明るいベッドルーム
  ],
  row2: [
    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&h=600&fit=crop", // 白いダイニング
    "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop", // リビング
    "https://images.unsplash.com/photo-1486304873000-235643847519?w=800&h=600&fit=crop", // ミニマルリビング
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&h=600&fit=crop", // 植物のあるリビング
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop", // 明るいワンルーム
  ],
  row3: [
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop", // モダンリビング（明るい）
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop", // 白い壁のキッチン
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop", // ナチュラルな部屋
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop", // 明るいワークスペース
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop", // 白いベッドルーム
  ],
}

function ScrollingRow({ images, direction = "left", speed = 30 }: { images: string[], direction?: "left" | "right", speed?: number }) {
  const duplicatedImages = [...images, ...images]

  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-5"
        style={{
          animation: `${direction === "left" ? "scrollLeft" : "scrollRight"} ${speed}s linear infinite`,
        }}
      >
        {duplicatedImages.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-72 h-48 rounded-2xl overflow-hidden bg-white"
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)',
              transform: 'translateY(0)',
            }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

// リスティングカードコンポーネント
function ListingCard({ listing, onDelete }: { listing: { id: string; title: string; status: string; roomPhotos?: string[]; publishedAt?: string }, onDelete: (id: string) => void }) {
  const [showMenu, setShowMenu] = useState(false)
  const firstPhoto = listing.roomPhotos?.[0]

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
      {/* 画像 */}
      <div className="aspect-[4/3] bg-muted relative">
        {firstPhoto ? (
          <img src={firstPhoto} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl">🏠</span>
          </div>
        )}
        {/* ステータスバッジ */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            listing.status === 'published'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
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
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-border py-2 min-w-[160px] z-20">
                <Link
                  href={`/listing/${listing.id}/preview`}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-3"
                  onClick={() => setShowMenu(false)}
                >
                  <Eye className="w-4 h-4" />
                  プレビュー
                </Link>
                <Link
                  href={`/listing/${listing.id}/edit`}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-3"
                  onClick={() => setShowMenu(false)}
                >
                  <Edit2 className="w-4 h-4" />
                  編集
                </Link>
                <button
                  onClick={() => {
                    onDelete(listing.id)
                    setShowMenu(false)
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
            : '未公開'
          }
        </p>
      </div>
    </div>
  )
}

export default function ListingPage() {
  const { user, isLoading, listings, deleteListing, inquiries } = useAuth()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<"listings" | "inquiries">("listings")

  // ユーザーのリスティングのみフィルター
  const userListings = listings.filter(l => l.userId === user?.id)

  // ユーザーのリスティングに対する問い合わせをフィルター
  const userListingIds = userListings.map(l => l.id)
  const userInquiries = inquiries.filter(inq => userListingIds.includes(inq.propertyId))

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // ページ読み込み後にフェードインを開始
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-10">
            {/* ヘッダースケルトン */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="h-9 w-40 bg-muted rounded-lg animate-pulse" />
                <div className="h-5 w-24 bg-muted rounded mt-2 animate-pulse" />
              </div>
              <div className="h-10 w-28 bg-muted rounded-lg animate-pulse" />
            </div>

            {/* カードグリッドスケルトン */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border">
                  {/* 画像スケルトン */}
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  {/* 情報スケルトン */}
                  <div className="p-4">
                    <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {userListings.length === 0 ? (
          /* 空状態 */
          <div className="flex flex-col items-center justify-center">
            {/* キャッチフレーズ */}
            <div
              className={`text-center pt-16 pb-20 transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <h1
                className="text-5xl font-bold text-foreground tracking-tight"
                style={{ fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif' }}
              >
                最初のリスティングをはじめよう。
              </h1>
            </div>
            {/* 無限スクロール画像 */}
            <div
              className={`relative w-full mb-12 transition-all duration-700 ease-out delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {/* 左側のグラデーション */}
              <div
                className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)' }}
              />
              {/* 右側のグラデーション */}
              <div
                className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)' }}
              />
              <div className="space-y-5">
                <ScrollingRow images={scrollImages.row1} direction="left" speed={35} />
                <ScrollingRow images={scrollImages.row2} direction="right" speed={40} />
                <ScrollingRow images={scrollImages.row3} direction="left" speed={30} />
              </div>
            </div>

            {/* ボタン */}
            <Link
              href="/listing/new"
              className={`mb-16 transition-all duration-700 ease-out delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Button
                variant="ghost"
                className="rounded-lg px-8 py-6 text-sm font-medium bg-gray-100 text-foreground hover:bg-gray-200 border-0"
              >
                リスティングを作成
              </Button>
            </Link>
          </div>
        ) : (
          /* リスティング一覧 */
          <div className="mx-auto max-w-7xl px-6 py-10">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">ダッシュボード</h1>
              <Link href="/listing/new">
                <Button className="rounded-lg bg-[#E61E4D] hover:bg-[#D01346] text-white gap-2">
                  <Plus className="w-4 h-4" />
                  新規作成
                </Button>
              </Link>
            </div>

            {/* タブ */}
            <div className="flex gap-2 mb-8 border-b border-border">
              <button
                onClick={() => setActiveTab("listings")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "listings"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Home className="w-4 h-4" />
                リスティング
                <span className="ml-1 px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                  {userListings.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "inquiries"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                問い合わせ
                <span className="ml-1 px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                  {userInquiries.length}
                </span>
              </button>
            </div>

            {/* コンテンツ */}
            {activeTab === "listings" ? (
              /* リスティンググリッド */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userListings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onDelete={deleteListing}
                  />
                ))}
              </div>
            ) : (
              /* 問い合わせ一覧 */
              <InquiryList inquiries={userInquiries} />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
