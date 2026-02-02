'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { mockHandoverAgreements } from '@/lib/data';
import type { ItemCondition } from '@/lib/data';

const CONDITION_LABELS: Record<ItemCondition, string> = {
  excellent: '非常に良い',
  good: '良い',
  fair: '普通',
  poor: '使用感あり',
};

export default function AgreementPDFPage() {
  const router = useRouter();
  const params = useParams();
  const agreementId = params.id as string;
  const { user, isLoading } = useAuth();

  const agreement = mockHandoverAgreements.find((a) => a.id === agreementId);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">合意情報が見つかりません</div>
      </div>
    );
  }

  const includedItems = agreement.items.filter((item) => item.included);
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
        }
      `}</style>

      {/* 印刷ボタン */}
      <div className="no-print fixed right-4 top-4 flex gap-2">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          戻る
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-medium text-white hover:bg-coral-600"
          style={{ backgroundColor: '#FF5A5F' }}
        >
          印刷 / PDF保存
        </button>
      </div>

      {/* PDF本文 */}
      <div className="mx-auto max-w-[210mm] p-8">
        {/* タイトル */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">残置物同意書</h1>
          <p className="mt-2 text-sm text-gray-600">作成日: {today}</p>
        </div>

        {/* 物件情報 */}
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            物件情報
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="w-32 py-1 text-gray-600">物件名</td>
                <td className="py-1 font-medium">{agreement.propertyTitle}</td>
              </tr>
              {agreement.propertyAddress && (
                <tr>
                  <td className="py-1 text-gray-600">所在地</td>
                  <td className="py-1">{agreement.propertyAddress}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* 当事者 */}
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            当事者
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="w-32 py-1 text-gray-600">譲渡者（前の住人）</td>
                <td className="py-1 font-medium">{agreement.sellerName}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600">譲受者（次の住人）</td>
                <td className="py-1 font-medium">{agreement.buyerName}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 引き継ぎ品目 */}
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            引き継ぎ品目
          </h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">
                  No.
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  品目名
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  状態
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  備考
                </th>
              </tr>
            </thead>
            <tbody>
              {includedItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-3 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {item.name}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {CONDITION_LABELS[item.condition]}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {item.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 引越し費用 */}
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            引越し費用
          </h2>
          <p className="text-xl font-bold">
            ¥{agreement.adjustedHandoverFee.toLocaleString()}
          </p>
        </section>

        {/* 同意事項 */}
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            同意事項
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>
              上記の品目は現状有姿での譲渡とし、譲受者はその状態を確認の上、
              引き継ぐことに同意します。
            </li>
            <li>
              譲渡後の品目に関する所有権は譲受者に移転し、退去時の処分責任は
              譲受者が負うものとします。
            </li>
            <li>
              引き継ぎ品目に関するトラブルについて、大家および管理会社は
              一切の責任を負わないことに同意します。
            </li>
          </ol>
        </section>

        {/* 署名欄 */}
        <section className="mt-12">
          <h2 className="mb-6 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            署名
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-2 text-sm text-gray-600">譲受者（次の住人）</p>
              <div className="border-b border-gray-400 pb-2">
                {agreement.buyerSignature ? (
                  <div>
                    <p className="text-lg font-medium">
                      {agreement.buyerSignature.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(
                        agreement.buyerSignature.agreedAt
                      ).toLocaleString('ja-JP')}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">（未署名）</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* フッター */}
        <footer className="mt-12 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
          <p>本書類は tsumugi プラットフォームにて作成されました</p>
          <p>https://tsumugi.app</p>
        </footer>
      </div>
    </div>
  );
}
