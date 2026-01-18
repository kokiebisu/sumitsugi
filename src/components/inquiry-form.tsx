"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2 } from "lucide-react"
import type { Property } from "@/lib/data"
import { SignupDialog } from "@/components/auth/signup-dialog"
import { useAuth } from "@/contexts/auth-context"

interface InquiryFormProps {
  property: Property
}

export function InquiryForm({ property }: InquiryFormProps) {
  const { user, login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showSignupDialog, setShowSignupDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    duration: "",
    viewing: "",
    questions: "",
  })

  // ユーザーがログインしている場合、フォームに自動入力
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
      }))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if user is logged in
    if (!user) {
      // Show signup dialog
      setShowSignupDialog(true)
      return
    }

    setIsSubmitting(true)

    // Simulate form submission
    // In production, this would send to Google Forms, Tally, or a simple API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Log the inquiry data (for MVP, this would be stored manually)
    console.log("Inquiry submitted:", {
      propertyId: property.id,
      propertyTitle: property.title,
      userId: user.id,
      ...formData,
      submittedAt: new Date().toISOString(),
    })

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleSignupComplete = (newUser: Parameters<typeof login>[0]) => {
    login(newUser)
    setShowSignupDialog(false)
    // Pre-fill form with user data
    setFormData({
      ...formData,
      name: newUser.name,
      email: newUser.email,
    })
  }

  if (isSubmitted) {
    return (
      <div className="rounded-xl bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h3 className="mb-2 text-lg font-medium text-foreground">お問い合わせを受け付けました</h3>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          ご連絡ありがとうございます。
          <br />
          内容を確認の上、数日以内にメールでご連絡いたします。
        </p>
        <p className="text-xs text-muted-foreground">返信が届かない場合は、迷惑メールフォルダもご確認ください。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ログイン済みの場合、ユーザー情報を表示 */}
      {user && (
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{user.name}</span> としてお問い合わせ
          </p>
        </div>
      )}

      {/* Name */}
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
          disabled={!!user}
        />
      </div>

      {/* Email */}
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
          disabled={!!user}
        />
        <p className="text-xs text-muted-foreground">ご連絡はこちらのメールアドレスに送らせていただきます</p>
      </div>

      {/* Reason - Most Important Field */}
      <div className="space-y-2">
        <Label htmlFor="reason" className="text-sm font-medium">
          興味を持った理由 <span className="text-coral">*</span>
        </Label>
        <Textarea
          id="reason"
          required
          placeholder="この物件のどんなところに惹かれましたか？どんな暮らしを想像しましたか？自由にお書きください。"
          rows={5}
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          className="rounded-lg border-border resize-none"
        />
        <p className="text-xs text-muted-foreground">一番大切な項目です。あなたの想いをお聞かせください</p>
      </div>

      {/* Duration - Optional */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          想定している期間（任意）
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { value: "1ヶ月", label: "1ヶ月" },
            { value: "2〜3ヶ月", label: "2〜3ヶ月" },
            { value: "半年程度", label: "半年程度" },
            { value: "1年以上", label: "1年以上" },
            { value: "未定", label: "未定" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, duration: formData.duration === option.value ? "" : option.value })}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                formData.duration === option.value
                  ? "border-foreground bg-muted text-foreground"
                  : "border-border bg-background text-foreground hover:border-foreground/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Viewing - Optional */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          内見について（任意）
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { value: "希望する", label: "希望する" },
            { value: "オンラインで希望", label: "オンラインで希望" },
            { value: "まずは話を聞きたい", label: "まずは話を聞きたい" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, viewing: formData.viewing === option.value ? "" : option.value })}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                formData.viewing === option.value
                  ? "border-foreground bg-muted text-foreground"
                  : "border-border bg-background text-foreground hover:border-foreground/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions - Optional */}
      <div className="space-y-2">
        <Label htmlFor="questions" className="text-sm font-medium">
          質問・不安点（任意）
        </Label>
        <Textarea
          id="questions"
          placeholder="気になることや、確認したいことがあればお書きください"
          rows={3}
          value={formData.questions}
          onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
          className="rounded-lg border-border resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-[#E61E4D] py-6 text-base font-medium text-white hover:bg-[#D01346] disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            送信中...
          </>
        ) : user ? (
          "問い合わせを送る"
        ) : (
          "ログインして問い合わせを送る"
        )}
      </Button>

      {/* Notice */}
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        送信いただいた内容は、マッチングや条件確定のためではなく、
        <br className="hidden sm:block" />
        対話のきっかけとして活用させていただきます。
      </p>

      {/* Signup Dialog */}
      <SignupDialog
        open={showSignupDialog}
        onOpenChange={setShowSignupDialog}
        onSignupComplete={handleSignupComplete}
        prefillEmail={formData.email}
        prefillName={formData.name}
      />
    </form>
  )
}
