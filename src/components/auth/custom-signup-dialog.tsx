'use client';

import { useState } from 'react';
import { X, Loader2, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import type { User } from '@/lib/data';

interface CustomSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignupComplete?: (user: User) => void; // Deprecated: Magic Link handles this automatically
  prefillEmail?: string;
  prefillName?: string;
}

export function CustomSignupDialog({
  open,
  onOpenChange,
  onSignupComplete,
  prefillEmail = '',
}: CustomSignupDialogProps) {
  const { sendMagicLink } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState(prefillEmail);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;

    setError('');
    setIsSubmitting(true);

    const result = await sendMagicLink(email);

    setIsSubmitting(false);

    if (result.success) {
      setIsSent(true);
      // Note: onSignupComplete is no longer called here
      // The user will be logged in automatically when they click the magic link
    } else {
      setError(result.error || 'エラーが発生しました');
    }
  };

  const handleClose = () => {
    setEmail(prefillEmail);
    setError('');
    setIsSent(false);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />

      {/* Dialog */}
      <div
        className="relative z-50 w-full max-w-[568px] bg-white shadow-xl"
        style={{ borderRadius: '32px' }}
      >
        {/* Header */}
        <div className="relative border-b border-gray-200 px-6 py-5">
          <button
            onClick={handleClose}
            className="absolute left-4 top-5 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-center text-base font-semibold">
            {isSent ? 'メールを確認してください' : 'ログイン / 新規登録'}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isSent ? (
            // Success state
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                メールを送信しました
              </h3>
              <p className="text-gray-600 mb-4">
                <span className="font-medium">{email}</span>
                <br />
                にログインリンクを送信しました。
              </p>
              <p className="text-sm text-gray-500">
                メール内のリンクをクリックしてログインしてください。
                <br />
                リンクは15分間有効です。
              </p>
              <button
                onClick={handleClose}
                className="mt-6 h-12 w-full rounded-lg border border-gray-300 text-base font-semibold text-gray-700 hover:bg-gray-50"
              >
                閉じる
              </button>
            </div>
          ) : (
            // Form state
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-coral" />
                </div>
                <p className="text-gray-600">
                  メールアドレスを入力してください。
                  <br />
                  ログインリンクをお送りします。
                </p>
              </div>

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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    required
                    autoFocus
                    className={`h-14 w-full rounded-lg border px-3 text-base focus:outline-none focus:ring-2 ${
                      error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                    }`}
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!email || isSubmitting}
                  className="h-12 w-full rounded-lg bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-base font-semibold text-white hover:from-[#D01346] hover:to-[#C7045D] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      送信中...
                    </div>
                  ) : (
                    'ログインリンクを送信'
                  )}
                </button>

                <p className="text-xs text-center leading-relaxed text-gray-600">
                  続行することで、
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
          )}
        </div>
      </div>
    </div>
  );
}
