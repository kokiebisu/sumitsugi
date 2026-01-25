"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { furnitureLabels } from "@/lib/data";
import type { LargeFurnitureType } from "@/lib/data";
import {
  ArrowLeft,
  Edit2,
  Building2,
  Home,
  Calendar,
  BedDouble,
  Sofa,
  Monitor,
  Archive,
  UtensilsCrossed,
  Shirt,
  Tv,
  Refrigerator,
  Coffee,
  Users,
  LucideIcon,
} from "lucide-react";

// 家具アイコン
const FURNITURE_ICONS: Record<LargeFurnitureType, LucideIcon> = {
  bed: BedDouble,
  sofa: Sofa,
  desk: Monitor,
  table: Coffee,
  storage: Archive,
  dining: UtensilsCrossed,
  wardrobe: Shirt,
  tv: Tv,
  fridge: Refrigerator,
};

export default function PreviewListingPage() {
  const { user, isLoading, listings, publishListing } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const [isPublishing, setIsPublishing] = useState(false);

  const listing = listings.find((l) => l.id === listingId);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && listing && listing.userId !== user.id) {
      router.push("/listing");
    }
  }, [user, isLoading, listing, router]);

  const handlePublish = () => {
    setIsPublishing(true);
    publishListing(listingId);
    setTimeout(() => {
      router.push("/listing");
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-coral">
            tsumugi
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/listing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            キャンセル
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-24">
        {/* Back Link */}
        <div className="mx-auto max-w-4xl px-6 pt-6">
          <Link
            href="/listing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-foreground/80"
          >
            <ArrowLeft className="h-4 w-4" />
            部屋一覧に戻る
          </Link>
        </div>

        {/* プレビューラベル */}
        <div className="mx-auto max-w-4xl px-6 pt-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
            <span className="text-sm font-medium text-amber-800">
              {listing.status === "published" ? "公開中" : "プレビュー表示中"}
            </span>
          </div>
          <Link href={`/listing/${listing.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit2 className="w-4 h-4" />
              編集
            </Button>
          </Link>
        </div>

        {/* 画像ギャラリー - 物件詳細と同じレイアウト */}
        {listing.roomPhotos && listing.roomPhotos.length > 0 && (
          <div className="mx-auto max-w-4xl px-6 py-6">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden">
              <div className="col-span-2 row-span-2">
                <img
                  src={listing.roomPhotos[0]}
                  alt="メイン画像"
                  className="w-full h-full object-cover"
                />
              </div>
              {listing.roomPhotos.slice(1, 5).map((photo, index) => (
                <div key={index} className="col-span-1 row-span-1">
                  <img
                    src={photo}
                    alt={`画像 ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* コンテンツ - 物件詳細と同じレイアウト */}
        <div className="mx-auto max-w-4xl px-6">
          {/* タイトルと場所 */}
          <div className="pb-6 border-b border-border">
            <h1 className="text-[26px] font-medium text-foreground">
              {listing.title}
            </h1>
            <p className="mt-1 text-base font-normal text-foreground">
              {[listing.area?.replace(/区/, "区 / "), listing.layout]
                .filter(Boolean)
                .join(" / ")}
            </p>
          </div>

          {/* 家具セクション */}
          {listing.furniture && listing.furniture.length > 0 && (
            <section className="py-8 border-b border-border">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                引き継ぎできる大型家具
              </h2>
              <div className="flex gap-6">
                {listing.furniture.map((furnitureId) => {
                  const Icon = FURNITURE_ICONS[furnitureId] || Home;
                  return (
                    <div
                      key={furnitureId}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                        <Icon
                          className="h-7 w-7 text-foreground"
                          strokeWidth={1.5}
                        />
                      </div>
                      <span className="text-sm text-foreground">
                        {furnitureLabels[furnitureId] || furnitureId}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 物件情報 */}
          <section className="py-8 border-b border-border">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              物件情報
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {listing.layout && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">
                      間取り
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {listing.layout}
                    </p>
                  </div>
                </div>
              )}
              {listing.area && (
                <div className="flex items-start gap-3">
                  <Home className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">
                      エリア
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {listing.area}
                    </p>
                  </div>
                </div>
              )}
              {listing.rent && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">家賃</p>
                    <p className="text-base font-semibold text-foreground">
                      {listing.rent.toLocaleString()}円/月
                    </p>
                  </div>
                </div>
              )}
              {listing.handoverFee && (
                <div className="flex items-start gap-3">
                  <Archive className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">
                      引き継ぎ費用
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {listing.handoverFee.toLocaleString()}円
                    </p>
                  </div>
                </div>
              )}
              {listing.occupants && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">
                      居住人数
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {listing.occupants === 4 ? "4人以上" : `${listing.occupants}人`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 引き継ぎスケジュール */}
          {(listing.viewingAvailableFrom || listing.moveInAvailableFrom) && (
            <section className="py-8">
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                引き継ぎスケジュール
              </h2>
              <div className="space-y-4">
                {listing.viewingAvailableFrom && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        内見可能日
                      </p>
                      <p className="text-base text-foreground">
                        {listing.viewingAvailableFrom}
                      </p>
                    </div>
                  </div>
                )}
                {listing.moveInAvailableFrom && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        引き継ぎ可能日
                      </p>
                      <p className="text-base text-foreground">
                        {listing.moveInAvailableFrom}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* 固定フッター - 公開ボタン（下書きの場合のみ表示） */}
      {listing.status !== "published" && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
          <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                内容を確認したら公開しましょう
              </p>
            </div>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="rounded-lg bg-[#E61E4D] hover:bg-[#D01346] text-white px-8 py-3 h-12 text-base font-medium"
            >
              {isPublishing ? "公開中..." : "公開する"}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
