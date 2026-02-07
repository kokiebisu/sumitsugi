// 値付けガイダンス（F-105）
// カテゴリ別の参考価格帯と状態による補正

export type FurnitureCondition = 'excellent' | 'good' | 'fair';

export interface PriceRange {
  min: number;
  max: number;
}

export interface FurniturePriceGuide {
  id: string;
  label: string;
  baseRange: PriceRange;
  popularRange: PriceRange;
  conditionMultiplier: Record<FurnitureCondition, number>;
}

export const CONDITION_LABELS: Record<FurnitureCondition, string> = {
  excellent: '良好',
  good: '普通',
  fair: '使用感あり',
};

// 静的な参考価格テーブル（MVP: 固定値）
export const FURNITURE_PRICE_GUIDES: FurniturePriceGuide[] = [
  {
    id: 'bed',
    label: 'ベッド',
    baseRange: { min: 5000, max: 40000 },
    popularRange: { min: 10000, max: 25000 },
    conditionMultiplier: { excellent: 1.2, good: 1.0, fair: 0.7 },
  },
  {
    id: 'sofa',
    label: 'ソファ',
    baseRange: { min: 3000, max: 35000 },
    popularRange: { min: 8000, max: 20000 },
    conditionMultiplier: { excellent: 1.2, good: 1.0, fair: 0.7 },
  },
  {
    id: 'desk',
    label: 'デスク',
    baseRange: { min: 2000, max: 20000 },
    popularRange: { min: 5000, max: 12000 },
    conditionMultiplier: { excellent: 1.2, good: 1.0, fair: 0.7 },
  },
  {
    id: 'table',
    label: 'テーブル',
    baseRange: { min: 5000, max: 30000 },
    popularRange: { min: 8000, max: 18000 },
    conditionMultiplier: { excellent: 1.2, good: 1.0, fair: 0.7 },
  },
  {
    id: 'storage',
    label: '収納',
    baseRange: { min: 3000, max: 25000 },
    popularRange: { min: 5000, max: 15000 },
    conditionMultiplier: { excellent: 1.2, good: 1.0, fair: 0.7 },
  },
  {
    id: 'wardrobe',
    label: 'ワードローブ',
    baseRange: { min: 5000, max: 30000 },
    popularRange: { min: 8000, max: 20000 },
    conditionMultiplier: { excellent: 1.2, good: 1.0, fair: 0.7 },
  },
  {
    id: 'tv',
    label: 'テレビ台',
    baseRange: { min: 2000, max: 15000 },
    popularRange: { min: 3000, max: 8000 },
    conditionMultiplier: { excellent: 1.2, good: 1.0, fair: 0.7 },
  },
  {
    id: 'fridge',
    label: '冷蔵庫',
    baseRange: { min: 5000, max: 35000 },
    popularRange: { min: 8000, max: 20000 },
    conditionMultiplier: { excellent: 1.2, good: 1.0, fair: 0.7 },
  },
];

// カテゴリIDからガイドを取得
export function getPriceGuide(
  furnitureId: string
): FurniturePriceGuide | undefined {
  return FURNITURE_PRICE_GUIDES.find((g) => g.id === furnitureId);
}

// 状態補正を適用した価格帯を取得
export function getAdjustedRange(
  guide: FurniturePriceGuide,
  condition: FurnitureCondition
): PriceRange {
  const multiplier = guide.conditionMultiplier[condition];
  return {
    min: Math.round((guide.baseRange.min * multiplier) / 1000) * 1000,
    max: Math.round((guide.baseRange.max * multiplier) / 1000) * 1000,
  };
}

// 人気価格帯に含まれるかチェック
export function isInPopularRange(
  guide: FurniturePriceGuide,
  price: number
): boolean {
  return price >= guide.popularRange.min && price <= guide.popularRange.max;
}

// 選択された家具の合計参考価格帯を計算
export function getTotalPriceRange(
  furnitureIds: string[],
  condition: FurnitureCondition = 'good'
): PriceRange {
  let totalMin = 0;
  let totalMax = 0;

  for (const id of furnitureIds) {
    const guide = getPriceGuide(id);
    if (guide) {
      const adjusted = getAdjustedRange(guide, condition);
      totalMin += adjusted.min;
      totalMax += adjusted.max;
    }
  }

  return { min: totalMin, max: totalMax };
}
