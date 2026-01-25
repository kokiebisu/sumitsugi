"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, Mail, X } from "lucide-react"
import type { User } from "@/lib/data"

interface SignupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignupComplete: (user: User) => void
  prefillEmail?: string
  prefillName?: string
}

export function SignupDialog({
  open,
  onOpenChange,
  onSignupComplete,
  prefillEmail = "",
  prefillName = "",
}: SignupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authMethod, setAuthMethod] = useState<"phone" | "email" | null>(null)
  const [email, setEmail] = useState(prefillEmail)
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState("+81")
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")

  const handleEmailSubmit = async () => {
    if (!email) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const fullName = lastName && firstName
      ? `${lastName} ${firstName}`
      : lastName || firstName || "ゲスト"

    const newUser: User = {
      id: crypto.randomUUID(),
      email: email,
      name: fullName,
      createdAt: new Date().toISOString(),
      authProvider: "email",
      isSeller: false,
    }

    console.log("User created via email:", newUser)
    setIsSubmitting(false)
    onSignupComplete(newUser)
  }

  const handleSocialLogin = async (provider: string) => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const fullName = lastName && firstName
      ? `${lastName} ${firstName}`
      : lastName || firstName || "ゲスト"

    const newUser: User = {
      id: crypto.randomUUID(),
      email: `user@${provider}.com`,
      name: fullName,
      createdAt: new Date().toISOString(),
      authProvider: provider as "google" | "facebook" | "apple",
      isSeller: false,
    }

    console.log(`User created via ${provider}:`, newUser)
    setIsSubmitting(false)
    onSignupComplete(newUser)
  }

  // Main screen with options
  if (!authMethod) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[568px] p-0 gap-0" hideClose>
          <DialogHeader className="px-6 pt-6 pb-5 relative border-b border-border">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute left-4 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <DialogTitle className="text-center text-base font-semibold">
              申し込むにはログインまたは登録してください
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pt-6 pb-6">
            <div className="space-y-4">
              {/* Country/Region Selector */}
              <div>
                <label className="block text-xs font-medium mb-2">国/地域</label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-14 w-full border border-gray-300 px-3 text-base focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                  style={{ borderRadius: '8px' }}
                >
                  <option value="+81">日本 (+81)</option>
                  <option value="+1">アメリカ合衆国 (+1)</option>
                  <option value="+86">中国 (+86)</option>
                  <option value="+82">韓国 (+82)</option>
                </select>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-xs font-medium mb-2">電話番号</label>
                <input
                  type="tel"
                  placeholder=""
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 w-full border border-gray-300 px-3 text-base focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                  style={{ borderRadius: '8px' }}
                />
                <p className="mt-2 text-xs text-gray-600">
                  確認コードを記載したSMSをお送りします。通話料やSMS送信料が発生する場合があります。
                </p>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleEmailSubmit}
                disabled={!phone || isSubmitting}
                className="h-12 w-full rounded-lg bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-base font-semibold text-white hover:from-[#D01346] hover:to-[#C7045D] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  "続行"
                )}
              </Button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-4 text-xs text-gray-600">または</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSocialLogin("facebook")}
                  disabled={isSubmitting}
                  className="relative w-full h-12 rounded-lg border border-black text-[15px] font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                >
                  <svg className="absolute left-4 h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebookで続ける</span>
                </button>

                <button
                  onClick={() => handleSocialLogin("google")}
                  disabled={isSubmitting}
                  className="relative w-full h-12 rounded-lg border border-black text-[15px] font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                >
                  <svg className="absolute left-4 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Googleで続ける</span>
                </button>

                <button
                  onClick={() => handleSocialLogin("apple")}
                  disabled={isSubmitting}
                  className="relative w-full h-12 rounded-lg border border-black text-[15px] font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                >
                  <svg className="absolute left-4 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <span>Appleで続ける</span>
                </button>

                <button
                  onClick={() => setAuthMethod("email")}
                  disabled={isSubmitting}
                  className="relative w-full h-12 rounded-lg border border-black text-[15px] font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                >
                  <Mail className="absolute left-4 h-5 w-5" />
                  <span>メールアドレスで続行</span>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Email form
  if (authMethod === "email") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[568px] p-0 gap-0" hideClose>
          <DialogHeader className="px-6 pt-6 pb-5 relative border-b border-border">
            <button
              onClick={() => setAuthMethod(null)}
              className="absolute left-4 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </button>
            <DialogTitle className="text-center text-base font-semibold">
              メールアドレスでログイン
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pt-6 pb-6">
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full border border-gray-300 px-3 text-base focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <Button
                onClick={handleEmailSubmit}
                disabled={!email || isSubmitting}
                className="h-12 w-full rounded-lg bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-base font-semibold text-white hover:from-[#D01346] hover:to-[#C7045D] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  "続行"
                )}
              </Button>

              <p className="text-xs text-center leading-relaxed text-gray-600">
                登録することで、
                <a href="/terms" className="underline font-medium">
                  利用規約
                </a>
                と
                <a href="/privacy" className="underline font-medium">
                  プライバシーポリシー
                </a>
                に同意したものとみなされます。
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return null
}
