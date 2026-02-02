'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Inquiry } from '@/lib/data';
import { Check, Clock, Eye, FileCheck, ArrowRight } from 'lucide-react';

interface ViewingConfirmationProps {
  inquiry: Inquiry;
  userRole: 'seller' | 'applicant';
  onConfirm: (inquiry: Inquiry) => void;
}

/**
 * 内見確認の双方チェック型コンポーネント
 *
 * フロー:
 * 1. 内見調整中（pending/viewing_scheduled）
 * 2. 譲る側が「内見完了」をチェック
 * 3. 引き継ぐ側が「内見完了」をチェック
 * 4. 両方ONになったら「引き継ぎ条件の合意ステップ」が解放
 */
export function ViewingConfirmation({
  inquiry,
  userRole,
  onConfirm,
}: ViewingConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmation = inquiry.viewingConfirmation || {
    hostConfirmed: false,
    applicantConfirmed: false,
  };

  const isSellerConfirmed = confirmation.hostConfirmed;
  const isApplicantConfirmed = confirmation.applicantConfirmed;
  const bothConfirmed = isSellerConfirmed && isApplicantConfirmed;

  const canUserConfirm =
    (userRole === 'seller' && !isSellerConfirmed) ||
    (userRole === 'applicant' && !isApplicantConfirmed);

  const handleConfirm = () => {
    setIsConfirming(true);

    const now = new Date().toISOString();
    const updatedInquiry: Inquiry = {
      ...inquiry,
      status: bothConfirmed ? 'approved' : inquiry.status,
      viewingConfirmation: {
        ...confirmation,
        ...(userRole === 'seller'
          ? { hostConfirmed: true, hostConfirmedAt: now }
          : { applicantConfirmed: true, applicantConfirmedAt: now }),
      },
    };

    // 両方確認済みならステータスを更新
    if (
      (userRole === 'seller' && isApplicantConfirmed) ||
      (userRole === 'applicant' && isSellerConfirmed)
    ) {
      updatedInquiry.status = 'approved';
    }

    setTimeout(() => {
      onConfirm(updatedInquiry);
      setIsConfirming(false);
    }, 500);
  };

  return (
    <div className="p-6 bg-muted/30 rounded-2xl border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
          <Eye className="w-5 h-5 text-coral" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">内見確認</h3>
          <p className="text-sm text-muted-foreground">
            両者が内見完了を確認すると、引き継ぎ条件の調整に進めます
          </p>
        </div>
      </div>

      {/* 確認ステータス */}
      <div className="space-y-4 mb-6">
        {/* 譲る側 */}
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            isSellerConfirmed
              ? 'bg-green-50 border-green-200'
              : 'bg-white border-border'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isSellerConfirmed ? 'bg-green-500' : 'bg-muted'
            }`}
          >
            {isSellerConfirmed ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Clock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">譲る側（前の住人）</p>
            <p className="text-sm text-muted-foreground">
              {isSellerConfirmed
                ? `確認済み（${new Date(confirmation.hostConfirmedAt || '').toLocaleDateString('ja-JP')}）`
                : '内見完了の確認待ち'}
            </p>
          </div>
          {userRole === 'seller' && !isSellerConfirmed && (
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="bg-coral hover:bg-coral/90 text-white"
            >
              {isConfirming ? '確認中...' : '内見完了を確認'}
            </Button>
          )}
        </div>

        {/* 引き継ぐ側 */}
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            isApplicantConfirmed
              ? 'bg-green-50 border-green-200'
              : 'bg-white border-border'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isApplicantConfirmed ? 'bg-green-500' : 'bg-muted'
            }`}
          >
            {isApplicantConfirmed ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Clock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">引き継ぐ側（申込者）</p>
            <p className="text-sm text-muted-foreground">
              {isApplicantConfirmed
                ? `確認済み（${new Date(confirmation.applicantConfirmedAt || '').toLocaleDateString('ja-JP')}）`
                : '内見完了の確認待ち'}
            </p>
          </div>
          {userRole === 'applicant' && !isApplicantConfirmed && (
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="bg-coral hover:bg-coral/90 text-white"
            >
              {isConfirming ? '確認中...' : '内見完了を確認'}
            </Button>
          )}
        </div>
      </div>

      {/* 次のステップ */}
      {bothConfirmed ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-800">内見が完了しました</p>
              <p className="text-sm text-green-700">
                引き継ぎ条件の調整に進むことができます
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-green-600" />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            両者が内見完了を確認すると、引き継ぎ費用・残置物リスト・免責条件の調整に進めます
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * 引き継ぎ条件合意フォーム（内見完了後に表示）
 */
interface HandoverAgreementFormProps {
  inquiry: Inquiry;
  listingFee: number;
  listingItems: string[];
  onAgree: (agreement: {
    agreedFee: number;
    agreedItems: string[];
    liabilityAccepted: boolean;
  }) => void;
}

export function HandoverAgreementForm({
  inquiry,
  listingFee,
  listingItems,
  onAgree,
}: HandoverAgreementFormProps) {
  const [agreedFee, setAgreedFee] = useState(listingFee.toString());
  const [selectedItems, setSelectedItems] = useState<string[]>(listingItems);
  const [liabilityAccepted, setLiabilityAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!liabilityAccepted) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onAgree({
        agreedFee: parseInt(agreedFee, 10),
        agreedItems: selectedItems,
        liabilityAccepted: true,
      });
      setIsSubmitting(false);
    }, 500);
  };

  const toggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="p-6 bg-muted/30 rounded-2xl border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        引き継ぎ条件の合意
      </h3>

      {/* 引き継ぎ費用 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          合意する引き継ぎ費用
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={agreedFee}
            onChange={(e) => setAgreedFee(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground"
          />
          <span className="text-foreground">円</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          提示価格: {listingFee.toLocaleString()}円
        </p>
      </div>

      {/* 残置物リスト */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          引き継ぐ残置物
        </label>
        <div className="flex flex-wrap gap-2">
          {listingItems.map((item) => (
            <button
              key={item}
              onClick={() => toggleItem(item)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedItems.includes(item)
                  ? 'bg-foreground text-white'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 免責条件 */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={liabilityAccepted}
            onChange={(e) => setLiabilityAccepted(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-border text-coral accent-coral"
          />
          <div>
            <span className="text-sm font-medium text-foreground">
              残置物は私的譲渡物であり、大家・管理会社は性能保証・修理義務を負わないことを理解し、
              自己責任で受領することに同意します
            </span>
          </div>
        </label>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!liabilityAccepted || isSubmitting}
        className="w-full bg-coral hover:bg-coral/90 text-white"
      >
        {isSubmitting ? '送信中...' : '条件に合意する'}
      </Button>
    </div>
  );
}
