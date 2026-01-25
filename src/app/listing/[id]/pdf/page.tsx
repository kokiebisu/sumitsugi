"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { furnitureLabels } from "@/lib/data";
import type { LargeFurnitureType } from "@/lib/data";

export default function LandlordPDFPage() {
  const { user, isLoading, listings } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

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

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">リスティングが見つかりません</div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 家具リスト
  const furnitureList = listing.furniture
    ?.map((f) => furnitureLabels[f as LargeFurnitureType] || f)
    .join("、") || "なし";

  // UserListingには appliances がないので空文字
  const applianceList = "なし";

  return (
    <div className="min-h-screen bg-white">
      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* 印刷ボタン（印刷時は非表示） */}
      <div className="no-print sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          戻る
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            ブラウザの印刷機能でPDFとして保存できます
          </span>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            印刷 / PDF保存
          </button>
        </div>
      </div>

      {/* PDF コンテンツ */}
      <div className="max-w-[210mm] mx-auto px-8 py-10">
        {/* ========== 1ページ目: 概要書 ========== */}
        <section>
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              残置物引き継ぎ概要書
            </h1>
            <p className="text-sm text-gray-500">
              作成日: {today}
            </p>
          </div>

          {/* サービス説明 */}
          <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              tsumugi（つむぎ）サービスについて
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              tsumugiは、賃貸物件の退去時に発生する大型家具・家電を、次の入居者へ引き継ぐことで、
              廃棄コストの削減と資源の有効活用を実現するサービスです。
              前入居者と次入居者間で直接やり取りを行い、残置物は「私的譲渡物」として扱われます。
            </p>
          </div>

          {/* 物件情報 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              物件情報
            </h2>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-500 w-1/3">物件名/エリア</td>
                  <td className="py-3 text-gray-900 font-medium">{listing.area || "未設定"}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-500">間取り</td>
                  <td className="py-3 text-gray-900">{listing.layout || "未設定"}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-500">家賃</td>
                  <td className="py-3 text-gray-900">
                    {listing.rent ? `${listing.rent.toLocaleString()}円/月` : "未設定"}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-500">管理費</td>
                  <td className="py-3 text-gray-900">
                    {listing.managementFee ? `${listing.managementFee.toLocaleString()}円/月` : "なし"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 引き継ぎ対象物 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              引き継ぎ対象物
            </h2>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-500 w-1/3">大型家具</td>
                  <td className="py-3 text-gray-900">{furnitureList}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-500">大型家電</td>
                  <td className="py-3 text-gray-900">{applianceList}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-500">引き継ぎ費用</td>
                  <td className="py-3 text-gray-900 font-medium">
                    {listing.handoverFee ? `${listing.handoverFee.toLocaleString()}円` : "未設定"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* スケジュール */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              引き継ぎスケジュール（予定）
            </h2>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-500 w-1/3">内見可能日</td>
                  <td className="py-3 text-gray-900">
                    {listing.viewingAvailableFrom || "調整中"}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-500">引き継ぎ可能日</td>
                  <td className="py-3 text-gray-900">
                    {listing.moveInAvailableFrom || "調整中"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 責任区分の説明 */}
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h2 className="text-sm font-semibold text-amber-800 mb-2">
              責任区分について
            </h2>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>1. 残置物は「前入居者 → 次入居者間の私的譲渡物」です</li>
              <li>2. 大家・管理会社様は性能保証・修理義務を負いません</li>
              <li>3. 次入居者は内見時に現物確認し、自己責任で受領します</li>
            </ul>
          </div>

          {/* 問い合わせ */}
          <div className="text-center text-sm text-gray-500">
            <p>本サービスに関するお問い合わせ</p>
            <p className="font-medium text-gray-700">tsumugi サポート: support@tsumugi.jp</p>
          </div>
        </section>

        {/* ========== 2ページ目: 同意書 ========== */}
        <section className="page-break">
          {/* ヘッダー */}
          <div className="text-center mb-10 pt-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              残置物引き継ぎ同意書
            </h1>
            <p className="text-sm text-gray-500">
              大家・管理会社様用
            </p>
          </div>

          {/* 同意内容 */}
          <div className="mb-8">
            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              下記の物件において、現入居者が退去時に残す家具・家電等（以下「残置物」）を、
              tsumugiサービスを通じて次入居者へ引き継ぐことについて、以下の内容を確認の上、同意いたします。
            </p>

            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">対象物件</h3>
              <p className="text-sm text-gray-900">{listing.area || "未設定"}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  残置物の引き継ぎは、前入居者と次入居者間の私的な譲渡であり、
                  賃貸借契約とは独立した取引であることを理解しました。
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  残置物について、大家・管理会社は性能保証・修理義務・
                  損害賠償責任を負わないことを確認しました。
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  次入居者は内見時に残置物を現物確認し、
                  状態を了承の上で自己責任にて受領することを確認しました。
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  引き継ぎ後の残置物の処分責任は次入居者に移転することを確認しました。
                </p>
              </div>
            </div>
          </div>

          {/* 引き継ぎ対象物リスト */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">引き継ぎ対象物</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-500 w-1/4">大型家具</td>
                    <td className="py-2 text-gray-900">{furnitureList}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">大型家電</td>
                    <td className="py-2 text-gray-900">{applianceList}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 署名欄 */}
          <div className="mb-10">
            <p className="text-sm text-gray-700 mb-6">
              上記内容を確認し、残置物の引き継ぎについて同意します。
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-500 mb-2">同意日</p>
                <div className="border-b border-gray-400 pb-1 h-8">
                  <span className="text-sm text-gray-400">    年   月   日</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  大家・管理会社名
                </p>
                <div className="border-b border-gray-400 pb-1 h-8" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">署名・捺印</p>
              <div className="border border-gray-300 rounded-lg h-20 flex items-center justify-center">
                <span className="text-sm text-gray-400">（署名欄）</span>
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
            <p className="font-medium mb-1">注意事項</p>
            <ul className="space-y-0.5">
              <li>- 本同意書は、残置物の引き継ぎに関する確認書類です。</li>
              <li>- 賃貸借契約の内容を変更するものではありません。</li>
              <li>- 控えとして1部お手元に保管ください。</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
