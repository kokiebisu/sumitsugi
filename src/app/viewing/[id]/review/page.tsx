'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { isValidRating } from '@/lib/review-types';

export default function ReviewInputPage() {
  const params = useParams();
  const router = useRouter();
  const viewingId = params.id as string;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidRating(rating)) {
      setError('星評価を選択してください（1〜5）');
      return;
    }

    // Navigate to confirm page with review data in query params
    const params = new URLSearchParams({
      rating: String(rating),
      ...(comment && { comment }),
    });
    router.push(`/viewing/${viewingId}/review/confirm?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Link
            href={`/viewing/${viewingId}/complete`}
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            レビューを書く
          </h1>
          <p className="text-muted-foreground mb-8">
            内見の感想をお聞かせください。レビューは双方が書き終わった後に公開されます。
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                総合評価 <span className="text-coral">*</span>
              </label>
              <StarRating value={rating} onChange={setRating} size={32} />
              {rating > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {rating === 1 && '残念でした'}
                  {rating === 2 && 'まあまあでした'}
                  {rating === 3 && '普通でした'}
                  {rating === 4 && '良かったです'}
                  {rating === 5 && 'とても良かったです'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-foreground mb-3"
              >
                コメント（任意）
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="内見の感想を自由にお書きください"
                rows={4}
                maxLength={500}
                className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none resize-none"
              />
              <p className="mt-1 text-xs text-muted-foreground text-right">
                {comment.length}/500
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-coral hover:bg-coral/90 text-white"
            >
              確認画面へ
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
