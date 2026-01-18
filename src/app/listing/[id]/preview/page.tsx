"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit2, Music, Palette, Leaf, Coffee, Book, Camera, Dumbbell, Gamepad2, UtensilsCrossed, Wine, Plane, Cat, Baby, Sparkles, TreePine, Sofa, Bike, Mountain, Waves, Film, Shirt, Headphones, Tv, Lamp, Armchair, Bath, Moon, Sun, Heart, Flower2, Briefcase, GraduationCap, Tent, Guitar, Wifi, Monitor, Refrigerator, WashingMachine, Microwave, AirVent, ParkingCircle, BedDouble, Table, BookOpen, Frame, Clock, Fan, Utensils, CookingPot, Blinds, Archive, Speaker, Printer, LucideIcon, Check } from "lucide-react"

// ライフスタイル（アイコン付き）
const LIFESTYLES: Record<string, { label: string; Icon: LucideIcon }> = {
  dj: { label: "DJ・音楽", Icon: Music },
  art: { label: "アート", Icon: Palette },
  plant: { label: "植物・ボタニカル", Icon: Leaf },
  cafe: { label: "カフェ風", Icon: Coffee },
  reading: { label: "読書・書斎", Icon: Book },
  photo: { label: "写真・映像", Icon: Camera },
  fitness: { label: "フィットネス", Icon: Dumbbell },
  gaming: { label: "ゲーミング", Icon: Gamepad2 },
  cooking: { label: "料理好き", Icon: UtensilsCrossed },
  wine: { label: "ワイン・お酒", Icon: Wine },
  travel: { label: "旅行・海外", Icon: Plane },
  pet: { label: "ペットと暮らす", Icon: Cat },
  family: { label: "ファミリー向け", Icon: Baby },
  minimal: { label: "ミニマル", Icon: Sparkles },
  scandinavian: { label: "北欧", Icon: TreePine },
  vintage: { label: "ヴィンテージ", Icon: Sofa },
  cycling: { label: "サイクリング", Icon: Bike },
  outdoor: { label: "アウトドア", Icon: Mountain },
  surf: { label: "サーフィン・海", Icon: Waves },
  movie: { label: "映画鑑賞", Icon: Film },
  fashion: { label: "ファッション", Icon: Shirt },
  audio: { label: "オーディオ", Icon: Headphones },
  theater: { label: "ホームシアター", Icon: Tv },
  lighting: { label: "照明・間接照明", Icon: Lamp },
  lounge: { label: "ラウンジ風", Icon: Armchair },
  spa: { label: "スパ・リラックス", Icon: Bath },
  night: { label: "夜型・バー風", Icon: Moon },
  morning: { label: "朝活・朝型", Icon: Sun },
  wellness: { label: "ウェルネス", Icon: Heart },
  garden: { label: "ガーデニング", Icon: Flower2 },
  work: { label: "リモートワーク", Icon: Briefcase },
  study: { label: "勉強・資格", Icon: GraduationCap },
  camp: { label: "キャンプ", Icon: Tent },
  instrument: { label: "楽器演奏", Icon: Guitar },
}

// アメニティ
const AMENITIES: Record<string, { label: string; Icon: LucideIcon }> = {
  wifi: { label: "Wi-Fi", Icon: Wifi },
  tv: { label: "テレビ", Icon: Tv },
  kitchen: { label: "フルキッチン", Icon: UtensilsCrossed },
  washingMachine: { label: "洗濯機", Icon: WashingMachine },
  parking: { label: "駐車場", Icon: ParkingCircle },
  aircon: { label: "エアコン", Icon: AirVent },
  workspace: { label: "仕事専用スペース", Icon: Monitor },
  bathtub: { label: "バスタブ", Icon: Bath },
  refrigerator: { label: "冷蔵庫", Icon: Refrigerator },
  microwave: { label: "電子レンジ", Icon: Microwave },
  balcony: { label: "バルコニー", Icon: Sun },
  closet: { label: "収納", Icon: Briefcase },
  flooring: { label: "フローリング", Icon: Sofa },
}

// 家具
const FURNITURE: Record<string, { label: string; Icon: LucideIcon }> = {
  bed: { label: "ベッド", Icon: BedDouble },
  sofa: { label: "ソファ", Icon: Sofa },
  table: { label: "テーブル", Icon: Table },
  chair: { label: "チェア", Icon: Armchair },
  desk: { label: "デスク", Icon: Monitor },
  shelf: { label: "シェルフ・棚", Icon: BookOpen },
  tvstand: { label: "テレビ台", Icon: Archive },
  lamp: { label: "照明・ランプ", Icon: Lamp },
  curtain: { label: "カーテン", Icon: Blinds },
  rug: { label: "ラグ・カーペット", Icon: Frame },
  mirror: { label: "ミラー", Icon: Frame },
  clock: { label: "時計", Icon: Clock },
  art: { label: "アート・絵画", Icon: Palette },
  plant: { label: "観葉植物", Icon: Leaf },
  speaker: { label: "スピーカー", Icon: Speaker },
  washingmachine: { label: "洗濯機", Icon: WashingMachine },
  aircon: { label: "エアコン", Icon: Fan },
  cookware: { label: "調理器具", Icon: CookingPot },
  dinnerware: { label: "食器", Icon: Utensils },
  storage: { label: "収納ボックス", Icon: Archive },
  printer: { label: "プリンター", Icon: Printer },
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

  const firstPhoto = listing.interiorPhotos?.find(p => p.photo)?.photo

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
          {/* ライフスタイル */}
          {listing.lifestyles && listing.lifestyles.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">ライフスタイル</h2>
              <div className="flex flex-wrap gap-2">
                {listing.lifestyles.map(id => {
                  const lifestyle = LIFESTYLES[id]
                  if (!lifestyle) return null
                  const { label, Icon } = lifestyle
                  return (
                    <div key={id} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  )
                })}
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
          {listing.interiorPhotos && listing.interiorPhotos.filter(p => p.photo).length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">インテリア</h2>
              <div className="space-y-6">
                {listing.interiorPhotos.filter(p => p.photo).map((photo, index) => (
                  <div key={photo.id || index} className="rounded-2xl overflow-hidden border border-border">
                    <img src={photo.photo} alt="" className="w-full h-64 object-cover" />
                    {photo.caption && (
                      <div className="p-4 bg-muted/50">
                        <p className="text-sm text-foreground">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* アメニティ */}
          {listing.amenities && listing.amenities.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">アメニティ・設備</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.amenities.map(id => {
                  const amenity = AMENITIES[id]
                  if (!amenity) return null
                  const { label, Icon } = amenity
                  return (
                    <div key={id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                      <Icon className="w-5 h-5 text-foreground" />
                      <span className="text-sm font-medium">{label}</span>
                      <Check className="w-4 h-4 text-green-600 ml-auto" />
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 家具・インテリア */}
          {listing.furniture && listing.furniture.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">引き継ぎ可能な家具・インテリア</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {listing.furniture.map(id => {
                  const item = FURNITURE[id]
                  if (!item) return null
                  const { label, Icon } = item
                  return (
                    <div key={id} className="flex flex-col items-center p-3 rounded-xl border border-border">
                      <Icon className="w-6 h-6 mb-2 text-foreground" />
                      <span className="text-xs font-medium text-center">{label}</span>
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
