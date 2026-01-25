"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2 } from "lucide-react"

export function SellerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    propertyAddress: "",
    monthlyRent: "",
    moveOutDate: "",
    whyListing: "",
    landlordConsent: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Log the seller listing data
    console.log("Seller listing submitted:", {
      ...formData,
      submittedAt: new Date().toISOString(),
    })

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="rounded-xl bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h3 className="mb-2 text-lg font-medium text-foreground">お申し込みを受け付けました</h3>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          ご登録ありがとうございます。
          <br />
          内容を確認の上、3営業日以内に運営からご連絡いたします。
          <br />
          詳しいヒアリングの日程調整をさせていただきます。
        </p>
        <p className="text-xs text-muted-foreground">
          返信が届かない場合は、迷惑メールフォルダもご確認ください。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">基本情報</h3>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            お名前 <span className="text-coral">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            required
            placeholder="山田 太郎"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-lg border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            メールアドレス <span className="text-coral">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="rounded-lg border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            電話番号 <span className="text-coral">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            required
            placeholder="090-1234-5678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="rounded-lg border-border"
          />
        </div>
      </div>

      {/* Property Information */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground">物件情報</h3>

        <div className="space-y-2">
          <Label htmlFor="propertyAddress" className="text-sm font-medium">
            物件の住所（区まで） <span className="text-coral">*</span>
          </Label>
          <Input
            id="propertyAddress"
            type="text"
            required
            placeholder="例：東京都目黒区"
            value={formData.propertyAddress}
            onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
            className="rounded-lg border-border"
          />
          <p className="text-xs text-muted-foreground">詳細な住所は後ほどお伺いします</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyRent" className="text-sm font-medium">
            月額家賃 <span className="text-coral">*</span>
          </Label>
          <div className="relative">
            <Input
              id="monthlyRent"
              type="number"
              required
              placeholder="95000"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
              className="rounded-lg border-border pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              円
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="moveOutDate" className="text-sm font-medium">
            退去予定日 <span className="text-coral">*</span>
          </Label>
          <Input
            id="moveOutDate"
            type="date"
            required
            value={formData.moveOutDate}
            onChange={(e) => setFormData({ ...formData, moveOutDate: e.target.value })}
            className="rounded-lg border-border"
          />
          <p className="text-xs text-muted-foreground">おおよその予定で構いません</p>
        </div>
      </div>

      {/* Story */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground">空間について</h3>

        <div className="space-y-2">
          <Label htmlFor="whyListing" className="text-sm font-medium">
            この部屋を掲載したい理由 <span className="text-coral">*</span>
          </Label>
          <Textarea
            id="whyListing"
            required
            placeholder="どんな暮らしをしてきましたか？なぜ引き継ぎたいと思いましたか？"
            rows={5}
            value={formData.whyListing}
            onChange={(e) => setFormData({ ...formData, whyListing: e.target.value })}
            className="rounded-lg border-border resize-none"
          />
          <p className="text-xs text-muted-foreground">
            この想いが、次の人との出会いにつながります
          </p>
        </div>
      </div>

      {/* Landlord Consent */}
      <div className="space-y-4 border-t border-border pt-6">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="landlordConsent"
            required
            checked={formData.landlordConsent}
            onChange={(e) => setFormData({ ...formData, landlordConsent: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-border text-coral focus:ring-coral"
          />
          <Label htmlFor="landlordConsent" className="text-sm leading-relaxed">
            大家さん・管理会社に引き継ぎの意向を伝え、承諾を得ています（または、掲載前に必ず承諾を得ます）
            <span className="text-coral">*</span>
          </Label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-coral py-6 text-base font-medium text-white hover:bg-coral-dark disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            送信中...
          </>
        ) : (
          "掲載を申し込む"
        )}
      </Button>

      {/* Notice */}
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        送信後、運営からご連絡し、詳しいヒアリングと掲載内容の作成をサポートします。
        <br />
        掲載には大家さん・管理会社の承諾が必須となります。
      </p>
    </form>
  )
}
