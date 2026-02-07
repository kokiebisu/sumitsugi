/**
 * 家具の2層構造: コアセット（基本セット）+ 追加家具（個別オプション）
 *
 * コアセット: 暮らしの基本家具。セット価格で一括引き継ぎ。
 * 追加家具: 個別オプション。次の住人が個別に選択可能。
 */

export type FurnitureLayer = 'core' | 'additional';

export interface FurnitureLayerItem {
  id: string;
  label: string;
  layer: FurnitureLayer;
  iconName: string; // Lucide icon name reference
}

/**
 * 家具アイテムの2層分類定義
 *
 * core: テーブル、ソファ、ベッド、デスク（部屋の基本構成）
 * additional: 収納、ワードローブ、テレビ台、冷蔵庫（個別オプション）
 */
export const FURNITURE_LAYER_ITEMS: readonly FurnitureLayerItem[] = [
  // コアセット（基本セット）
  { id: 'bed', label: 'ベッド', layer: 'core', iconName: 'BedDouble' },
  { id: 'sofa', label: 'ソファ', layer: 'core', iconName: 'Sofa' },
  { id: 'desk', label: 'デスク', layer: 'core', iconName: 'Monitor' },
  { id: 'table', label: 'テーブル', layer: 'core', iconName: 'Table2' },
  {
    id: 'dining',
    label: 'ダイニング',
    layer: 'core',
    iconName: 'UtensilsCrossed',
  },
  // 追加家具（個別オプション）
  { id: 'storage', label: '収納', layer: 'additional', iconName: 'Archive' },
  {
    id: 'wardrobe',
    label: 'ワードローブ',
    layer: 'additional',
    iconName: 'Shirt',
  },
  { id: 'tv', label: 'テレビ台', layer: 'additional', iconName: 'Tv' },
  {
    id: 'fridge',
    label: '冷蔵庫',
    layer: 'additional',
    iconName: 'Refrigerator',
  },
] as const;

const LAYER_LABELS: Record<FurnitureLayer, string> = {
  core: 'コアセット（基本セット）',
  additional: '追加家具（個別オプション）',
};

export function getCoreFurniture(): FurnitureLayerItem[] {
  return FURNITURE_LAYER_ITEMS.filter((f) => f.layer === 'core');
}

export function getAdditionalFurniture(): FurnitureLayerItem[] {
  return FURNITURE_LAYER_ITEMS.filter((f) => f.layer === 'additional');
}

export function isCoreFurniture(id: string): boolean {
  return FURNITURE_LAYER_ITEMS.some((f) => f.id === id && f.layer === 'core');
}

export function getLayerLabel(layer: FurnitureLayer): string {
  return LAYER_LABELS[layer];
}
