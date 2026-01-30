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
}: CustomSignupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState(prefillEmail);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const validatePhone = (value: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/;
    const cleanedPhone = value.replace(/[-\s]/g, "");
    return phoneRegex.test(cleanedPhone);
  };

  const handleSubmit = async () => {
    if (!email || !phone) return;

    if (!validatePhone(phone)) {
      setPhoneError("正しい電話番号を入力してください");
      return;
    }

    setPhoneError("");
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newUser: User = {
      id: crypto.randomUUID(),
      email: email,
      name: "ゲスト",
      phone: phone.replace(/[-\s]/g, ""),
      createdAt: new Date().toISOString(),
      authProvider: "email",
      isSeller: false,
    };

    setIsSubmitting(false);
    onSignupComplete(newUser);
  };

  if (!open) return null;

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
                handleSubmit();
              }}
              className="space-y-4"
            >
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 w-full rounded-lg border border-gray-300 px-3 text-base focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Phone Input */}
              <div>
                <input
                  type="tel"
                  placeholder="電話番号（必須）"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  required
                  className={`h-14 w-full rounded-lg border px-3 text-base focus:outline-none focus:ring-2 ${
                    phoneError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  }`}
                />
                {phoneError && (
                  <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  物件の問い合わせ対応に使用します
                </p>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={!email || !phone || isSubmitting}
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
    </div>
  );
}
