"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/site-config"

interface CreateListingFlowProps {
  onComplete: (listingData: ListingData) => void
  onClose: () => void
}

interface ListingData {
  categories: string[]
  // 他のフィールドは今後追加
}

type Step = "intro" | "category" | "details" | "confirm"

const steps: Step[] = ["intro", "category", "details", "confirm"]

// 物件のカテゴリー（シンプルなSVGアイコン）
const categories = [
  { id: "interior", label: "インテリア" },
  { id: "plants", label: "植物・グリーン" },
  { id: "art", label: "アート・デザイン" },
  { id: "music", label: "音楽" },
  { id: "books", label: "本・読書" },
  { id: "cooking", label: "料理・フード" },
  { id: "minimalist", label: "ミニマリスト" },
  { id: "vintage", label: "ヴィンテージ" },
  { id: "diy", label: "DIY・クラフト" },
  { id: "photo", label: "写真・映像" },
  { id: "fashion", label: "ファッション" },
  { id: "pets", label: "ペット" },
  { id: "tech", label: "テック・ガジェット" },
  { id: "outdoor", label: "アウトドア" },
  { id: "wellness", label: "ウェルネス" },
  { id: "coffee", label: "コーヒー・カフェ" },
  { id: "wine", label: "ワイン・お酒" },
  { id: "film", label: "映画・シネマ" },
  { id: "gaming", label: "ゲーム" },
  { id: "travel", label: "旅行" },
  { id: "yoga", label: "ヨガ・瞑想" },
  { id: "bicycle", label: "自転車" },
  { id: "nordic", label: "北欧スタイル" },
  { id: "japanese", label: "和モダン" },
  { id: "industrial", label: "インダストリアル" },
  { id: "bohemian", label: "ボヘミアン" },
  { id: "natural", label: "ナチュラル" },
  { id: "ceramic", label: "陶芸・工芸" },
  { id: "storage", label: "収納・整理" },
  { id: "aquarium", label: "アクアリウム" },
  { id: "other", label: "その他" },
]

// カテゴリーアイコン（Airbnb風のシンプルな線画）
function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const iconClass = cn("w-8 h-8", className)

  switch (id) {
    case "interior":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 26V14l12-8 12 8v12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 26v-8h8v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "plants":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 28V16" strokeLinecap="round" />
          <path d="M16 16c-4-4-4-10 0-12 4 2 4 8 0 12z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 20c-6-2-8-8-4-12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 20c6-2 8-8 4-12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "art":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="10" cy="12" r="2" />
          <circle cx="22" cy="12" r="2" />
          <circle cx="14" cy="20" r="2" />
          <path d="M16 4a12 12 0 1 0 12 12c0-2-1-3-3-3h-2a3 3 0 0 1-3-3V8a4 4 0 0 0-4-4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "music":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 24V8l14-4v16" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="24" r="4" />
          <circle cx="22" cy="20" r="4" />
        </svg>
      )
    case "books":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h8c2 0 4 2 4 4v16c0-1.5-1.5-3-3-3H4V6z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M28 6h-8c-2 0-4 2-4 4v16c0-1.5 1.5-3 3-3h9V6z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "cooking":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4v6M10 4v4M22 4v4" strokeLinecap="round" />
          <path d="M6 14h20v2a10 10 0 0 1-20 0v-2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 26v2" strokeLinecap="round" />
        </svg>
      )
    case "minimalist":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="6" width="20" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="6" y1="16" x2="26" y2="16" strokeLinecap="round" />
        </svg>
      )
    case "vintage":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="16" cy="16" r="10" />
          <path d="M16 10v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="2" fill="currentColor" />
        </svg>
      )
    case "diy":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 4l-4 4 10 10 4-4-10-10z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 18l6 6M8 8l-4 4 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "photo":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="8" width="24" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="17" r="5" />
          <path d="M10 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "fashion":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4l-6 4v6l6 2 6-2V8l-6-4z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 14v12l6 2 6-2V14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "pets":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="16" cy="22" rx="6" ry="4" />
          <circle cx="9" cy="14" r="3" />
          <circle cx="23" cy="14" r="3" />
          <circle cx="6" cy="20" r="2" />
          <circle cx="26" cy="20" r="2" />
        </svg>
      )
    case "tech":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="4" width="20" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 28h12M16 24v4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "outdoor":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4l10 20H6L16 4z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 24l4-8 4 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "wellness":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 28c-6.627 0-12-5.373-12-12S9.373 4 16 4c0 6.627 5.373 12 12 12-6.627 0-12 5.373-12 12z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "coffee":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 10h16v12a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V10z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 12h2a3 3 0 0 1 0 6h-2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 4v4M14 4v4M18 4v4" strokeLinecap="round" />
        </svg>
      )
    case "wine":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 18v10M10 28h12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 4h16l-2 10a6 6 0 0 1-12 0L8 4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "film":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="6" width="24" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 10h24M4 22h24M10 6v4M10 22v4M22 6v4M22 22v4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "gaming":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 12h20a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 16v4M8 18h4" strokeLinecap="round" />
          <circle cx="21" cy="16" r="1" fill="currentColor" />
          <circle cx="24" cy="19" r="1" fill="currentColor" />
        </svg>
      )
    case "travel":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="16" cy="16" r="12" />
          <ellipse cx="16" cy="16" rx="5" ry="12" />
          <path d="M4 16h24M6 10h20M6 22h20" strokeLinecap="round" />
        </svg>
      )
    case "yoga":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="16" cy="6" r="3" />
          <path d="M16 9v8M10 28l6-11 6 11M8 17l8 4 8-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "bicycle":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="8" cy="20" r="5" />
          <circle cx="24" cy="20" r="5" />
          <path d="M8 20l4-8h8l4 8M12 12l4 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "nordic":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4l3 8h8l-6.5 5 2.5 8-7-5-7 5 2.5-8L5 12h8l3-8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "japanese":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 26h24" strokeLinecap="round" />
          <path d="M8 26V14l8-8 8 8v12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 26v-6h4v6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "industrial":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 28V12l8-6v10l8-6v10l8-6v14H4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "bohemian":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="16" cy="16" r="10" />
          <circle cx="16" cy="16" r="6" />
          <circle cx="16" cy="16" r="2" />
          <path d="M16 4v2M16 26v2M4 16h2M26 16h2" strokeLinecap="round" />
        </svg>
      )
    case "natural":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 28V16" strokeLinecap="round" />
          <path d="M16 16c0-8 6-12 12-12-2 6-6 12-12 12z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 20c0-6-4-9-9-9 1.5 4.5 4.5 9 9 9z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "ceramic":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 8h12c0 4 2 8 2 14a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4c0-6 2-10 2-14z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 14h12" strokeLinecap="round" />
        </svg>
      )
    case "storage":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="24" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="4" y="12" width="24" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="4" y="20" width="24" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 8h4M14 16h4M14 24h4" strokeLinecap="round" />
        </svg>
      )
    case "aquarium":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="6" width="24" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 14c2-2 4 2 6 0s4 2 6 0" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="18" r="1" fill="currentColor" />
          <path d="M8 26h16" strokeLinecap="round" />
        </svg>
      )
    case "other":
      return (
        <svg className={iconClass} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="16" cy="16" r="2" fill="currentColor" />
          <circle cx="8" cy="16" r="2" fill="currentColor" />
          <circle cx="24" cy="16" r="2" fill="currentColor" />
        </svg>
      )
    default:
      return null
  }
}

export function CreateListingFlow({ onComplete, onClose }: CreateListingFlowProps) {
  const [step, setStep] = useState<Step>("intro")

  // Category selection (複数選択可能)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const currentStepIndex = steps.indexOf(step)

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1])
    } else {
      onClose()
    }
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1])
    }
  }

  const handleSubmit = async () => {
    const listingData: ListingData = {
      categories: selectedCategories,
    }
    onComplete(listingData)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const canProceed = useCallback(() => {
    switch (step) {
      case "intro":
        return true
      case "category":
        return selectedCategories.length > 0
      case "details":
        return true // 詳細ステップは今後追加
      case "confirm":
        return true
      default:
        return false
    }
  }, [step, selectedCategories.length])

  // Enterキーで次へ進む
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && canProceed()) {
        if ((e.target as HTMLElement)?.tagName === "TEXTAREA") {
          return
        }
        e.preventDefault()
        if (step === "confirm") {
          handleSubmit()
        } else {
          handleNext()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canProceed, step])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-xl font-bold text-coral">{siteConfig.name}</span>
        <Button variant="outline" onClick={onClose} className="rounded-full">
          保存して終了
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Step: Intro */}
        {step === "intro" && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col justify-center px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ1</p>
              <h1 className="text-4xl font-semibold mb-6">
                物件を
                <br />
                掲載する
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                あなたの暮らしの空間を、次の入居者に引き継ぎましょう。
                まずは物件のスタイルについて教えてください。
              </p>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&auto=format&fit=crop&q=90"
                alt="暮らしのイメージ"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Step: Category */}
        {step === "category" && (
          <div className="flex min-h-full overflow-hidden">
            <div className="flex flex-1 flex-col justify-center py-16 overflow-hidden">
              <div className="px-12 lg:px-24">
                <p className="text-sm text-muted-foreground mb-2">ステップ1</p>
                <h1 className="text-4xl font-semibold mb-6">
                  どのようなスタイルの
                  <br />
                  空間ですか？
                </h1>
                <p className="text-muted-foreground mb-8">
                  この物件に近いカテゴリーを選んでください（複数選択可）
                </p>
              </div>
              <div className="relative">
                <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="grid grid-rows-2 grid-flow-col gap-3 w-max pl-12 lg:pl-24 pr-24">
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category.id)
                      return (
                        <button
                          key={category.id}
                          onClick={() => toggleCategory(category.id)}
                          className={cn(
                            "flex flex-col items-center justify-center rounded-2xl border p-4 w-[130px] h-28 transition-all relative",
                            isSelected
                              ? "border-2 border-foreground"
                              : "border-border hover:border-foreground/40"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-foreground rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-background" />
                            </div>
                          )}
                          <CategoryIcon id={category.id} className="mb-2 text-foreground" />
                          <span className="text-xs font-medium text-foreground whitespace-nowrap">
                            {category.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                {/* Left blur/fade effect */}
                <div className="absolute left-0 top-0 bottom-4 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
                {/* Right blur/fade effect */}
                <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
              </div>
            </div>
          </div>
        )}

        {/* Step: Details - 今後実装 */}
        {step === "details" && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col justify-center px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ2</p>
              <h1 className="text-4xl font-semibold mb-6">
                物件の詳細
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                物件の詳細情報を入力してください。
                （このステップは今後実装予定です）
              </p>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&auto=format&fit=crop&q=90"
                alt="物件イメージ"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col justify-center px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ3</p>
              <h1 className="text-4xl font-semibold mb-6">
                掲載内容の確認
              </h1>
              <p className="text-muted-foreground mb-8">
                以下の内容で物件を掲載します
              </p>
              <div className="space-y-4 rounded-xl border p-6 max-w-md">
                <div>
                  <p className="text-sm text-muted-foreground">カテゴリー</p>
                  <p className="font-medium">
                    {selectedCategories
                      .map((id) => categories.find((c) => c.id === id)?.label)
                      .filter(Boolean)
                      .join("、")}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&auto=format&fit=crop&q=90"
                alt="確認イメージ"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer with Progress */}
      <footer className="border-t">
        {/* Progress Bar */}
        <div className="flex">
          {steps.map((s, index) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1",
                index <= currentStepIndex ? "bg-foreground" : "bg-border"
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-base font-medium underline underline-offset-4"
          >
            戻る
          </Button>

          {step === "confirm" ? (
            <Button
              onClick={handleSubmit}
              size="lg"
              className="h-12 px-8 rounded-lg bg-foreground text-background hover:bg-foreground/90"
            >
              <Check className="mr-2 h-4 w-4" />
              掲載する
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              size="lg"
              className="h-12 px-8 rounded-lg bg-foreground text-background hover:bg-foreground/90"
            >
              次へ
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
