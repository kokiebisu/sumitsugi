// 引き継ぎ費用見積もりサービス
// 現在はモック実装、後でClaude APIに切り替え可能

export interface EstimateInput {
  furniture: string[];
  area: string;
  rent?: number;
  layout?: string;
}

export interface EstimateResult {
  disposalCostMin: number; // 処分費用（最小）
  disposalCostMax: number; // 処分費用（最大）
  handoverFeeMin: number; // 引き継ぎ金額（最小）
  handoverFeeMax: number; // 引き継ぎ金額（最大）
  savingsMin: number; // 差額（最小）
  savingsMax: number; // 差額（最大）
  breakdown: {
    item: string;
    disposalCost: number;
    handoverValue: number;
  }[];
}

// 家具ごとの処分費用と引き継ぎ価値の目安（モックデータ）
const FURNITURE_VALUES: Record<string, { disposal: number; handover: number }> =
  {
    bed: { disposal: 8000, handover: 15000 },
    sofa: { disposal: 6000, handover: 12000 },
    desk: { disposal: 4000, handover: 8000 },
    table: { disposal: 3000, handover: 6000 },
    storage: { disposal: 5000, handover: 10000 },
    wardrobe: { disposal: 7000, handover: 12000 },
    tv: { disposal: 3000, handover: 5000 },
    fridge: { disposal: 6000, handover: 10000 },
  };

const FURNITURE_LABELS: Record<string, string> = {
  bed: 'ベッド',
  sofa: 'ソファ',
  desk: 'デスク',
  table: 'テーブル',
  storage: '収納',
  wardrobe: 'ワードローブ',
  tv: 'テレビ台',
  fridge: '冷蔵庫',
};

// モック実装：家具リストから見積もりを計算
function calculateMockEstimate(input: EstimateInput): EstimateResult {
  const breakdown: EstimateResult['breakdown'] = [];
  let totalDisposal = 0;
  let totalHandover = 0;

  for (const item of input.furniture) {
    const values = FURNITURE_VALUES[item];
    if (values) {
      // ランダム性を加えてリアリティを出す（±20%）
      const disposalVariance = 0.8 + Math.random() * 0.4;
      const handoverVariance = 0.8 + Math.random() * 0.4;

      const disposal = Math.round(values.disposal * disposalVariance);
      const handover = Math.round(values.handover * handoverVariance);

      breakdown.push({
        item: FURNITURE_LABELS[item] || item,
        disposalCost: disposal,
        handoverValue: handover,
      });

      totalDisposal += disposal;
      totalHandover += handover;
    }
  }

  // エリアによる補正（都心は少し高め）
  const premiumAreas = ['渋谷区', '港区', '目黒区', '世田谷区'];
  const isPremium = premiumAreas.some((a) => input.area.includes(a));
  if (isPremium) {
    totalHandover = Math.round(totalHandover * 1.1);
  }

  // レンジを計算（±15%）、1000円単位に丸める
  const disposalMin = roundToThousand(totalDisposal * 0.85);
  const disposalMax = roundToThousand(totalDisposal * 1.15);
  const handoverMin = roundToThousand(totalHandover * 0.85);
  const handoverMax = roundToThousand(totalHandover * 1.15);

  return {
    disposalCostMin: disposalMin,
    disposalCostMax: disposalMax,
    handoverFeeMin: handoverMin,
    handoverFeeMax: handoverMax,
    savingsMin: handoverMin + disposalMin,
    savingsMax: handoverMax + disposalMax,
    breakdown,
  };
}

// Claude APIを使った見積もり計算
async function calculateAIEstimate(
  input: EstimateInput
): Promise<EstimateResult> {
  const response = await fetch('/api/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as EstimateResult;
}

// AI実装を使用するかどうかのフラグ
// 環境変数 NEXT_PUBLIC_USE_AI_ESTIMATE=true で有効化
const USE_AI = process.env.NEXT_PUBLIC_USE_AI_ESTIMATE === 'true';

export async function getEstimate(
  input: EstimateInput
): Promise<EstimateResult> {
  // 家具が選択されていない場合はデフォルト値を返す
  if (input.furniture.length === 0) {
    return {
      disposalCostMin: 0,
      disposalCostMax: 0,
      handoverFeeMin: 0,
      handoverFeeMax: 0,
      savingsMin: 0,
      savingsMax: 0,
      breakdown: [],
    };
  }

  if (USE_AI) {
    try {
      return await calculateAIEstimate(input);
    } catch (error) {
      // AI APIが失敗した場合はモック実装にフォールバック
      console.error('AI estimate failed, falling back to mock:', error);
    }
  }

  // モック実装を使用
  // 少し遅延を入れてAPIっぽく見せる
  await new Promise((resolve) => setTimeout(resolve, 800));
  return calculateMockEstimate(input);
}

// 金額を1000円単位に丸める
export function roundToThousand(price: number): number {
  return Math.round(price / 1000) * 1000;
}

// 金額をフォーマット
export function formatPrice(price: number): string {
  return price.toLocaleString('ja-JP');
}

// レンジをフォーマット
export function formatPriceRange(min: number, max: number): string {
  if (min === max) {
    return `${formatPrice(min)}円`;
  }
  return `${formatPrice(min)}〜${formatPrice(max)}円`;
}
