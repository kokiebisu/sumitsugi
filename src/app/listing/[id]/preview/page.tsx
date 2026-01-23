"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { furnitureLabels } from "@/lib/data"
import type { LargeFurnitureType } from "@/lib/data"
import {
  ArrowLeft,
  Edit2,
  Leaf,
  Sparkles,
  TreePine,
  Sofa,
  Mountain,
  Lamp,
  Armchair,
  Moon,
  Flower2,
  Briefcase,
  Clock,
  Frame,
  Waves,
  BedDouble,
  Monitor,
  Archive,
  UtensilsCrossed,
  Shirt,
  Tv,
  Refrigerator,
  Coffee,
  LucideIcon,
} from "lucide-react"

// お部屋のスタイル
const ROOM_STYLES: Record<string, { label: string; Icon: LucideIcon }> = {
  nordic: { label: "北欧風", Icon: TreePine },
  modern: { label: "モダン", Icon: Sparkles },
  vintage: { label: "ヴィンテージ", Icon: Clock },
  minimal: { label: "ミニマル", Icon: Frame },
  industrial: { label: "インダストリアル", Icon: Briefcase },
  natural: { label: "ナチュラル", Icon: Leaf },
  japanese: { label: "和モダン", Icon: Moon },
  bohemian: { label: "ボヘミアン", Icon: Flower2 },
  coastal: { label: "コースタル・海辺", Icon: Waves },
  midcentury: { label: "ミッドセンチュリー", Icon: Armchair },
  rustic: { label: "ラスティック", Icon: Mountain },
  contemporary: { label: "コンテンポラリー", Icon: Lamp },
}

// 家具アイコン
const FURNITURE_ICONS: Record<LargeFurnitureType, LucideIcon> = {
  bed: BedDouble,
  sofa: Sofa,
  desk: Monitor,
  table: Coffee,
  storage: Archive,
  dining: UtensilsCrossed,
  wardrobe: Shirt,
  tv: Tv,
  fridge: Refrigerator,
}

export default function PreviewListingPage() {
  const { user, isLoading, listings } = useAuth()
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const listing = listings.find(l => l.id === listingId)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!isLoading && user && listing && listing.userId !== user.id) {
      router.push("/listing")
    }
  }, [user, isLoading, listing, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">リスティングが見つかりません</div>
      </div>
    )
  }

  const firstPhoto = listing.roomPhotos?.[0]
  const roomStyleInfo = listing.roomStyle ? ROOM_STYLES[listing.roomStyle] : null

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 border-b border-border bg-white">
        <Link href="/listing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
          <span>戻る</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-yellow-100 px-3 py-1 rounded-full">プレビュー</span>
        </div>
        <Link href={`/listing/${listing.id}/edit`}>
          <Button variant="outline" className="gap-2">
            <Edit2 className="w-4 h-4" />
            編集
          </Button>
        </Link>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1">
        {/* ヒーロー画像 */}
        <div className="relative h-[50vh] bg-muted">
          {firstPhoto ? (
            <img src={firstPhoto} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-6xl">🏠</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{listing.title}</h1>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                listing.status === 'published'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}>
                {listing.status === 'published' ? '公開中' : '下書き'}
              </span>
              {listing.publishedAt && (
                <span className="text-sm text-white/80">
                  公開日: {new Date(listing.publishedAt).toLocaleDateString('ja-JP')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10 md:px-12">
          {/* 部屋のスタイル */}
          {roomStyleInfo && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">お部屋のテイスト</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full w-fit">
                <roomStyleInfo.Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{roomStyleInfo.label}</span>
              </div>
            </section>
          )}

          {/* ストーリー */}
          {listing.story && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">暮らしのストーリー</h2>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{listing.story}</p>
            </section>
          )}

          {/* 写真ギャラリー */}
          {listing.roomPhotos && listing.roomPhotos.length > 1 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">部屋の写真</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {listing.roomPhotos.slice(1).map((photo, index) => (
                  <div key={index} className="rounded-2xl overflow-hidden border border-border aspect-[4/3]">
                    <img src={photo} alt={`部屋 ${index + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 家具 */}
          {listing.furniture && listing.furniture.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">引き継ぎ可能な家具</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {listing.furniture.map(id => {
                  const label = furnitureLabels[id] || id
                  const FurnitureIcon = FURNITURE_ICONS[id] || Sofa
                  return (
                    <div key={id} className="flex flex-col items-center p-4 rounded-xl border border-border">
                      <FurnitureIcon className="w-8 h-8 mb-2 text-foreground" />
                      <span className="text-sm font-medium text-center">{label}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-border bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            これはプレビューです。実際の公開ページとは異なる場合があります。
          </p>
          <Link href={`/listing/${listing.id}/edit`}>
            <Button className="bg-[#E61E4D] hover:bg-[#D01346] text-white gap-2">
              <Edit2 className="w-4 h-4" />
              編集する
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}
