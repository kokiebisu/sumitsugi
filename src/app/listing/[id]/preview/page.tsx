'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { furnitureLabels } from '@/lib/data';
import {
  ArrowLeft,
  Edit2,
  CheckCircle2,
  ImageIcon,
  Package,
  MapPin,
} from 'lucide-react';

export default function PreviewListingPage() {
  const { user, isLoading, listings, publishListing } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const [isPublishing, setIsPublishing] = useState(false);

  const listing = listings.find((l) => l.id === listingId);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && listing && listing.userId !== user.id) {
      router.push('/listing');
    }
  }, [user, isLoading, listing, router]);

  const handlePublish = () => {
    setIsPublishing(true);
    publishListing(listingId);
    setTimeout(() => {
      router.push('/listing');
    }, 500);
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">部屋が見つかりません</div>
      </div>
    );
  }

  const photoCount = listing.roomPhotos?.length ?? 0;
  const furnitureCount = listing.furniture?.length ?? 0;
  const isPublished = listing.status === 'published';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-coral">
            tsumugi
          </span>
        </Link>
        <Link
          href="/listing"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          戻る
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <Link
          href="/listing"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          部屋一覧に戻る
        </Link>

        {/* Status badge */}
        <div className="mb-6 flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
              isPublished
                ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200'
                : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
            }`}
          >
            {isPublished ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                公開中
              </>
            ) : (
              '下書き'
            )}
          </div>
          <Link href={`/listing/${listing.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit2 className="h-4 w-4" />
              編集
            </Button>
          </Link>
        </div>

        {/* Summary card */}
        <div className="rounded-xl border border-border bg-card p-6">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-foreground">
            {listing.title || '無題のリスティング'}
          </h1>

          {/* Location & layout */}
          {(listing.area || listing.layout) && (
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {[listing.area, listing.layout].filter(Boolean).join(' / ')}
              </span>
            </div>
          )}

          {/* Key stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <ImageIcon className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-lg font-semibold">{photoCount}</p>
              <p className="text-xs text-muted-foreground">写真</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Package className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-lg font-semibold">{furnitureCount}</p>
              <p className="text-xs text-muted-foreground">家具</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">引き継ぎ費用</p>
              <p className="mt-1 text-lg font-semibold">
                {listing.handoverFee
                  ? `¥${listing.handoverFee.toLocaleString()}`
                  : '未設定'}
              </p>
            </div>
          </div>

          {/* Furniture list */}
          {furnitureCount > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                引き継ぎ家具
              </p>
              <div className="flex flex-wrap gap-2">
                {listing.furniture?.map((id) => (
                  <span
                    key={id}
                    className="rounded-full bg-muted px-3 py-1 text-sm text-foreground"
                  >
                    {furnitureLabels[id] || id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Thumbnail */}
          {photoCount > 0 && listing.roomPhotos?.[0] && (
            <div className="mt-6 overflow-hidden rounded-lg">
              <img
                src={listing.roomPhotos[0]}
                alt={listing.title || 'プレビュー'}
                className="h-48 w-full object-cover"
              />
              {photoCount > 1 && (
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  他 {photoCount - 1} 枚の写真
                </p>
              )}
            </div>
          )}
        </div>

        {/* Publish action */}
        {!isPublished && (
          <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              内容を確認したら公開しましょう
            </p>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="h-12 rounded-lg bg-[#E61E4D] px-8 text-base font-medium text-white hover:bg-[#D01346]"
            >
              {isPublishing ? '公開中...' : '公開する'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
