"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Check } from "lucide-react"
import type { SellerProfile } from "@/lib/data"

interface BecomeSellerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (sellerProfile: SellerProfile) => void
}

type Step = "profile" | "social" | "confirm"

export function BecomeSellerDialog({
  open,
  onOpenChange,
  onComplete,
}: BecomeSellerDialogProps) {
  const [step, setStep] = useState<Step>("profile")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Profile fields
  const [occupation, setOccupation] = useState("")
  const [bio, setBio] = useState("")

  // Social links
  const [instagram, setInstagram] = useState("")
  const [twitter, setTwitter] = useState("")
  const [website, setWebsite] = useState("")

  const handleBack = () => {
    if (step === "social") setStep("profile")
    else if (step === "confirm") setStep("social")
  }

  const handleNext = () => {
    if (step === "profile") setStep("social")
    else if (step === "social") setStep("confirm")
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const sellerProfile: SellerProfile = {
      occupation,
      bio,
      socialLinks: {
        instagram: instagram || undefined,
        twitter: twitter || undefined,
        website: website || undefined,
      },
      sellerSince: new Date().toISOString(),
    }

    setIsSubmitting(false)
    onComplete(sellerProfile)

    // Reset form
    setStep("profile")
    setOccupation("")
    setBio("")
    setInstagram("")
    setTwitter("")
    setWebsite("")
  }

  const canProceedFromProfile = occupation.trim() !== "" && bio.trim() !== ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-5 relative border-b border-border">
          {step !== "profile" && (
            <button
              onClick={handleBack}
              className="absolute left-4 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">戻る</span>
            </button>
          )}
          <DialogTitle className="text-center text-base font-semibold">
            クリエイターになる
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6">
          {/* Step 1: Profile */}
          {step === "profile" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold mb-2">プロフィールを教えてください</h2>
                <p className="text-sm text-muted-foreground">
                  入居希望者に表示される情報です
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">職業・活動</Label>
                  <Input
                    id="occupation"
                    placeholder="例: グラフィックデザイナー、音楽プロデューサー"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">自己紹介</Label>
                  <Textarea
                    id="bio"
                    placeholder="あなたのことや、どんな空間を作ってきたかを教えてください"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={!canProceedFromProfile}
                className="w-full h-12 rounded-lg bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-base font-semibold text-white hover:from-[#D01346] hover:to-[#C7045D]"
              >
                次へ
              </Button>
            </div>
          )}

          {/* Step 2: Social Links */}
          {step === "social" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold mb-2">SNSリンク（任意）</h2>
                <p className="text-sm text-muted-foreground">
                  入居希望者があなたの活動を知れるようになります
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">X (Twitter)</Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">ウェブサイト</Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleNext}
                  className="flex-1 h-12 rounded-lg"
                >
                  スキップ
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 h-12 rounded-lg bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-base font-semibold text-white hover:from-[#D01346] hover:to-[#C7045D]"
                >
                  次へ
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold mb-2">確認</h2>
                <p className="text-sm text-muted-foreground">
                  以下の内容でクリエイターとして登録します
                </p>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">職業・活動</p>
                  <p className="font-medium">{occupation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">自己紹介</p>
                  <p className="font-medium whitespace-pre-wrap">{bio}</p>
                </div>
                {(instagram || twitter || website) && (
                  <div>
                    <p className="text-sm text-muted-foreground">SNS</p>
                    <div className="space-y-1">
                      {instagram && <p className="text-sm">Instagram: {instagram}</p>}
                      {twitter && <p className="text-sm">X: {twitter}</p>}
                      {website && <p className="text-sm">Web: {website}</p>}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 rounded-lg bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-base font-semibold text-white hover:from-[#D01346] hover:to-[#C7045D]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登録中...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    クリエイターになる
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
