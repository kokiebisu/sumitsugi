'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { UserListing } from '@/lib/data';
import { FileText, Download, Check } from 'lucide-react';

interface HandoverAgreementSummaryProps {
  listing: UserListing;
  hostName: string;
  applicantName?: string;
  agreedFee?: number;
}

// 家具・家電のラベル
const ITEM_LABELS: Record<string, string> = {
  bed: 'ベッド',
  sofa: 'ソファ',
  desk: 'デスク',
  storage: '収納',
  table: 'テーブル',
  wardrobe: 'ワードローブ',
  tv: 'テレビ台',
  fridge: '冷蔵庫',
  washer: '洗濯機',
  dryer: '乾燥機',
  ac: 'エアコン',
};

export function HandoverAgreementSummary({
  listing,
  hostName,
  applicantName,
  agreedFee,
}: HandoverAgreementSummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const furniture = listing.furniture || [];
  const allItems = [...furniture];
  const fee = agreedFee ?? listing.handoverFee ?? 0;
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const generateSummaryText = () => {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
残置物譲渡合意サマリー
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

作成日: ${today}

【当事者】
譲渡者（前入居者）: ${hostName}
譲受者（次入居者）: ${applicantName || '（未定）'}

【物件情報】
物件名: ${listing.title}
エリア: ${listing.area || '未設定'}
間取り: ${listing.layout || '未設定'}

【譲渡対象物】
${allItems.map((item: string) => `- ${ITEM_LABELS[item] || item}`).join('\n')}

【譲渡金額】
${fee.toLocaleString()}円

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
責任区分に関する合意事項
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 本合意書に記載の残置物は、前入居者から次入居者への
   私的譲渡物であり、賃貸借契約とは独立した取引です。

2. 大家・管理会社は、譲渡対象物について以下の義務を負いません。
   - 性能保証
   - 修理義務
   - 故障・事故時の責任

3. 譲受者は、内見時に対象物の現物確認を行い、
   その状態を了承した上で自己責任にて受領します。

4. 譲渡対象物に起因する事故・故障・損害について、
   譲渡者および大家・管理会社は責任を負いません。


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
署名欄
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

譲渡者署名: ____________________  日付: ____年____月____日

譲受者署名: ____________________  日付: ____年____月____日


※本書面は大家・管理会社への説明資料としてもご利用いただけます。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 800);
  };

  const handleDownload = () => {
    const text = generateSummaryText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `譲渡合意サマリー_${listing.title}_${today}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-muted/30 rounded-2xl border border-border">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-coral" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            譲渡合意サマリー
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            大家・管理会社への説明資料として利用できる1枚の合意書を生成します
          </p>

          {/* プレビュー */}
          {isGenerated && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-border">
              <div className="text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                {generateSummaryText().slice(0, 500)}...
              </div>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3">
            {!isGenerated ? (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || allItems.length === 0}
                className="bg-coral hover:bg-coral/90 text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    生成中...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    サマリーを生成
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleDownload}
                  className="bg-foreground hover:bg-foreground/90 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ダウンロード
                </Button>
                <div className="flex items-center text-sm text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  生成完了
                </div>
              </>
            )}
          </div>

          {allItems.length === 0 && (
            <p className="text-sm text-amber-600 mt-2">
              譲渡対象物を選択してください
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
