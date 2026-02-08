'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';

export default function ReviewConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewingId = params.id as string;

  const rating = Number(searchParams.get('rating') || '0');
  const comment = searchParams.get('comment') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call to save review
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-6 py-12 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              レビューを送信しました
            </h1>
            <p className="text-muted-foreground mb-8">
              相手もレビューを書き終わると、お互いのレビューが公開されます。
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-coral px-6 py-3 text-sm font-medium text-white hover:bg-coral/90 transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!rating || rating < 1 || rating > 5) {
    router.push(`/viewing/${viewingId}/review`);
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Link
            href={`/viewing/${viewingId}/review`}
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            戻って修正
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            レビューの確認
          </h1>
          <p className="text-muted-foreground mb-8">
            送信後の編集はできません。内容をご確認ください。
          </p>

          <div className="rounded-xl border-2 border-border p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                総合評価
              </p>
              <StarRating value={rating} size={24} showValue />
            </div>

            {comment && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  コメント
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {comment}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/viewing/${viewingId}/review`)}
              className="flex-1"
            >
              戻って修正
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-coral hover:bg-coral/90 text-white"
            >
              {isSubmitting ? '送信中...' : 'レビューを送信'}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
