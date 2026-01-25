"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { LargeFurnitureType } from "@/lib/data"
import {
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
  X,
  Plus,
  BedDouble,
  Monitor,
  Archive,
  Waves,
  ArrowLeft,
  Upload,
  Coffee,
} from "lucide-react"

// 引き継ぎ対象の大型家具
const LARGE_FURNITURE_ITEMS: { id: LargeFurnitureType; label: string; Icon: typeof BedDouble }[] = [
  { id: "bed", label: "ベッド", Icon: BedDouble },
  { id: "sofa", label: "ソファ", Icon: Sofa },
  { id: "desk", label: "デスク", Icon: Monitor },
  { id: "table", label: "テーブル", Icon: Coffee },
  { id: "storage", label: "収納", Icon: Archive },
]

export default function EditListingPage() {
  const { user, isLoading, listings, updateListing } = useAuth()
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const listing = listings.find(l => l.id === listingId)

  const [selectedFurniture, setSelectedFurniture] = useState<LargeFurnitureType[]>([])
  const [roomPhotos, setRoomPhotos] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  // リスティングデータを読み込み
  useEffect(() => {
    if (listing) {
      setSelectedFurniture(listing.furniture || [])
      setRoomPhotos(listing.roomPhotos || [])
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

    const title = "私の暮らし"

    updateListing(listing.id, {
      title,
      furniture: selectedFurniture,
      roomPhotos,
    })

    setIsSaving(false)
    router.push("/listing")
  }

  const openUploadDialog = () => {
    setUploadDialogOpen(true)
  }

  const closeUploadDialog = () => {
    setUploadDialogOpen(false)
    setIsUploading(false)
    setPendingPhotos([])
  }

  const removePendingPhoto = (index: number) => {
    setPendingPhotos(pendingPhotos.filter((_, i) => i !== index))
  }

  const removeRoomPhoto = (index: number) => {
    setRoomPhotos(roomPhotos.filter((_, i) => i !== index))
  }

  const handleUploadConfirm = () => {
    if (pendingPhotos.length === 0) return

    setIsUploading(true)
    setTimeout(() => {
      const remaining = 5 - roomPhotos.length
      const photosToAdd = pendingPhotos.slice(0, remaining)
      setRoomPhotos([...roomPhotos, ...photosToAdd])
      closeUploadDialog()
    }, 500)
  }

  const handleFilesSelect = async (files: FileList | null) => {
    if (!files) return

    setIsLoadingFiles(true)
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })

      setPendingPhotos((prev) => [...prev, result])
    }
    setIsLoadingFiles(false)
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
          {/* 写真 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">部屋の写真</h2>
            <p className="text-sm text-muted-foreground mb-4">お部屋の魅力が伝わる写真を追加してください（3〜5枚）</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {roomPhotos.map((photo, index) => (
                <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                  <img src={photo} alt={`部屋 ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeRoomPhoto(index)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white font-medium">
                      カバー
                    </div>
                  )}
                </div>
              ))}
              {roomPhotos.length < 5 && (
                <button
                  onClick={openUploadDialog}
                  className="aspect-[4/3] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-foreground/40 transition-colors cursor-pointer"
                >
                  <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">追加</span>
                </button>
              )}
            </div>
          </section>

          {/* 家具 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">引き継ぐ家具</h2>
            <p className="text-sm text-muted-foreground mb-4">次の入居者に引き継ぎたい大型家具を選んでください</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LARGE_FURNITURE_ITEMS.map(({ id, label, Icon }) => {
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
                      "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-foreground bg-muted"
                        : "border-border hover:border-foreground/40"
                    )}
                  >
                    <Icon className="w-8 h-8 mb-2 text-foreground" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-center">{label}</span>
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
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-16 h-16 mb-4">
                    <svg className="w-full h-full animate-spin" viewBox="0 0 50 50">
                      <circle cx="25" cy="25" r="20" fill="none" stroke="#E5E5E5" strokeWidth="4" />
                      <circle cx="25" cy="25" r="20" fill="none" stroke="#222222" strokeWidth="4" strokeLinecap="round" strokeDasharray="80, 200" strokeDashoffset="0" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-foreground">アップロード中...</p>
                </div>
              ) : pendingPhotos.length > 0 || isLoadingFiles ? (
                <div className="overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <div className="flex gap-3" style={{ minWidth: "min-content" }}>
                    {pendingPhotos.map((photo, index) => (
                      <div key={index} className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden group">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePendingPhoto(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {isLoadingFiles && (
                      <div className="flex-shrink-0 w-32 h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                        <span className="text-xs text-muted-foreground">読み込み中...</span>
                      </div>
                    )}
                    {!isLoadingFiles && (
                      <label className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-foreground/40 transition-colors cursor-pointer">
                        <Plus className="w-6 h-6 mb-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">追加</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFilesSelect(e.target.files)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-3">ドラッグ＆ドロップ</p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFilesSelect(e.target.files)}
                    />
                    <span className="text-base font-semibold text-foreground underline cursor-pointer hover:no-underline">
                      参照
                    </span>
                  </label>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <button onClick={closeUploadDialog} className="text-sm font-medium text-foreground underline hover:no-underline">
                閉じる
              </button>
              <Button
                onClick={handleUploadConfirm}
                disabled={pendingPhotos.length === 0 || isUploading}
                className={cn(
                  "rounded-lg px-6 py-2 text-sm font-medium",
                  pendingPhotos.length > 0
                    ? "bg-foreground text-white hover:bg-foreground/90"
                    : "bg-[#DDDDDD] text-muted-foreground cursor-not-allowed"
                )}
              >
                アップロード
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
