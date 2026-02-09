'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';

type ConfirmationState = {
  hostConfirmed: boolean;
  visitorConfirmed: boolean;
};

export default function ViewingCompletePage() {
  const params = useParams();
  const router = useRouter();
  const viewingId = params.id as string;

  // In production, this would come from server state / API
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    hostConfirmed: false,
    visitorConfirmed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulate current user role (in production, from auth context)
  const currentUserRole = 'visitor' as 'host' | 'visitor';

  const isCurrentUserConfirmed =
    currentUserRole === 'host'
      ? confirmation.hostConfirmed
      : confirmation.visitorConfirmed;

  const isOtherPartyConfirmed =
    currentUserRole === 'host'
      ? confirmation.visitorConfirmed
      : confirmation.hostConfirmed;

  const bothConfirmed =
    confirmation.hostConfirmed && confirmation.visitorConfirmed;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setConfirmation((prev) => ({
      ...prev,
      [currentUserRole === 'host' ? 'hostConfirmed' : 'visitorConfirmed']: true,
    }));
    setIsSubmitting(false);
  };

  // Redirect to review page when both confirmed
  if (bothConfirmed) {
    router.push(`/viewing/${viewingId}/review`);
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            内見完了の確認
          </h1>
          <p className="text-muted-foreground mb-8">
            双方が内見完了を確認すると、レビューの入力に進めます。
          </p>

          <div className="space-y-4">
            {/* Current user status */}
            <div className="flex items-center gap-4 rounded-xl border-2 border-border p-4">
              {isCurrentUserConfirmed ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
              ) : (
                <Clock className="h-6 w-6 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  あなた（
                  {currentUserRole === 'host' ? '前の住人' : '次の住人候補'}）
                </p>
                <p className="text-sm text-muted-foreground">
                  {isCurrentUserConfirmed
                    ? '内見完了を確認済み'
                    : '内見完了の確認待ち'}
                </p>
              </div>
            </div>

            {/* Other party status */}
            <div className="flex items-center gap-4 rounded-xl border-2 border-border p-4">
              {isOtherPartyConfirmed ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
              ) : (
                <Clock className="h-6 w-6 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {currentUserRole === 'host' ? '次の住人候補' : '前の住人'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isOtherPartyConfirmed
                    ? '内見完了を確認済み'
                    : '内見完了の確認待ち'}
                </p>
              </div>
            </div>
          </div>

          {!isCurrentUserConfirmed && (
            <div className="mt-8">
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-full bg-coral hover:bg-coral/90 text-white"
              >
                {isSubmitting ? '確認中...' : '内見完了を確認する'}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground text-center">
                確認後の取り消しはできません
              </p>
            </div>
          )}

          {isCurrentUserConfirmed && !isOtherPartyConfirmed && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                相手の確認を待っています。双方が確認するとレビュー入力に進めます。
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
