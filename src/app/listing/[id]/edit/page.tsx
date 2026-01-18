"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Music, Palette, Leaf, Coffee, Book, Camera, Dumbbell, Gamepad2, UtensilsCrossed, Wine, Plane, Cat, Baby, Sparkles, TreePine, Sofa, Bike, Mountain, Waves, Film, Shirt, Headphones, Tv, Lamp, Armchair, Bath, Moon, Sun, Heart, Flower2, Briefcase, GraduationCap, Tent, Guitar, Upload, X, ArrowLeft, Wifi, Monitor, Refrigerator, WashingMachine, Microwave, AirVent, ParkingCircle, BedDouble, Table, BookOpen, Frame, Clock, Fan, Utensils, CookingPot, Blinds, Archive, Speaker, Printer, LucideIcon } from "lucide-react"

// ライフスタイル（アイコン付き）
const LIFESTYLES = [
  { id: "dj", label: "DJ・音楽", Icon: Music },
  { id: "art", label: "アート", Icon: Palette },
  { id: "plant", label: "植物・ボタニカル", Icon: Leaf },
  { id: "cafe", label: "カフェ風", Icon: Coffee },
  { id: "reading", label: "読書・書斎", Icon: Book },
  { id: "photo", label: "写真・映像", Icon: Camera },
  { id: "fitness", label: "フィットネス", Icon: Dumbbell },
  { id: "gaming", label: "ゲーミング", Icon: Gamepad2 },
  { id: "cooking", label: "料理好き", Icon: UtensilsCrossed },
  { id: "wine", label: "ワイン・お酒", Icon: Wine },
  { id: "travel", label: "旅行・海外", Icon: Plane },
  { id: "pet", label: "ペットと暮らす", Icon: Cat },
  { id: "family", label: "ファミリー向け", Icon: Baby },
  { id: "minimal", label: "ミニマル", Icon: Sparkles },
  { id: "scandinavian", label: "北欧", Icon: TreePine },
  { id: "vintage", label: "ヴィンテージ", Icon: Sofa },
  { id: "cycling", label: "サイクリング", Icon: Bike },
  { id: "outdoor", label: "アウトドア", Icon: Mountain },
  { id: "surf", label: "サーフィン・海", Icon: Waves },
  { id: "movie", label: "映画鑑賞", Icon: Film },
  { id: "fashion", label: "ファッション", Icon: Shirt },
  { id: "audio", label: "オーディオ", Icon: Headphones },
  { id: "theater", label: "ホームシアター", Icon: Tv },
  { id: "lighting", label: "照明・間接照明", Icon: Lamp },
  { id: "lounge", label: "ラウンジ風", Icon: Armchair },
  { id: "spa", label: "スパ・リラックス", Icon: Bath },
  { id: "night", label: "夜型・バー風", Icon: Moon },
  { id: "morning", label: "朝活・朝型", Icon: Sun },
  { id: "wellness", label: "ウェルネス", Icon: Heart },
  { id: "garden", label: "ガーデニング", Icon: Flower2 },
  { id: "work", label: "リモートワーク", Icon: Briefcase },
  { id: "study", label: "勉強・資格", Icon: GraduationCap },
  { id: "camp", label: "キャンプ", Icon: Tent },
  { id: "instrument", label: "楽器演奏", Icon: Guitar },
]

// アメニティ・設備
const POPULAR_AMENITIES = [
  { id: "wifi", label: "Wi-Fi", Icon: Wifi },
  { id: "tv", label: "テレビ", Icon: Tv },
  { id: "kitchen", label: "フルキッチン", Icon: UtensilsCrossed },
  { id: "washingMachine", label: "洗濯機", Icon: WashingMachine },
  { id: "parking", label: "駐車場", Icon: ParkingCircle },
  { id: "aircon", label: "エアコン", Icon: AirVent },
  { id: "workspace", label: "仕事専用スペース", Icon: Monitor },
]

const STANDOUT_AMENITIES = [
  { id: "bathtub", label: "バスタブ", Icon: Bath },
  { id: "refrigerator", label: "冷蔵庫", Icon: Refrigerator },
  { id: "microwave", label: "電子レンジ", Icon: Microwave },
  { id: "balcony", label: "バルコニー", Icon: Sun },
  { id: "closet", label: "収納", Icon: Briefcase },
  { id: "flooring", label: "フローリング", Icon: Sofa },
]

// 家具・インテリアアイテム
const FURNITURE_ITEMS: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "bed", label: "ベッド", Icon: BedDouble },
  { id: "sofa", label: "ソファ", Icon: Sofa },
  { id: "table", label: "テーブル", Icon: Table },
  { id: "chair", label: "チェア", Icon: Armchair },
  { id: "desk", label: "デスク", Icon: Monitor },
  { id: "shelf", label: "シェルフ・棚", Icon: BookOpen },
  { id: "tv", label: "テレビ", Icon: Tv },
  { id: "tvstand", label: "テレビ台", Icon: Archive },
  { id: "lamp", label: "照明・ランプ", Icon: Lamp },
  { id: "curtain", label: "カーテン", Icon: Blinds },
  { id: "rug", label: "ラグ・カーペット", Icon: Frame },
  { id: "mirror", label: "ミラー", Icon: Frame },
  { id: "clock", label: "時計", Icon: Clock },
  { id: "art", label: "アート・絵画", Icon: Palette },
  { id: "plant", label: "観葉植物", Icon: Leaf },
  { id: "speaker", label: "スピーカー", Icon: Speaker },
  { id: "refrigerator", label: "冷蔵庫", Icon: Refrigerator },
  { id: "washingmachine", label: "洗濯機", Icon: WashingMachine },
  { id: "microwave", label: "電子レンジ", Icon: Microwave },
  { id: "aircon", label: "エアコン", Icon: Fan },
  { id: "cookware", label: "調理器具", Icon: CookingPot },
  { id: "dinnerware", label: "食器", Icon: Utensils },
  { id: "storage", label: "収納ボックス", Icon: Archive },
  { id: "printer", label: "プリンター", Icon: Printer },
]

interface InteriorPhoto {
  id: string
  photo?: string
  caption: string
}

export default function EditListingPage() {
  const { user, isLoading, listings, updateListing } = useAuth()
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const listing = listings.find(l => l.id === listingId)

  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([])
  const [story, setStory] = useState("")
  const [interiorPhotos, setInteriorPhotos] = useState<InteriorPhoto[]>([])
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)

  // リスティングデータを読み込み
  useEffect(() => {
    if (listing) {
      setSelectedLifestyles(listing.lifestyles || [])
      setStory(listing.story || "")
      setInteriorPhotos(listing.interiorPhotos?.length ? listing.interiorPhotos : [{ id: '1', photo: undefined, caption: '' }])
      setSelectedFurniture(listing.furniture || [])
      setSelectedAmenities(listing.amenities || [])
    }
  }, [listing])

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

  const handleSave = async () => {
    if (!listing) return
    setIsSaving(true)

    const lifestyleLabels = selectedLifestyles.map(id => {
      const lifestyle = LIFESTYLES.find(l => l.id === id)
      return lifestyle?.label || id
    })
    const title = lifestyleLabels.length > 0
      ? `${lifestyleLabels[0]}の暮らし`
      : "私の暮らし"

    updateListing(listing.id, {
      title,
      lifestyles: selectedLifestyles,
      story,
      amenities: selectedAmenities,
      furniture: selectedFurniture,
      interiorPhotos: interiorPhotos.filter(p => p.photo || p.caption),
    })

    setIsSaving(false)
    router.push("/listing")
  }

  const updateInteriorPhoto = (id: string, field: keyof InteriorPhoto, value: string | undefined) => {
    setInteriorPhotos(interiorPhotos.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const addPhotoSlot = () => {
    if (interiorPhotos.length < 5) {
      setInteriorPhotos([...interiorPhotos, { id: String(Date.now()), photo: undefined, caption: '' }])
    }
  }

  const openUploadDialog = (id: string) => {
    setUploadTargetId(id)
    setUploadDialogOpen(true)
  }

  const closeUploadDialog = () => {
    setUploadDialogOpen(false)
    setUploadTargetId(null)
    setIsUploading(false)
    setUploadedPreview(null)
  }

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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-border">
        <Link href="/listing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
          <span>戻る</span>
        </Link>
        <h1 className="text-lg font-semibold">リスティングを編集</h1>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-[#E61E4D] hover:bg-[#D01346] text-white"
        >
          {isSaving ? "保存中..." : "保存"}
        </Button>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 px-6 py-8 md:px-12">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* ライフスタイル */}
          <section>
            <h2 className="text-xl font-semibold mb-4">ライフスタイル</h2>
            <p className="text-sm text-muted-foreground mb-4">あなたの暮らしを表すキーワードを選択してください</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {LIFESTYLES.map(({ id, label, Icon }) => {
                const isSelected = selectedLifestyles.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedLifestyles(selectedLifestyles.filter((l) => l !== id))
                      } else {
                        setSelectedLifestyles([...selectedLifestyles, id])
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                      isSelected
                        ? "border-foreground bg-muted"
                        : "border-border hover:border-foreground/40"
                    )}
                  >
                    <Icon className="w-5 h-5 text-foreground flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ストーリー */}
          <section>
            <h2 className="text-xl font-semibold mb-4">暮らしのストーリー</h2>
            <p className="text-sm text-muted-foreground mb-4">この空間でどんな暮らしをしてきたか、思い出やこだわりを書いてください</p>
            <Textarea
              placeholder="例：この部屋で過ごした3年間、窓から見える夕日を眺めながらコーヒーを飲むのが毎日の楽しみでした..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="min-h-[200px] resize-none text-base p-4 rounded-xl border-2 focus:border-foreground"
            />
          </section>

          {/* アメニティ・設備 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">アメニティ・設備</h2>
            <p className="text-sm text-muted-foreground mb-4">物件に含まれる設備を選んでください</p>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">人気のアメニティ</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {POPULAR_AMENITIES.map(({ id, label, Icon }) => {
                    const isSelected = selectedAmenities.includes(id)
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAmenities(selectedAmenities.filter((a) => a !== id))
                          } else {
                            setSelectedAmenities([...selectedAmenities, id])
                          }
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                          isSelected
                            ? "border-foreground bg-muted"
                            : "border-border hover:border-foreground/40"
                        )}
                      >
                        <Icon className="w-5 h-5 text-foreground flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">その他の設備</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {STANDOUT_AMENITIES.map(({ id, label, Icon }) => {
                    const isSelected = selectedAmenities.includes(id)
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAmenities(selectedAmenities.filter((a) => a !== id))
                          } else {
                            setSelectedAmenities([...selectedAmenities, id])
                          }
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                          isSelected
                            ? "border-foreground bg-muted"
                            : "border-border hover:border-foreground/40"
                        )}
                      >
                        <Icon className="w-5 h-5 text-foreground flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* 写真 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">インテリア写真</h2>
            <p className="text-sm text-muted-foreground mb-4">お気に入りのスポットや家具を紹介しましょう（最大5つ）</p>
            <div className="space-y-4">
              {interiorPhotos.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="w-32 h-32 flex-shrink-0">
                    {item.photo ? (
                      <div className="relative w-full h-full rounded-xl overflow-hidden">
                        <img src={item.photo} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => updateInteriorPhoto(item.id, 'photo', undefined)}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openUploadDialog(item.id)}
                        className="w-full h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-foreground/40 transition-colors cursor-pointer"
                      >
                        <Upload className="w-5 h-5 mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">写真{index + 1}</p>
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder={`写真${index + 1}の説明...`}
                      value={item.caption}
                      onChange={(e) => updateInteriorPhoto(item.id, 'caption', e.target.value)}
                      className="min-h-[128px] resize-none text-sm"
                    />
                  </div>
                </div>
              ))}
              {interiorPhotos.length < 5 && (
                <Button variant="outline" onClick={addPhotoSlot} className="w-full">
                  写真を追加
                </Button>
              )}
            </div>
          </section>

          {/* 家具・インテリア */}
          <section>
            <h2 className="text-xl font-semibold mb-4">家具・インテリア</h2>
            <p className="text-sm text-muted-foreground mb-4">引き継ぎたい家具やインテリアアイテムを選択してください</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {FURNITURE_ITEMS.map(({ id, label, Icon }) => {
                const isSelected = selectedFurniture.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFurniture(selectedFurniture.filter((f) => f !== id))
                      } else {
                        setSelectedFurniture([...selectedFurniture, id])
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-foreground bg-muted"
                        : "border-border hover:border-foreground/40"
                    )}
                  >
                    <Icon className="w-6 h-6 mb-2 text-foreground" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-center">{label}</span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </main>

      {/* 写真アップロードダイアログ */}
      {uploadDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeUploadDialog} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <button
                onClick={closeUploadDialog}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-base font-semibold">写真をアップロード</h2>
              <div className="w-8 h-8" />
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center">
                    {uploadedPreview && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden mb-4 animate-pulse">
                        <img src={uploadedPreview} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-base font-medium text-foreground">アップロード中...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-3">ドラッグ＆ドロップ</p>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file && uploadTargetId) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              const result = reader.result as string
                              setUploadedPreview(result)
                              setIsUploading(true)
                              setTimeout(() => {
                                updateInteriorPhoto(uploadTargetId, 'photo', result)
                                closeUploadDialog()
                              }, 800)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                      <span className="text-base font-semibold text-foreground underline cursor-pointer hover:no-underline">
                        参照
                      </span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
