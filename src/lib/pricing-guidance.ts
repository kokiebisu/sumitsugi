// 値付けガイダンス（F-105）
// カテゴリ別の参考価格帯と状態による補正
// 減価テーブル: 使用年数×新品価格による目安レンジ

export type FurnitureCondition = 'excellent' | 'good' | 'fair';

export type FurnitureCategory =
  | 'bed'
  | 'sofa'
  | 'desk'
  | 'table'
  | 'storage'
  | 'wardrobe'
  | 'tv'
  | 'fridge';

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

// === 減価テーブル（使用年数→残価率） ===
// カテゴリ別に使用年数から残価率を算出
// 家具: 耐用年数5-8年、家電: 耐用年数6-10年を目安

type DepreciationRates = Record<number, number>;

export const DEPRECIATION_TABLE: Record<FurnitureCategory, DepreciationRates> =
  {
    bed: { 0: 1.0, 1: 0.8, 2: 0.65, 3: 0.5, 5: 0.3, 7: 0.15, 10: 0.1 },
    sofa: { 0: 1.0, 1: 0.75, 2: 0.6, 3: 0.45, 5: 0.25, 7: 0.15, 10: 0.1 },
    desk: { 0: 1.0, 1: 0.85, 2: 0.7, 3: 0.55, 5: 0.35, 7: 0.2, 10: 0.1 },
    table: { 0: 1.0, 1: 0.8, 2: 0.65, 3: 0.5, 5: 0.3, 7: 0.15, 10: 0.1 },
    storage: {
      0: 1.0,
      1: 0.85,
      2: 0.7,
      3: 0.55,
      5: 0.35,
      7: 0.2,
      10: 0.1,
    },
    wardrobe: {
      0: 1.0,
      1: 0.85,
      2: 0.7,
      3: 0.55,
      5: 0.35,
      7: 0.2,
      10: 0.1,
    },
    tv: { 0: 1.0, 1: 0.7, 2: 0.5, 3: 0.35, 5: 0.2, 7: 0.1, 10: 0.05 },
    fridge: { 0: 1.0, 1: 0.8, 2: 0.65, 3: 0.5, 5: 0.35, 7: 0.2, 10: 0.1 },
  };

// 使用年数からカテゴリ別の残価率を取得（線形補間）
export function getResidualRate(
  category: FurnitureCategory,
  yearsOfUse: number
): number {
  const rates = DEPRECIATION_TABLE[category];
  if (!rates) return 0.1;

  if (yearsOfUse <= 0) return 1.0;

  const years = Object.keys(rates)
    .map(Number)
    .sort((a, b) => a - b);

  // 最大年数を超えた場合は最低残価率を返す
  const maxYear = years[years.length - 1];
  if (yearsOfUse >= maxYear) return rates[maxYear];

  // 該当年数がテーブルにある場合
  if (rates[yearsOfUse] !== undefined) return rates[yearsOfUse];

  // 線形補間
  let lowerYear = 0;
  let upperYear = maxYear;
  for (const y of years) {
    if (y < yearsOfUse) lowerYear = y;
    if (y > yearsOfUse && y < upperYear) upperYear = y;
  }

  const lowerRate = rates[lowerYear];
  const upperRate = rates[upperYear];
  const fraction = (yearsOfUse - lowerYear) / (upperYear - lowerYear);
  return lowerRate + (upperRate - lowerRate) * fraction;
}

// 減価計算結果
export interface DepreciatedPriceResult {
  newPrice: number;
  depreciatedPrice: number;
  residualRate: number;
  discountRate: number;
}

// 新品価格と使用年数から減価後の目安価格を算出
export function calculateDepreciatedPrice(
  category: FurnitureCategory,
  newPrice: number,
  yearsOfUse: number
): DepreciatedPriceResult {
  const residualRate = getResidualRate(category, yearsOfUse);
  const depreciatedPrice = Math.round((newPrice * residualRate) / 1000) * 1000;
  const discountRate = calculateDiscountRate(depreciatedPrice, newPrice);

  return {
    newPrice,
    depreciatedPrice,
    residualRate,
    discountRate,
  };
}

// 家具リストの新品合計価格を計算（baseRangeの中央値を使用）
export function calculateNewPriceTotal(furnitureIds: string[]): number {
  return furnitureIds.reduce((total, id) => {
    const guide = getPriceGuide(id);
    if (!guide) return total;
    const midpoint =
      Math.round((guide.baseRange.min + guide.baseRange.max) / 2 / 1000) * 1000;
    return total + midpoint;
  }, 0);
}

// 割引率を計算（新品価格に対する割引%）
export function calculateDiscountRate(
  handoverFee: number,
  newPriceTotal: number
): number {
  if (newPriceTotal <= 0) return 0;
  const ratio = handoverFee / newPriceTotal;
  const discount = Math.round((1 - ratio) * 100);
  return Math.max(0, discount);
}
