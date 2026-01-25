"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { User } from "@/lib/data";

interface CustomSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignupComplete: (user: User) => void;
  prefillEmail?: string;
  prefillName?: string;
}

export function CustomSignupDialog({
  open,
  onOpenChange,
  onSignupComplete,
  prefillEmail = "",
  prefillName = "",
}: CustomSignupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<"phone" | "email" | null>(null);
  const [email, setEmail] = useState(prefillEmail);
  const [phone, setPhone] = useState("");

  const handlePhoneSubmit = async () => {
    if (!phone) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newUser: User = {
      id: crypto.randomUUID(),
      email: `${phone}@phone.temp`,
      name: "ゲスト",
      phone: phone,
      createdAt: new Date().toISOString(),
      authProvider: "email",
      isSeller: false,
    };

    console.log("User created via phone:", newUser);
    setIsSubmitting(false);
    onSignupComplete(newUser);
  };

  const handleEmailSubmit = async () => {
    if (!email) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newUser: User = {
      id: crypto.randomUUID(),
      email: email,
      name: "ゲスト",
      phone: "", // TODO: 登録フォームから電話番号を取得
      createdAt: new Date().toISOString(),
      authProvider: "email",
      isSeller: false,
    };

    console.log("User created via email:", newUser);
    setIsSubmitting(false);
    onSignupComplete(newUser);
  };

  const handleSocialLogin = async (provider: string) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newUser: User = {
      id: crypto.randomUUID(),
      email: `user@${provider}.com`,
      name: "ゲスト",
      phone: "", // TODO: ソーシャルログイン後に電話番号を取得
      createdAt: new Date().toISOString(),
      authProvider: provider as "google" | "facebook" | "apple",
      isSeller: false,
    };

    console.log(`User created via ${provider}:`, newUser);
    setIsSubmitting(false);
    onSignupComplete(newUser);
  };

  if (!open) return null;

  // Email form
  if (authMethod === "email") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/80"
          onClick={() => setAuthMethod(null)}
        />

        {/* Dialog */}
        <div
          className="relative z-50 w-full max-w-[568px] bg-white shadow-xl"
          style={{ borderRadius: "32px" }}
        >
          {/* Header */}
          <div className="relative border-b border-gray-200 px-6 py-5">
            <button
              onClick={() => setAuthMethod(null)}
              className="absolute left-4 top-5 rounded-sm opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-center text-base font-semibold">
              メールアドレスでログイン
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailSubmit();
              }}
              className="space-y-4"
            >
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 w-full border border-gray-300 px-4 text-base focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                style={{ borderRadius: "16px" }}
              />

              <button
                type="submit"
                disabled={!email || isSubmitting}
                className="h-12 w-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-base font-semibold text-white hover:from-[#D01346] hover:to-[#C7045D] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: "16px" }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </div>
                ) : (
                  "続行"
                )}
              </button>

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
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className="relative z-50 w-full max-w-[568px] bg-white shadow-xl"
        style={{ borderRadius: "32px" }}
      >
        {/* Header */}
        <div className="relative border-b border-gray-200 px-6 py-5">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute left-4 top-5 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-center text-base font-semibold">
            申し込むにはログインまたは登録してください
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="space-y-4">
            {/* Email Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailSubmit();
              }}
              className="space-y-4"
            >
              {/* Email Input */}
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 w-full rounded-lg border border-gray-300 px-3 text-base focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />

              {/* Continue Button */}
              <button
                type="submit"
                disabled={!email || isSubmitting}
                className="h-12 w-full rounded-lg bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-base font-semibold text-white hover:from-[#D01346] hover:to-[#C7045D] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </div>
                ) : (
                  "続行"
                )}
              </button>
            </form>

            {/* Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs text-gray-600">
                  または
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialLogin("facebook")}
                disabled={isSubmitting}
                className="flex h-14 items-center justify-center border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                style={{ borderRadius: "16px" }}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              <button
                onClick={() => handleSocialLogin("google")}
                disabled={isSubmitting}
                className="flex h-14 items-center justify-center border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                style={{ borderRadius: "16px" }}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>

              <button
                onClick={() => handleSocialLogin("apple")}
                disabled={isSubmitting}
                className="flex h-14 items-center justify-center border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                style={{ borderRadius: "16px" }}
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </button>
            </div>

            {/* Phone Login Button */}
            <button
              onClick={() => setAuthMethod("phone")}
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 border border-gray-300 text-base font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              style={{ borderRadius: "12px" }}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>電話番号で続行</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
