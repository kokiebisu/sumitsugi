/**
 * オーナー説明資料PDF生成（Phase 2 / Phase A）
 *
 * 管理会社がオーナーにそのまま転送できる説明資料を生成。
 * sumitsugiの仕組み・メリットを説明し、承認を得るためのPDF。
 */

import type { FurnitureItem } from '../data';
import { furnitureLabels } from '../data';
import { isCoreFurniture, getLayerLabel } from '../furniture-layers';

interface OwnerExplanationFurnitureItem {
  name: string;
  category: string;
  description?: string;
}

export interface OwnerExplanationDocumentProps {
  propertyName: string;
  propertyAddress: string;
  moveOutDate: string;
  sellerName: string;
  furnitureItems: OwnerExplanationFurnitureItem[];
  createdDate: string;
}

interface BuildOwnerExplanationInput {
  propertyName: string;
  propertyAddress: string;
  moveOutDate: string;
  sellerName: string;
  furnitureItems: FurnitureItem[];
}

/**
 * Maps property furniture items to owner explanation document format.
 * Each item gets a Japanese label and layer-based category.
 */
function mapFurnitureToOwnerExplanationItems(
  items: FurnitureItem[]
): OwnerExplanationFurnitureItem[] {
  return items.map((item) => {
    const layer = isCoreFurniture(item.type) ? 'core' : 'additional';

    return {
      name: furnitureLabels[item.type] ?? item.type,
      category: getLayerLabel(layer),
      description: item.notes,
    };
  });
}

/**
 * Formats an ISO date string (YYYY-MM-DD) as a Japanese date (YYYY年M月D日).
 */
function formatJapaneseDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Builds complete props for the OwnerExplanationDocument PDF component
 * from property data.
 */
export function buildOwnerExplanationProps(
  input: BuildOwnerExplanationInput
): OwnerExplanationDocumentProps {
  const now = new Date();
  const createdDate = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    propertyName: input.propertyName,
    propertyAddress: input.propertyAddress,
    moveOutDate: formatJapaneseDate(input.moveOutDate),
    sellerName: input.sellerName,
    furnitureItems: mapFurnitureToOwnerExplanationItems(input.furnitureItems),
    createdDate,
  };
}
