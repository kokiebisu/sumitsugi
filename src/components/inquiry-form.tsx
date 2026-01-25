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
  const { user, login, addInquiry } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showSignupDialog, setShowSignupDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    questions: "",
  })

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

    if (!user) {
      setShowSignupDialog(true)
      return
    }

    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    addInquiry({
      propertyId: property.id,
      propertyTitle: property.title,
      status: "pending",
      applicantName: formData.name,
      applicantEmail: formData.email,
      reason: formData.reason,
      questions: formData.questions,
    })

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleSignupComplete = (newUser: Parameters<typeof login>[0]) => {
    login(newUser)
    setShowSignupDialog(false)
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
        <h3 className="mb-2 text-lg font-medium text-foreground">引き継ぎ申し込みを受け付けました</h3>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          ご連絡ありがとうございます。
          <br />
          内容を確認の上、数日以内にメールでご連絡いたします。
        </p>
        <p className="text-xs text-muted-foreground">返信が届かない場合は、迷惑メールフォルダもご確認ください。</p>

        <div className="mt-6">
          <Button
            onClick={() => window.location.href = "/dashboard"}
            className="w-full rounded-lg bg-coral py-3 text-sm font-semibold text-white hover:bg-coral/90"
          >
            ダッシュボードで進捗を確認
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {user && (
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{user.name}</span> として申し込み
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
          この暮らしに興味を持った理由 <span className="text-coral">*</span>
        </Label>
        <Textarea
          id="reason"
          required
          placeholder="この暮らしのどんなところに惹かれましたか？どんな生活を想像しましたか？自由にお書きください。"
          rows={5}
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          className="rounded-lg border-border resize-none"
        />
        <p className="text-xs text-muted-foreground">一番大切な項目です。あなたの想いをお聞かせください</p>
      </div>

      {/* Questions - Optional */}
      <div className="space-y-2">
        <Label htmlFor="questions" className="text-sm font-medium">
          質問・確認したいこと（任意）
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
        className="w-full rounded-lg bg-coral py-6 text-base font-medium text-white hover:bg-coral/90 disabled:opacity-70 shadow-md"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            送信中...
          </>
        ) : user ? (
          "引き継ぎを申し込む"
        ) : (
          "ログインして申し込む"
        )}
      </Button>

      {/* Notice */}
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        送信後、内見の日程調整のご連絡をいたします。
        <br className="hidden sm:block" />
        この暮らしがあなたに合うかどうか、実際に見て判断してください。
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
