'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { furnitureLabels } from '@/lib/data';
import type { LargeFurnitureType } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Home,
  Sofa,
} from 'lucide-react';

export default function ConfirmListingPage() {
  const { user, isLoading, listings, updateListing } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const [isPublishing, setIsPublishing] = useState(false);

  // 公開前確認項目
  const [landlordConsent, setLandlordConsent] = useState(false);
  const [liabilityTerms, setLiabilityTerms] = useState({
    isPrivateTransfer: false,
    noLandlordWarranty: false,
    selfResponsibility: false,
  });
  const [viewingAvailableFrom, setViewingAvailableFrom] = useState('');
  const [moveInAvailableFrom, setMoveInAvailableFrom] = useState('');

  const listing = listings.find((l) => l.id === listingId);

  // 全ての確認項目がチェックされているか
  const allChecked =
    landlordConsent &&
    liabilityTerms.isPrivateTransfer &&
    liabilityTerms.noLandlordWarranty &&
    liabilityTerms.selfResponsibility &&
    viewingAvailableFrom &&
    moveInAvailableFrom;

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

  // 既存のデータがあれば復元
  useEffect(() => {
    if (listing) {
      if (listing.landlordConsent?.hasLandlordConsent) {
        setLandlordConsent(true);
      }
      if (listing.liabilityTerms) {
        setLiabilityTerms({
          isPrivateTransfer: listing.liabilityTerms.isPrivateTransfer || false,
          noLandlordWarranty:
            listing.liabilityTerms.noLandlordWarranty || false,
          selfResponsibility:
            listing.liabilityTerms.selfResponsibility || false,
        });
      }
      if (listing.viewingAvailableFrom) {
        // 日本語形式から date input 形式に変換を試みる
        const match = listing.viewingAvailableFrom.match(
          /(\d{4})年(\d{1,2})月(\d{1,2})日/
        );
        if (match) {
          const [, year, month, day] = match;
          setViewingAvailableFrom(
            `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
          );
        } else if (listing.viewingAvailableFrom.match(/^\d{4}-\d{2}-\d{2}/)) {
          setViewingAvailableFrom(listing.viewingAvailableFrom.split('T')[0]);
        }
      }
      if (listing.moveInAvailableFrom) {
        const match = listing.moveInAvailableFrom.match(
          /(\d{4})年(\d{1,2})月(\d{1,2})日/
        );
        if (match) {
          const [, year, month, day] = match;
          setMoveInAvailableFrom(
            `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
          );
        } else if (listing.moveInAvailableFrom.match(/^\d{4}-\d{2}-\d{2}/)) {
          setMoveInAvailableFrom(listing.moveInAvailableFrom.split('T')[0]);
        }
      }
    }
  }, [listing]);

  const handlePublish = () => {
    if (!allChecked) return;

    setIsPublishing(true);
    updateListing(listingId, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      landlordConsent: {
        hasLandlordConsent: landlordConsent,
      },
      liabilityTerms: {
        isPrivateTransfer: liabilityTerms.isPrivateTransfer,
        noLandlordWarranty: liabilityTerms.noLandlordWarranty,
        selfResponsibility: liabilityTerms.selfResponsibility,
      },
      viewingAvailableFrom,
      moveInAvailableFrom,
    });
    setTimeout(() => {
      router.push('/listing');
    }, 500);
  };

  const handleDownloadPDF = () => {
    // PDF生成のためにPDFページに遷移
    window.open(`/listing/${listingId}/pdf`, '_blank');
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
        <div className="text-muted-foreground">
          リスティングが見つかりません
        </div>
      </div>
    );
  }

  // 家具リスト
  const furnitureList =
    listing.furniture
      ?.map((f) => furnitureLabels[f as LargeFurnitureType] || f)
      .join('、') || 'なし';

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link
            href={`/listing/${listingId}/preview`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>プレビューに戻る</span>
          </Link>
          <h1 className="text-lg font-semibold">公開前の確認</h1>
          <div className="w-24" />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 pb-32">
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
          {/* リスティング概要カード */}
          <section className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-start gap-4">
              {listing.roomPhotos?.[0] ? (
                <img
                  src={listing.roomPhotos[0]}
                  alt={listing.title}
                  className="w-24 h-24 object-cover rounded-xl"
                />
              ) : (
                <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center">
                  <Home className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {listing.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-2">
                  {listing.area} / {listing.layout}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-foreground font-medium">
                    家賃 ¥{listing.rent?.toLocaleString()}/月
                  </span>
                  <span className="text-coral font-medium">
                    引き継ぎ費用 ¥{listing.handoverFee?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 大家さん向け資料 */}
          <section className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-1">
                  大家さん向け資料
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  残置物引き継ぎの概要書と同意書をダウンロードできます。
                  大家さん・管理会社への説明にご利用ください。
                </p>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  資料をダウンロード (PDF)
                </Button>
              </div>
            </div>
          </section>

          {/* 大家承諾 */}
          <section className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-1">
                  大家・管理会社への確認
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  残置物の引き継ぎには、事前の了承が必要です
                </p>
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <input
                    type="checkbox"
                    checked={landlordConsent}
                    onChange={(e) => setLandlordConsent(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-amber-300 text-amber-600 accent-amber-600"
                  />
                  <span className="text-sm text-amber-900">
                    残置物（家具・家電）の引き継ぎについて、大家・管理会社に事前説明し、了承を得ています
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* 責任区分 */}
          <section className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sofa className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-1">
                  責任区分の確認
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  残置物の引き継ぎに関する責任範囲を確認してください
                </p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={liabilityTerms.isPrivateTransfer}
                      onChange={(e) =>
                        setLiabilityTerms((prev) => ({
                          ...prev,
                          isPrivateTransfer: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-5 w-5 rounded border-border"
                    />
                    <span className="text-sm text-foreground">
                      残置物は「前入居者 →
                      次入居者間の私的譲渡物」であることを理解しています
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={liabilityTerms.noLandlordWarranty}
                      onChange={(e) =>
                        setLiabilityTerms((prev) => ({
                          ...prev,
                          noLandlordWarranty: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-5 w-5 rounded border-border"
                    />
                    <span className="text-sm text-foreground">
                      大家・管理会社は性能保証・修理義務を負わないことを理解しています
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={liabilityTerms.selfResponsibility}
                      onChange={(e) =>
                        setLiabilityTerms((prev) => ({
                          ...prev,
                          selfResponsibility: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-5 w-5 rounded border-border"
                    />
                    <span className="text-sm text-foreground">
                      次入居者は内見時に現物確認し、自己責任で受領することに同意します
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* 内見・引き継ぎ日程 */}
          <section className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-1">
                  内見・引き継ぎの希望日
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  大家さんと相談の上、希望日を入力してください
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      内見可能日（いつから）
                      <span className="text-coral ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      value={viewingAvailableFrom}
                      onChange={(e) => setViewingAvailableFrom(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      退去（引き渡し）希望時期
                      <span className="text-coral ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      value={moveInAvailableFrom}
                      onChange={(e) => setMoveInAvailableFrom(e.target.value)}
                      min={
                        viewingAvailableFrom ||
                        new Date().toISOString().split('T')[0]
                      }
                      className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ※実際の日程はクリーニング等により前後する場合があります
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 確認状況 */}
          {allChecked && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  すべての確認が完了しました
                </p>
                <p className="text-sm text-green-700">
                  「公開する」ボタンを押すと、リスティングが公開されます
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {allChecked
                ? '準備完了！公開しましょう'
                : 'すべての項目を確認してください'}
            </p>
          </div>
          <Button
            onClick={handlePublish}
            disabled={!allChecked || isPublishing}
            className={cn(
              'rounded-lg px-8 py-3 h-12 text-base font-medium',
              allChecked
                ? 'bg-[#E61E4D] hover:bg-[#D01346] text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {isPublishing ? '公開中...' : '公開する'}
          </Button>
        </div>
      </footer>
    </div>
  );
}
